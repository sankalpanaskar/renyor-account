import { Component, HostListener, OnInit } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { GlobalService } from '../../../services/global.service';
import { normalizeAccountHeadName, STATIC_ACCOUNT_HEAD_NAMES } from '../static-account-heads';

interface AccountGroup {
  id: number;
  group_name: string;
  parent_id: number;
  status: number;
}

interface AccountGroupNode extends AccountGroup {
  children: AccountGroup[];
}

interface AccountItemOption {
  id: number;
  accountName: string;
  accountItem: string;
  accountTypeId: number;
  accountTypeName: string;
}

interface ChartOfAccountsNode {
  id: number | null;
  type: string;
  groupName: string;
  accountName: string;
  accountItem: string;
  parentId: number | null;
  accountTypeId: number | null;
  children: ChartOfAccountsNode[];
  depth: number;
  key: string;
  expanded: boolean;
}

@Component({
  selector: 'ngx-chart-of-account',
  templateUrl: './chart-of-account.component.html',
  styleUrls: ['./chart-of-account.component.scss'],
})
export class ChartOfAccountComponent implements OnInit {
  showAddPopup = false;
  accountGroups: AccountGroup[] = [];
  accountTree: AccountGroupNode[] = [];

  model: any = {
    account_head: '',
    account_type: '',
    account_name: '',
    account_item: '',
  };

  accountHeads: AccountGroup[] = [];

  accountTypes: AccountGroup[] = [];
  selectedAccountTypeId: number | string = '';

  isAccountNameOpen = false;
  activeAccountNameIndex = -1;
  isAccountItemOpen = false;
  activeAccountItemIndex = -1;
  isAccountTypeCommitted = false;
  isAccountNameCommitted = false;
  isExistingAccountTypeSelected = false;
  isExistingAccountNameSelected = false;
  isLoadingAccountNames = false;
  accountNamesLoadFailed = false;
  isSubmitting = false;

  chartOfAccounts: ChartOfAccountsNode[] = [];
  treeSearchTerm = '';

  accountNames: string[] = [];
  accountItemOptions: AccountItemOption[] = [];

  constructor(
    private globalService: GlobalService,
    private toastService: NbToastrService,
  ) {}

  ngOnInit(): void {
    this.fetchAccountHeadTypes();
    this.fetchAccountNames();
  }

  fetchAccountNames(): void {
    this.isLoadingAccountNames = true;
    this.accountNamesLoadFailed = false;

    this.globalService.getAccountItem().subscribe({
      next: (res: any) => {
        const payload = res?.data ?? res;

        if (payload && !Array.isArray(payload) && Array.isArray(payload.children)) {
          this.chartOfAccounts = payload.children.map((node: any, index: number) =>
            this.normalizeTreeNode(node, 0, `root-${index}`),
          );
          this.accountItemOptions = this.getAccountOptionsFromTree(this.chartOfAccounts);
        } else {
          const rows = Array.isArray(payload) ? payload : [];
          this.accountItemOptions = this.mapFlatAccountItems(rows);
          this.chartOfAccounts = this.buildTreeFromFlatItems(this.accountItemOptions);
        }

        this.accountNames = this.getUniqueValues(
          this.accountItemOptions.map((item: AccountItemOption) => item.accountName),
        );
        this.isLoadingAccountNames = false;
      },
      error: (error: any) => {
        console.error('Failed to fetch account names:', error);
        this.accountNames = [];
        this.accountItemOptions = [];
        this.chartOfAccounts = [];
        this.accountNamesLoadFailed = true;
        this.isLoadingAccountNames = false;
      },
    });
  }

