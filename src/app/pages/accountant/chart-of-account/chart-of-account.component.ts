import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { GlobalService } from '../../../services/global.service';

@Component({
  selector: 'ngx-chart-of-account',
  templateUrl: './chart-of-account.component.html',
  styleUrls: ['./chart-of-account.component.scss'],
})
export class ChartOfAccountComponent implements OnInit {
  source: LocalDataSource = new LocalDataSource();
  showAddPopup = false;
  accountGroups: Array<{ id: number; group_name: string; parent_id: number; status: number }> = [];

  model: any = {
    account_head: '',
    account_type: '',
    account_name: '',
    account_item: '',
  };

  settings = {
    actions: false,
    pager: {
      display: true,
      perPage: 10,
    },
    columns: {
      account_head: {
        title: 'Account Head',
        type: 'string',
        filter: false,
      },
      account_type: {
        title: 'Account Type',
        type: 'string',
        filter: false,
      },
      account_name: {
        title: 'Account Name',
        type: 'string',
        filter: false,
      },
      account_item: {
        title: 'Account Item',
        type: 'string',
        filter: false,
      },
    },
  };

  accountHeads: Array<{ id: number; group_name: string; parent_id: number; status: number }> = [];

  accountTypes: Array<{ id: number; group_name: string; parent_id: number; status: number }> = [];

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
          .filter((row: any) => Number(row?.status) === 1)
          .map((row: any) => ({
            id: Number(row?.id || 0),
            group_name: `${row?.group_name ?? ''}`.trim(),
            parent_id: Number(row?.parent_id || 0),
            status: Number(row?.status || 0),
          }))
          .filter((row: any) => row.id > 0 && !!row.group_name);

        this.accountHeads = this.accountGroups.filter((row: any) => row.parent_id === 0);
        this.accountTypes = [];
      },
      error: (error: any) => {
        console.error('Failed to fetch account head/type list:', error);
        this.accountHeads = [];
        this.accountTypes = [];
        this.accountGroups = [];
      },
    });
  }

  onAccountHeadChange(): void {
    const selectedHeadId = Number(this.model.account_head || 0);
    this.model.account_type = '';

    if (!selectedHeadId) {
      this.accountTypes = [];
      return;
    }

    this.accountTypes = this.accountGroups.filter((group: any) => group.parent_id === selectedHeadId);
  }

  private getGroupNameById(id: any): string {
    const groupId = Number(id || 0);
    const matchedGroup = this.accountGroups.find((group: any) => group.id === groupId);
    return matchedGroup?.group_name || '';
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

        const row = {
          account_head: payload.account_head,
          account_type: payload.account_type,
          account_name: payload.account_name,
          account_item: payload.account_item,
        };

        this.source.prepend(row);
        this.closeAddPopup(form);
      },
      error: (error: any) => {
        console.error('Failed to create chart of account:', error);
      },
    });
  }
}
