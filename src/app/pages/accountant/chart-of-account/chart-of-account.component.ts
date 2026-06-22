import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';

interface AccountGroup {
  id: number;
  group_name: string;
  parent_id: number;
  status: number;
}

interface AccountGroupNode extends AccountGroup {
  children: AccountGroup[];
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

  accountNames: string[] = [
    'Cash',
    'Bank',
    'Sales',
    'Purchase',
    'Receivable',
    'Payable',
  ];

  constructor(private globalService: GlobalService) {}

  ngOnInit(): void {
    this.fetchAccountHeadTypes();
  }

  fetchAccountHeadTypes(): void {
    this.globalService.getAccountHeadType().subscribe({
      next: (res: any) => {
        const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        this.accountGroups = rows
          .map((row: any) => ({
            id: Number(row?.id || 0),
            group_name: `${row?.group_name ?? ''}`.trim(),
            parent_id: Number(row?.parent_id || 0),
            status: Number(row?.status || 0),
          }))
          .filter((row: AccountGroup) => row.id > 0 && !!row.group_name && row.status === 1);

        this.buildAccountTree();
      },
      error: (error: any) => {
        console.error('Failed to fetch account head/type list:', error);
        this.accountHeads = [];
        this.accountTypes = [];
        this.accountGroups = [];
        this.accountTree = [];
      },
    });
  }

  onAccountHeadChange(): void {
    const selectedHeadId = Number(this.model.account_head || 0);
    this.model.account_type = '';
    this.accountTypes = this.getChildGroups(selectedHeadId);
  }

  private getGroupNameById(id: any): string {
    const groupId = Number(id || 0);
    const matchedGroup = this.accountGroups.find((group: AccountGroup) => group.id === groupId);
    return matchedGroup?.group_name || '';
  }

  private getChildGroups(parentId: number): AccountGroup[] {
    if (!parentId) {
      return [];
    }

    return this.accountGroups.filter((group: AccountGroup) => group.parent_id === parentId);
  }

  private buildAccountTree(): void {
    this.accountHeads = this.accountGroups.filter((group: AccountGroup) => group.parent_id === 0);
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
    this.showAddPopup = false;
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
    if (!form.valid) {
      return;
    }

    const accountName = this.normalizeAccountName(this.model.account_name);
    const accountHeadId = Number(this.model.account_head || 0);
    const accountTypeId = Number(this.model.account_type || 0);

    const payload = {
      chartofaccounts_head_type_id: accountTypeId,
      account_head: this.getGroupNameById(accountHeadId),
      account_type: this.getGroupNameById(accountTypeId),
      account_name: accountName,
      account_item: `${this.model.account_item ?? ''}`.trim(),
    };

    this.globalService.addChartOfAccount(payload).subscribe({
      next: (res: any) => {
        this.addAccountNameIfNew(accountName);
        this.closeAddPopup(form);
      },
      error: (error: any) => {
        console.error('Failed to create chart of account:', error);
      },
    });
  }

  trackByGroupId(_index: number, group: AccountGroup): number {
    return group.id;
  }
}