  private mapFlatAccountItems(rows: any[]): AccountItemOption[] {
    return rows
      .map((item: any) => ({
        id: Number(item?.id || 0),
        accountName: this.normalizeAccountName(item?.account_name),
        accountItem: this.normalizeAccountName(item?.account_item),
        accountTypeId: Number(
          item?.chartofaccounts_head_type_id
          ?? item?.account_head_type_id
          ?? item?.account_type_id
          ?? item?.account_type?.id
          ?? 0,
        ),
        accountTypeName: this.normalizeAccountName(
          item?.account_type
          ?? item?.account_type_name
          ?? item?.chartofaccounts_head_type?.group_name
          ?? item?.account_type_detail?.group_name,
        ),
      }))
      .filter((item: AccountItemOption) => !!item.accountName || !!item.accountItem);
  }

  private normalizeTreeNode(node: any, depth: number, path: string): ChartOfAccountsNode {
    const children = Array.isArray(node?.children) ? node.children : [];
    const type = this.normalizeAccountName(node?.type || 'account').toLowerCase();

    return {
      id: node?.id === null || node?.id === undefined ? null : Number(node.id),
      type,
      groupName: this.normalizeAccountName(node?.group_name),
      accountName: this.normalizeAccountName(node?.account_name),
      accountItem: this.normalizeAccountName(node?.account_item),
      parentId: node?.parent_id === null || node?.parent_id === undefined
        ? null
        : Number(node.parent_id),
      accountTypeId: node?.chartofaccounts_head_type_id === null
        || node?.chartofaccounts_head_type_id === undefined
        ? null
        : Number(node.chartofaccounts_head_type_id),
      children: children.map((child: any, index: number) =>
        this.normalizeTreeNode(child, depth + 1, `${path}-${index}`),
      ),
      depth,
      key: `${path}-${type}-${node?.id ?? 'new'}`,
      expanded: children.length > 0,
    };
  }

  private getAccountOptionsFromTree(nodes: ChartOfAccountsNode[]): AccountItemOption[] {
    const options: AccountItemOption[] = [];

    const visit = (
      node: ChartOfAccountsNode,
      nearestGroup?: ChartOfAccountsNode,
      inheritedAccountName = '',
    ): void => {
      const currentGroup = node.type === 'group' ? node : nearestGroup;
      const accountName = node.accountName || inheritedAccountName;

      if ((node.type === 'account' || node.type === 'account_item')
        && (accountName || node.accountItem)) {
        options.push({
          id: Number(node.id || 0),
          accountName,
          accountItem: node.accountItem || accountName,
          accountTypeId: Number(node.accountTypeId || currentGroup?.id || 0),
          accountTypeName: currentGroup?.groupName || '',
        });
      }

      node.children.forEach((child: ChartOfAccountsNode) =>
        visit(child, currentGroup, accountName),
      );
    };

    nodes.forEach((node: ChartOfAccountsNode) => visit(node));
    return options;
  }

  private buildTreeFromFlatItems(items: AccountItemOption[]): ChartOfAccountsNode[] {
    const grouped = new Map<string, AccountItemOption[]>();
    items.forEach((item: AccountItemOption) => {
      const groupName = item.accountTypeName || 'Other Accounts';
      grouped.set(groupName, [...(grouped.get(groupName) || []), item]);
    });

    return Array.from(grouped.entries()).map(([groupName, groupItems], groupIndex) => ({
      id: null,
      type: 'group',
      groupName,
      accountName: '',
      accountItem: '',
      parentId: null,
      accountTypeId: null,
      depth: 0,
      key: `flat-group-${groupIndex}`,
      expanded: true,
      children: groupItems.map((item: AccountItemOption, itemIndex: number) => ({
        id: item.id,
        type: 'account',
        groupName: '',
        accountName: item.accountName,
        accountItem: item.accountItem,
        parentId: null,
        accountTypeId: item.accountTypeId,
        children: [],
        depth: 1,
        key: `flat-group-${groupIndex}-item-${itemIndex}-${item.id}`,
        expanded: false,
      })),
    }));
  }

  fetchAccountHeadTypes(): void {
    this.globalService.getAccountHeadType().subscribe({
      next: (res: any) => {
        this.setAccountGroupsFromResponse(res);
      },
      error: (error: any) => {
        console.error('Failed to fetch account head/type list:', error);
        this.accountGroups = [];
        this.buildAccountTree();
      },
    });
  }

