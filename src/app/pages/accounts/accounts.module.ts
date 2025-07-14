import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountsRoutingModule } from './accounts-routing.module';
import { RouterModule } from '@angular/router';
import { NbAccordionModule, NbButtonModule, NbCardModule, NbDatepickerModule, NbFormFieldModule, NbIconModule, NbInputModule, NbLayoutModule, NbListModule, NbRadioModule, NbSelectModule, NbSpinnerModule,NbThemeModule } from '@nebular/theme';
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
import { AddDonorComponent } from './add-donor/add-donor.component';
import { DonorListComponent } from './donor-list/donor-list.component';
import { AmountRecievedFromDonorComponent } from './amount-recieved-from-donor/amount-recieved-from-donor.component';
import { BudgetExpensesUploadComponent } from './budget-expenses-upload/budget-expenses-upload.component';
import { SearchListComponent } from './components/search-list/search-list.component';
import { BudgetBreakupParticularDialougeComponent } from './budget-breakup-particular-dialouge/budget-breakup-particular-dialouge.component';
import { ThemeModule } from '../../@theme/theme.module';


@NgModule({
  declarations: [
    AccountsComponent,
    AddBudgetComponent,
    AddBudgetCategoryComponent,
    AddDonorAccountComponent,
    BudgetListComponent,
    DonorAccountListComponent,
    BudgetAllotmentUploadComponent,
    AddDonorComponent,
    DonorListComponent,
    AmountRecievedFromDonorComponent,
    BudgetExpensesUploadComponent,
    SearchListComponent,
    BudgetBreakupParticularDialougeComponent,
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
    NbListModule,
    NbThemeModule,
    NbDatepickerModule.forRoot(),
    Ng2SmartTableModule
  ]
})
export class AccountsModule { }
