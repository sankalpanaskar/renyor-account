import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountsComponent } from './accounts.component';
import { AddBudgetComponent } from './add-budget/add-budget.component';
import { AddDonorAccountComponent } from './add-donor-account/add-donor-account.component';
import { BudgetListComponent } from './budget-list/budget-list.component';
import { DonorAccountListComponent } from './donor-account-list/donor-account-list.component';
import { BudgetAllotmentUploadComponent } from './budget-allotment-upload/budget-allotment-upload.component';

const routes: Routes = [{
  path: '',
    component: AccountsComponent,
    children: [
      {
      path: 'add-budget',
      component: AddBudgetComponent,
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
      path: 'budget-list',
      component: BudgetListComponent,
      },
      {
      path: 'budget-allotment-upload',
      component: BudgetAllotmentUploadComponent,
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