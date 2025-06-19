import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountsRoutingModule } from './accounts-routing.module';
import { RouterModule } from '@angular/router';
import { NbAccordionModule, NbButtonModule, NbCardModule, NbDatepickerModule, NbFormFieldModule, NbIconModule, NbInputModule, NbLayoutModule, NbRadioModule, NbSelectModule, NbSpinnerModule } from '@nebular/theme';
import { FormsModule } from '@angular/forms';
import { AddBudgetComponent } from './add-budget/add-budget.component';
import { AccountsComponent } from './accounts.component';
import { AddBudgetCategoryComponent } from './add-budget-category/add-budget-category.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { AddDonorAccountComponent } from './add-donor-account/add-donor-account.component';
import { BudgetListComponent } from './budget-list/budget-list.component';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { DonorAccountListComponent } from './donor-account-list/donor-account-list.component';
import { BudgetAllotmentUploadComponent } from './budget-allotment-upload/budget-allotment-upload.component';


@NgModule({
  declarations: [
    AccountsComponent,
    AddBudgetComponent,
    AddBudgetCategoryComponent,
    AddDonorAccountComponent,
    BudgetListComponent,
    DonorAccountListComponent,
    BudgetAllotmentUploadComponent,
  ],
  imports: [
    CommonModule,
    AccountsRoutingModule,
    RouterModule,
    NbCardModule,
    NbInputModule,
    NbButtonModule,
    NbSelectModule,
    NbIconModule,
    NbFormFieldModule,
    NbRadioModule,
    NbLayoutModule,
    NbAccordionModule,
    FormsModule,
    NbSpinnerModule,
    NgSelectModule,
    NbDatepickerModule.forRoot(),
    Ng2SmartTableModule
  ]
})
export class AccountsModule { }
