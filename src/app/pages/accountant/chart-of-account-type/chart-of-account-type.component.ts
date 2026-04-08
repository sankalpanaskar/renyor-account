import { Component } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';

@Component({
  selector: 'ngx-chart-of-account-type',
  templateUrl: './chart-of-account-type.component.html',
  styleUrls: ['./chart-of-account-type.component.scss'],
})
export class ChartOfAccountTypeComponent {
  source: LocalDataSource = new LocalDataSource();
  showAddPopup = false;

  model: any = {
    accounting_head: '',
    account_type: '',
  };

  settings = {
    actions: false,
    pager: {
      display: true,
      perPage: 10,
    },
    columns: {
      accounting_head: {
        title: 'Accounting Head',
        type: 'string',
        filter: false,
      },
      account_type: {
        title: 'Account Type',
        type: 'string',
        filter: false,
      },
    },
  };

  accountingHeads: string[] = [
    'Assets',
    'Liabilities',
    'Income',
    'Expenses',
    'Equity',
  ];

  openAddPopup(): void {
    this.showAddPopup = true;
  }

  closeAddPopup(form?: any): void {
    this.showAddPopup = false;
    this.model = {
      accounting_head: '',
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

    this.source.prepend({
      accounting_head: this.model.accounting_head,
      account_type: this.model.account_type,
    });

    this.closeAddPopup(form);
  }
}
