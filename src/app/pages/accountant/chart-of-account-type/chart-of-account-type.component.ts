import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';
import { normalizeAccountHeadName, STATIC_ACCOUNT_HEAD_NAMES } from '../static-account-heads';

interface AccountHeadType {
  id: number;
  group_name: string;
  parent_id: number;
}

interface AccountHeadTypeNode extends AccountHeadType {
  children: AccountHeadType[];
}

@Component({
  selector: 'ngx-chart-of-account-type',
  templateUrl: './chart-of-account-type.component.html',
  styleUrls: ['./chart-of-account-type.component.scss'],
})
export class ChartOfAccountTypeComponent implements OnInit {
  showAddPopup = false;
  isEditMode = false;
  loading = false;
  isSubmitting = false;
  fetchError = '';
  accountGroups: AccountHeadType[] = [];
  accountHeads: AccountHeadType[] = [];
  accountTree: AccountHeadTypeNode[] = [];
  isAccountTypeOpen = false;
  activeAccountTypeIndex = -1;

  model: any = {
    account_head: '',
    account_type: '',
  };

  constructor(
    private globalService: GlobalService,
    private toastService: NbToastrService
  ) {}

  ngOnInit(): void {
    this.fetchAccountHeadType();
  }

  fetchAccountHeadType(): void {
    this.loading = true;
    this.fetchError = '';

    this.globalService.getAccountHeadType().subscribe({
      next: (res: any) => {
        const rows = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res) ? res : [];
        this.accountGroups = rows
          .map((row: any) => ({
            id: Number(row?.id || 0),
            group_name: `${row?.group_name ?? ''}`.trim(),
            parent_id: Number(row?.parent_id || 0),
          }))
          .filter((row: AccountHeadType) => row.id > 0 && !!row.group_name);

        this.buildAccountTree();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Failed to fetch account head type list:', error);
        this.accountGroups = [];
        this.buildAccountTree();
        this.fetchError = 'Unable to load account head types.';
        this.loading = false;
      },
    });
  }

  trackByGroupId(_index: number, group: AccountHeadType): number {
    return group.id;
  }

  get trimmedAccountType(): string {
    return `${this.model.account_type ?? ''}`.trim();
  }

  get availableAccountTypes(): AccountHeadType[] {
    const selectedHead = this.accountHeads.find(
      (head: AccountHeadType) => normalizeAccountHeadName(head.group_name)
        === normalizeAccountHeadName(this.model.account_head),
    );
    if (!selectedHead) {
      return [];
    }

    return this.accountGroups.filter((type: AccountHeadType) => type.parent_id === selectedHead.id);
  }

  get filteredAccountTypes(): AccountHeadType[] {
    const searchTerm = this.trimmedAccountType.toLowerCase();
    const matches = searchTerm
      ? this.availableAccountTypes.filter(
        (type: AccountHeadType) => type.group_name.toLowerCase().includes(searchTerm),
      )
      : this.availableAccountTypes;

    return matches.slice(0, 6);
  }

  get canUseNewAccountType(): boolean {
    const accountType = this.trimmedAccountType;
    return !!accountType && !this.availableAccountTypes.some(
      (type: AccountHeadType) => type.group_name.toLowerCase() === accountType.toLowerCase(),
    );
  }

  onAccountHeadChange(): void {
    this.model.account_type = '';
    this.closeAccountTypeSuggestions();
  }

  openAccountTypeSuggestions(): void {
    if (!this.model.account_head) {
      return;
    }

    this.isAccountTypeOpen = true;
    this.activeAccountTypeIndex = -1;
  }

  onAccountTypeInput(): void {
    this.isAccountTypeOpen = true;
    this.activeAccountTypeIndex = this.filteredAccountTypes.length > 0 ? 0 : -1;
  }

  closeAccountTypeSuggestions(): void {
    this.isAccountTypeOpen = false;
    this.activeAccountTypeIndex = -1;
  }

  selectAccountType(type: AccountHeadType, event?: Event): void {
    event?.preventDefault();
    this.model.account_type = type.group_name;
    this.closeAccountTypeSuggestions();
  }

  useNewAccountType(event?: Event): void {
    event?.preventDefault();
    this.model.account_type = this.trimmedAccountType;
    this.closeAccountTypeSuggestions();
  }

  onAccountTypeKeydown(event: KeyboardEvent): void {
    const optionCount = this.filteredAccountTypes.length;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.isAccountTypeOpen = true;
      this.activeAccountTypeIndex = optionCount > 0
        ? (this.activeAccountTypeIndex + 1) % optionCount
        : -1;
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.isAccountTypeOpen = true;
      this.activeAccountTypeIndex = optionCount > 0
        ? (this.activeAccountTypeIndex <= 0 ? optionCount - 1 : this.activeAccountTypeIndex - 1)
        : -1;
      return;
    }

    if (event.key === 'Enter' && this.isAccountTypeOpen) {
      event.preventDefault();
      const activeType = this.filteredAccountTypes[this.activeAccountTypeIndex];
      if (activeType) {
        this.selectAccountType(activeType);
      } else {
        this.useNewAccountType();
      }
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.closeAccountTypeSuggestions();
    }
  }

  openAddPopup(): void {
    this.isEditMode = false;
    this.model = {
      account_head: '',
      account_type: '',
    };
    this.closeAccountTypeSuggestions();
    this.showAddPopup = true;
  }

  openEditPopup(type: AccountHeadType): void {
    const parent = this.accountGroups.find((group: AccountHeadType) => group.id === type.parent_id);

    this.isEditMode = true;
    this.model = {
      account_head: parent?.group_name || '',
      account_type: type.group_name,
    };
    this.closeAccountTypeSuggestions();
    this.showAddPopup = true;
  }

  closeAddPopup(form?: any): void {
    this.showAddPopup = false;
    this.isEditMode = false;
    this.closeAccountTypeSuggestions();
    this.model = {
      account_head: '',
      account_type: '',
    };

    if (form) {
      form.resetForm();
    }
  }

  onSubmit(form: any): void {
    if (!form.valid) {
      return;
    }

    const accountHead = `${this.model.account_head ?? ''}`.trim();
    const accountType = `${this.model.account_type ?? ''}`.trim();

    if (!accountHead || !accountType) {
      return;
    }

    const payload = {
      account_head: accountHead,
      account_type: accountType,
    };

    this.isSubmitting = true;
    this.globalService.addAccountHeadType(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeAddPopup(form);
        this.fetchAccountHeadType();
      },
      error: (error: any) => {
        console.error('Failed to create account head type:', error);
        this.toastService.show(error.error?.message || 'Failed to create account head type', { status: 'danger' });
        this.isSubmitting = false;
      },
    });
  }

  private buildAccountTree(): void {
    const fetchedAccountHeads = this.accountGroups.filter((group: AccountHeadType) => group.parent_id === 0);
    this.accountHeads = STATIC_ACCOUNT_HEAD_NAMES.map((headName: string, index: number) => {
      const fetchedHead = fetchedAccountHeads.find((group: AccountHeadType) =>
        normalizeAccountHeadName(group.group_name) === normalizeAccountHeadName(headName)
      );
      return fetchedHead || {
        id: -(index + 1),
        group_name: headName,
        parent_id: 0,
      };
    });
    this.accountTree = this.accountHeads.map((head: AccountHeadType) => ({
      ...head,
      children: this.accountGroups.filter((group: AccountHeadType) => group.parent_id === head.id),
    }));
  }
}
