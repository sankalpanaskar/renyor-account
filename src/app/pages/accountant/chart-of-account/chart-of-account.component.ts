import { Component } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';

@Component({
  selector: 'ngx-chart-of-account',
  templateUrl: './chart-of-account.component.html',
  styleUrls: ['./chart-of-account.component.scss'],
})
export class ChartOfAccountComponent {
  source: LocalDataSource = new LocalDataSource();
  showAddPopup = false;

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

  accountHeads: string[] = [
    'Assets',
    'Liabilities',
    'Income',
    'Expenses',
    'Equity',
  ];

  accountTypes: string[] = [
    'Current Asset',
    'Current Liability',
    'Direct Income',
    'Direct Expense',
    'Indirect Income',
    'Indirect Expense',
  ];

  accountNames: string[] = [
    'Cash',
    'Bank',
    'Sales',
    'Purchase',
    'Receivable',
    'Payable',
  ];

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

  onSubmit(form: any): void {
    if (!form.valid) {
      return;
    }

    const row = {
      account_head: this.model.account_head,
      account_type: this.model.account_type,
      account_name: this.model.account_name,
      account_item: this.model.account_item,
    };

    this.source.prepend(row);
    this.closeAddPopup(form);
  }
}
