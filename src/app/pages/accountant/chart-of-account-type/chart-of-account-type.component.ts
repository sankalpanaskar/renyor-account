import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';

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
        this.accountHeads = [];
        this.accountTree = [];
        this.fetchError = 'Unable to load account head types.';
        this.loading = false;
      },
    });
  }

  trackByGroupId(_index: number, group: AccountHeadType): number {
    return group.id;
  }

  openAddPopup(): void {
    this.isEditMode = false;
    this.model = {
      account_head: '',
      account_type: '',
    };
    this.showAddPopup = true;
  }

  openEditPopup(type: AccountHeadType): void {
    const parent = this.accountGroups.find((group: AccountHeadType) => group.id === type.parent_id);

    this.isEditMode = true;
    this.model = {
      account_head: parent?.group_name || '',
      account_type: type.group_name,
    };
    this.showAddPopup = true;
  }

  closeAddPopup(form?: any): void {
    this.showAddPopup = false;
    this.isEditMode = false;
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
    this.accountHeads = this.accountGroups.filter((group: AccountHeadType) => group.parent_id === 0);
    this.accountTree = this.accountHeads.map((head: AccountHeadType) => ({
      ...head,
      children: this.accountGroups.filter((group: AccountHeadType) => group.parent_id === head.id),
    }));
  }
}