  onAccountHeadChange(): void {
    const selectedHeadId = Number(this.model.account_head || 0);
    this.model.account_type = '';
    this.model.account_name = '';
    this.model.account_item = '';
    this.selectedAccountTypeId = '';
    this.accountTypes = this.getChildGroups(selectedHeadId);
    this.isAccountTypeCommitted = false;
    this.isAccountNameCommitted = false;
    this.isExistingAccountTypeSelected = false;
    this.isExistingAccountNameSelected = false;
    this.closeAccountNameSuggestions();
    this.closeAccountItemSuggestions();
  }

  private setAccountGroupsFromResponse(res: any): void {
    const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    this.accountGroups = rows
      .map((row: any) => ({
        id: Number(row?.id || 0),
        group_name: `${row?.group_name ?? ''}`.trim(),
        parent_id: Number(row?.parent_id || 0),
        status: Number(row?.status ?? 1),
      }))
      .filter((row: AccountGroup) => row.id > 0 && !!row.group_name && row.status === 1);

    this.buildAccountTree();
  }

  private getGroupNameById(id: any): string {
    const groupId = Number(id || 0);
    const matchedGroup = this.accountGroups.find((group: AccountGroup) => group.id === groupId)
      || this.accountHeads.find((group: AccountGroup) => group.id === groupId);
    return matchedGroup?.group_name || '';
  }

  private getChildGroups(parentId: number): AccountGroup[] {
    if (!parentId) {
      return [];
    }

    return this.accountGroups.filter((group: AccountGroup) => group.parent_id === parentId);
  }

  private buildAccountTree(): void {
    const fetchedAccountHeads = this.accountGroups.filter((group: AccountGroup) => group.parent_id === 0);
    this.accountHeads = STATIC_ACCOUNT_HEAD_NAMES.map((headName: string, index: number) => {
      const fetchedHead = fetchedAccountHeads.find((group: AccountGroup) =>
        normalizeAccountHeadName(group.group_name) === normalizeAccountHeadName(headName)
      );
      return fetchedHead || {
        id: -(index + 1),
        group_name: headName,
        parent_id: 0,
        status: 1,
      };
    });
    this.accountTree = this.accountHeads.map((head: AccountGroup) => ({
      ...head,
      children: this.getChildGroups(head.id),
    }));
    this.accountTypes = this.getChildGroups(Number(this.model.account_head || 0));
  }

  openAddPopup(): void {
    this.showAddPopup = true;
  }

  closeAddPopup(form?: any): void {
    if (this.isSubmitting) {
      return;
    }

    this.showAddPopup = false;
    this.isAccountNameOpen = false;
    this.activeAccountNameIndex = -1;
    this.isAccountItemOpen = false;
    this.activeAccountItemIndex = -1;
    this.isAccountTypeCommitted = false;
    this.isAccountNameCommitted = false;
    this.isExistingAccountTypeSelected = false;
    this.isExistingAccountNameSelected = false;
    this.selectedAccountTypeId = '';
    this.model = {
      account_head: '',
      account_type: '',
      account_name: '',
      account_item: '',
    };
    if (form) {
      form.resetForm();
    }
  }

  private normalizeAccountName(value: any): string {
    return `${value ?? ''}`.trim();
  }

  private getUniqueValues(values: string[]): string[] {
    const uniqueValues = new Map<string, string>();
    values.forEach((value: string) => {
      const normalizedValue = this.normalizeAccountName(value);
      const comparisonValue = normalizedValue.toLowerCase();
      if (normalizedValue && !uniqueValues.has(comparisonValue)) {
        uniqueValues.set(comparisonValue, normalizedValue);
      }
    });
    return Array.from(uniqueValues.values());
  }

