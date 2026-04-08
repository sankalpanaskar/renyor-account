import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  NbButtonModule,
  NbCardModule,
  NbIconModule,
  NbInputModule,
  NbSelectModule,
} from '@nebular/theme';
import { RouterModule } from '@angular/router';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { AccountantRoutingModule } from './accountant-routing.module';
import { AccountantComponent } from './accountant.component';
import { ChartOfAccountComponent } from './chart-of-account/chart-of-account.component';
import { ChartOfAccountTypeComponent } from './chart-of-account-type/chart-of-account-type.component';

@NgModule({
  declarations: [AccountantComponent, ChartOfAccountComponent, ChartOfAccountTypeComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    AccountantRoutingModule,
    NbCardModule,
    NbInputModule,
    NbButtonModule,
    NbIconModule,
    NbSelectModule,
    Ng2SmartTableModule,
  ],
})
export class AccountantModule {}
