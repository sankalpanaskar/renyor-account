import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountsComponent } from './accounts.component';
import { AddBudgetComponent } from './add-budget/add-budget.component';
import { AddDonorAccountComponent } from './add-donor-account/add-donor-account.component';
import { BudgetListComponent } from './budget-list/budget-list.component';
import { DonorAccountListComponent } from './donor-account-list/donor-account-list.component';
import { BudgetAllotmentUploadComponent } from './budget-allotment-upload/budget-allotment-upload.component';
import { AddDonorComponent } from './add-donor/add-donor.component';
import { DonorListComponent } from './donor-list/donor-list.component';
import { AddBudgetCategoryComponent } from './add-budget-category/add-budget-category.component';
import { AmountRecievedFromDonorComponent } from './amount-recieved-from-donor/amount-recieved-from-donor.component';
import { BudgetExpensesUploadComponent } from './budget-expenses-upload/budget-expenses-upload.component';

const routes: Routes = [{
  path: '',
    component: AccountsComponent,
    children: [
      {
      path: 'add-donor',
      component: AddDonorComponent,
      },
      {
      path: 'donor-list',
      component: DonorListComponent,
      },
      {
      path: 'add-donor-account',
      component: AddDonorAccountComponent,
      },
      {
      path: 'donor-account-list',
      component: DonorAccountListComponent,
      },
      {
      path: 'received-amount',
      component: AmountRecievedFromDonorComponent,
      },
      {
      path: 'add-budget-category',
      component: AddBudgetCategoryComponent,
      },
      {
      path: 'add-budget',
      component: AddBudgetComponent,
      },
      {
      path: 'budget-list',
      component: BudgetListComponent,
      },
      {
      path: 'budget-allotment-upload',
      component: BudgetAllotmentUploadComponent,
      },
      {
      path: 'received-amount-from-donor',
      component: AmountRecievedFromDonorComponent,
      },
      {
      path: 'budget-expenses-upload',
      component: BudgetExpensesUploadComponent,
      },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountsRoutingModule { }

export const routedComponents = [
AccountsComponent,
];