  get visibleAccountTree(): ChartOfAccountsNode[] {
    const searchTerm = this.normalizeAccountName(this.treeSearchTerm).toLowerCase();
    if (!searchTerm) {
      return this.chartOfAccounts;
    }

    return this.chartOfAccounts
      .map((node: ChartOfAccountsNode) => this.filterTreeNode(node, searchTerm))
      .filter((node: ChartOfAccountsNode | null): node is ChartOfAccountsNode => !!node);
  }

  get totalAccountHeads(): number {
    return this.chartOfAccounts.filter((node: ChartOfAccountsNode) => node.type === 'group').length;
  }

  get totalAccountTypes(): number {
    return Math.max(0, this.countNodesByType(this.chartOfAccounts, 'group') - this.totalAccountHeads);
  }

  get totalAccountNames(): number {
    return this.accountNames.length;
  }

  get totalAccountItems(): number {
    return this.accountItemOptions.length;
  }

  private countNodesByType(nodes: ChartOfAccountsNode[], type: string): number {
    return nodes.reduce((total: number, node: ChartOfAccountsNode) =>
      total + (node.type === type ? 1 : 0) + this.countNodesByType(node.children, type), 0);
  }

  private filterTreeNode(node: ChartOfAccountsNode, searchTerm: string): ChartOfAccountsNode | null {
    const searchableText = [node.groupName, node.accountName, node.accountItem, node.type]
      .join(' ')
      .toLowerCase();
    const matches = searchableText.includes(searchTerm);

    if (matches) {
      return this.cloneTreeNode(node, true);
    }

    const matchingChildren = node.children
      .map((child: ChartOfAccountsNode) => this.filterTreeNode(child, searchTerm))
      .filter((child: ChartOfAccountsNode | null): child is ChartOfAccountsNode => !!child);

    return matchingChildren.length > 0
      ? { ...node, expanded: true, children: matchingChildren }
      : null;
  }

  private cloneTreeNode(node: ChartOfAccountsNode, expanded: boolean): ChartOfAccountsNode {
    return {
      ...node,
      expanded: expanded && node.children.length > 0,
      children: node.children.map((child: ChartOfAccountsNode) => this.cloneTreeNode(child, expanded)),
    };
  }

  toggleTreeNode(node: ChartOfAccountsNode): void {
    if (!node.children.length || this.treeSearchTerm) {
      return;
    }

    const originalNode = this.findTreeNode(this.chartOfAccounts, node.key);
    if (originalNode) {
      originalNode.expanded = !originalNode.expanded;
    }
  }

  expandAll(): void {
    this.setTreeExpanded(this.chartOfAccounts, true);
  }

  collapseAll(): void {
    this.setTreeExpanded(this.chartOfAccounts, false);
  }

  private setTreeExpanded(nodes: ChartOfAccountsNode[], expanded: boolean): void {
    nodes.forEach((node: ChartOfAccountsNode) => {
      node.expanded = expanded && node.children.length > 0;
      this.setTreeExpanded(node.children, expanded);
    });
  }

  private findTreeNode(nodes: ChartOfAccountsNode[], key: string): ChartOfAccountsNode | undefined {
    for (const node of nodes) {
      if (node.key === key) {
        return node;
      }
      const child = this.findTreeNode(node.children, key);
      if (child) {
        return child;
      }
    }
    return undefined;
  }

  getNodeLabel(node: ChartOfAccountsNode): string {
    return node.groupName || node.accountItem || node.accountName || 'Untitled account';
  }

  getNodeDetail(node: ChartOfAccountsNode): string {
    if (node.type === 'account_item') {
      return node.accountName;
    }
    if (node.type === 'account' && node.accountName !== node.accountItem) {
      return node.accountName;
    }
    return '';
  }

  getNodeTypeLabel(node: ChartOfAccountsNode): string {
    if (node.type === 'group') {
      return node.depth === 0 ? 'Account Head' : 'Account Type';
    }
    if (node.type === 'account_name') {
      return 'Account Name';
    }
    return 'Account Item';
  }

  getNodeIcon(node: ChartOfAccountsNode): string {
    if (node.type === 'group') {
      return node.depth === 0 ? 'layers-outline' : 'folder-outline';
    }
    return node.type === 'account_name' ? 'briefcase-outline' : 'file-text-outline';
  }

  getNodeItemCount(node: ChartOfAccountsNode): number {
    return node.children.reduce((total: number, child: ChartOfAccountsNode) =>
      total
      + (child.type === 'account' || child.type === 'account_item' ? 1 : 0)
      + this.getNodeItemCount(child), 0);
  }

  get trimmedAccountName(): string {
    return this.normalizeAccountName(this.model.account_name);
  }

  get filteredAccountNames(): string[] {
    const searchTerm = this.trimmedAccountName.toLowerCase();
    const availableNames = this.availableAccountNames;
    const matches = searchTerm
      ? availableNames.filter((name: string) => name.toLowerCase().includes(searchTerm))
      : availableNames;

    return matches.slice(0, 6);
  }

  get availableAccountNames(): string[] {
    if (!this.isAccountTypeCommitted || !this.isExistingAccountTypeSelected) {
      return [];
    }

    const matchingItems = this.filterItemsBySelectedType(this.accountItemOptions);
    return this.getUniqueValues(
      matchingItems.map((item: AccountItemOption) => item.accountName),
    );
  }

  get canUseNewAccountName(): boolean {
    const accountName = this.trimmedAccountName;
    return this.isAccountTypeCommitted && !this.isLoadingAccountNames && !!accountName
      && !this.availableAccountNames.some(
      (name: string) => name.toLowerCase() === accountName.toLowerCase(),
    );
  }

  get trimmedAccountItem(): string {
    return this.normalizeAccountName(this.model.account_item);
  }

  get filteredAccountItems(): string[] {
    if (!this.isAccountNameCommitted || !this.isExistingAccountNameSelected) {
      return [];
    }

    const accountName = this.trimmedAccountName.toLowerCase();
    const itemsForName = this.filterItemsBySelectedType(this.accountItemOptions)
      .filter((item: AccountItemOption) => item.accountName.toLowerCase() === accountName);
    const availableItems = this.getUniqueValues(
      itemsForName.map((item: AccountItemOption) => item.accountItem),
    );
    const searchTerm = this.trimmedAccountItem.toLowerCase();
    const matches = searchTerm
      ? availableItems.filter((item: string) => item.toLowerCase().includes(searchTerm))
      : availableItems;

    return matches.slice(0, 6);
  }

  get canUseNewAccountItem(): boolean {
    const accountItem = this.trimmedAccountItem;
    return this.isAccountNameCommitted && !!accountItem && !this.filteredAccountItems.some(
      (item: string) => item.toLowerCase() === accountItem.toLowerCase(),
    );
  }

  private filterItemsBySelectedType(items: AccountItemOption[]): AccountItemOption[] {
    const selectedType = this.accountTypes.find(
      (type: AccountGroup) => type.group_name.toLowerCase() === this.trimmedAccountType.toLowerCase(),
    );
    if (!this.hasAccountTypeMetadata()) {
      return [];
    }

    return items.filter((item: AccountItemOption) => {
      if (selectedType && item.accountTypeId > 0) {
        return item.accountTypeId === selectedType.id;
      }
      return !!item.accountTypeName
        && item.accountTypeName.toLowerCase() === this.trimmedAccountType.toLowerCase();
    });
  }

  private hasAccountTypeMetadata(): boolean {
    return this.accountItemOptions.some(
      (item: AccountItemOption) => item.accountTypeId > 0 || !!item.accountTypeName,
    );
  }

  get trimmedAccountType(): string {
    return this.normalizeAccountName(this.model.account_type);
  }

  onAccountTypeSelected(selectedId: number | string): void {
    const selectedType = this.accountTypes.find(
      (type: AccountGroup) => type.id === Number(selectedId || 0),
    );
    this.model.account_type = selectedType?.group_name || '';
    this.isAccountTypeCommitted = !!selectedType;
    this.isAccountNameCommitted = false;
    this.isExistingAccountTypeSelected = !!selectedType;
    this.isExistingAccountNameSelected = false;
    this.model.account_name = '';
    this.model.account_item = '';
    this.closeAccountNameSuggestions();
    this.closeAccountItemSuggestions();
  }

  openAccountNameSuggestions(): void {
    if (!this.isAccountTypeCommitted) {
      return;
    }

    this.isAccountNameOpen = true;
    this.activeAccountNameIndex = -1;
  }

  onAccountNameInput(): void {
    this.isAccountNameOpen = true;
    this.activeAccountNameIndex = this.filteredAccountNames.length > 0 ? 0 : -1;
    const accountName = this.trimmedAccountName.toLowerCase();
    this.isAccountNameCommitted = !!accountName;
    this.isExistingAccountNameSelected = !!accountName && this.availableAccountNames.some(
      (name: string) => name.toLowerCase() === accountName,
    );
    this.model.account_item = '';
    this.closeAccountItemSuggestions();
  }

  closeAccountNameSuggestions(): void {
    this.isAccountNameOpen = false;
    this.activeAccountNameIndex = -1;
  }

  selectAccountName(name: string, event?: Event): void {
    event?.preventDefault();
    this.model.account_name = name;
    this.commitAccountName(true);
    this.closeAccountNameSuggestions();
  }

  useNewAccountName(event?: Event): void {
    event?.preventDefault();
    this.model.account_name = this.trimmedAccountName;
    this.commitAccountName(false);
    this.closeAccountNameSuggestions();
  }

  private commitAccountName(isExistingSelection: boolean): void {
    this.isAccountNameCommitted = !!this.trimmedAccountName;
    this.isExistingAccountNameSelected = isExistingSelection;
    this.model.account_item = '';
    this.closeAccountItemSuggestions();
  }

  openAccountItemSuggestions(): void {
    if (!this.isAccountNameCommitted) {
      return;
    }

    this.isAccountItemOpen = true;
    this.activeAccountItemIndex = -1;
  }

  onAccountItemInput(): void {
    this.isAccountItemOpen = true;
    this.activeAccountItemIndex = this.filteredAccountItems.length > 0 ? 0 : -1;
  }

  closeAccountItemSuggestions(): void {
    this.isAccountItemOpen = false;
    this.activeAccountItemIndex = -1;
  }

  selectAccountItem(accountItem: string, event?: Event): void {
    event?.preventDefault();
    this.model.account_item = accountItem;
    this.closeAccountItemSuggestions();
  }

  useNewAccountItem(event?: Event): void {
    event?.preventDefault();
    this.model.account_item = this.trimmedAccountItem;
    this.closeAccountItemSuggestions();
  }

  onAccountItemKeydown(event: KeyboardEvent): void {
    const optionCount = this.filteredAccountItems.length;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.isAccountItemOpen = true;
      this.activeAccountItemIndex = optionCount > 0
        ? (this.activeAccountItemIndex + 1) % optionCount
        : -1;
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.isAccountItemOpen = true;
      this.activeAccountItemIndex = optionCount > 0
        ? (this.activeAccountItemIndex <= 0 ? optionCount - 1 : this.activeAccountItemIndex - 1)
        : -1;
      return;
    }

    if (event.key === 'Enter' && this.isAccountItemOpen) {
      event.preventDefault();
      const activeItem = this.filteredAccountItems[this.activeAccountItemIndex];
      if (activeItem) {
        this.selectAccountItem(activeItem);
      } else {
        this.useNewAccountItem();
      }
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.closeAccountItemSuggestions();
    }
  }

  retryAccountNames(event: Event): void {
    event.preventDefault();
    this.fetchAccountNames();
  }

  onAccountNameKeydown(event: KeyboardEvent): void {
    const optionCount = this.filteredAccountNames.length;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.isAccountNameOpen = true;
      this.activeAccountNameIndex = optionCount > 0
        ? (this.activeAccountNameIndex + 1) % optionCount
        : -1;
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.isAccountNameOpen = true;
      this.activeAccountNameIndex = optionCount > 0
        ? (this.activeAccountNameIndex <= 0 ? optionCount - 1 : this.activeAccountNameIndex - 1)
        : -1;
      return;
    }

    if (event.key === 'Enter' && this.isAccountNameOpen) {
      event.preventDefault();
      if (this.activeAccountNameIndex >= 0 && this.filteredAccountNames[this.activeAccountNameIndex]) {
        this.selectAccountName(this.filteredAccountNames[this.activeAccountNameIndex]);
      } else {
        this.useNewAccountName();
      }
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.closeAccountNameSuggestions();
    }
  }

  onOverlayMouseDown(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeAddPopup();
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (!this.showAddPopup || this.isAccountNameOpen || this.isAccountItemOpen) {
      return;
    }

    event.preventDefault();
    this.closeAddPopup();
  }

  private addAccountNameIfNew(name: string): void {
    if (!name) {
      return;
    }

    const exists = this.accountNames.some((item: string) => item.toLowerCase() === name.toLowerCase());
    if (!exists) {
      this.accountNames = [...this.accountNames, name];
    }
  }

  onSubmit(form: any): void {
    if (!form.valid || this.isSubmitting || !this.isAccountTypeCommitted || !this.isAccountNameCommitted) {
      return;
    }

    const accountName = this.normalizeAccountName(this.model.account_name);
    const accountType = this.trimmedAccountType;
    const accountTypeId = Number(this.selectedAccountTypeId || 0);
    const accountHeadId = Number(this.model.account_head || 0);
    const accountHead = this.getGroupNameById(accountHeadId);
    const accountItem = `${this.model.account_item ?? ''}`.trim();

    if (!accountName || !accountType || !accountTypeId || !accountHead || !accountItem) {
      return;
    }

    this.isSubmitting = true;
    this.globalService.addChartOfAccount({
      chartofaccounts_head_type_id: accountTypeId,
      account_head: accountHead,
      account_type: accountType,
      account_name: accountName,
      account_item: accountItem,
    }).subscribe({
      next: (res: any) => {
        this.addAccountNameIfNew(accountName);
        this.isSubmitting = false;
        this.closeAddPopup(form);
        this.fetchAccountNames();
      },
      error: (error: any) => {
        console.error('Failed to create chart of account:', error);
        this.toastService.show(this.getCreateAccountErrorMessage(error), 'Warning', {
          status: 'warning',
          icon: 'alert-triangle-outline',
          duration: 5000,
        });
        this.isSubmitting = false;
      },
    });
  }

  private getCreateAccountErrorMessage(error: any): string {
    const responseError = error?.error;
    const message = responseError?.message ?? responseError?.msg ?? error?.message;

    if (Array.isArray(message)) {
      return message.filter(Boolean).join(', ');
    }

    if (typeof message === 'string' && message.trim()) {
      return message.trim();
    }

    if (typeof responseError === 'string' && responseError.trim()) {
      return responseError.trim();
    }

    const validationErrors = responseError?.errors;
    if (validationErrors && typeof validationErrors === 'object') {
      const validationMessage = Object.keys(validationErrors)
        .reduce((messages: string[], key: string) => {
          const value = validationErrors[key];
          return messages.concat(Array.isArray(value) ? value : [value]);
        }, [])
        .filter((value: any) => typeof value === 'string' && !!value.trim())
        .join(', ');

      if (validationMessage) {
        return validationMessage;
      }
    }

    return 'Failed to create chart of account';
  }

  trackByGroupId(_index: number, group: AccountGroup): number {
    return group.id;
  }

  trackByTreeNode(_index: number, node: ChartOfAccountsNode): string {
    return node.key;
  }

  trackByAccountName(_index: number, name: string): string {
    return name;
  }
}
