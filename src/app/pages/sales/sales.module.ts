import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SalesRoutingModule } from './sales-routing.module';
import { AddCustomersComponent } from './add-customers/add-customers.component';
import { CustomersListComponent } from './customers-list/customers-list.component';
import { SalesComponent } from './sales.component';
import { RouterModule } from '@angular/router';
import { NbAccordionModule, NbButtonModule, NbCardModule, NbCheckboxModule, NbDatepickerModule, NbFormFieldModule, NbIconModule, NbInputModule, NbLayoutModule, NbRadioModule, NbSelectModule, NbSpinnerModule, NbTabsetModule, NbTooltipModule } from '@nebular/theme';
import { FormsModule } from '@angular/forms';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { AddItemComponent } from './add-item/add-item.component';
import { ItemListComponent } from './item-list/item-list.component';
import { SharedModule } from '../shared/shared.module';
import { ThemeModule } from '../../@theme/theme.module';
import { AddEstimatesComponent } from './add-estimates/add-estimates.component';
import { AddInvoiceComponent } from './add-invoice/add-invoice.component';
import { AddSalesOrderComponent } from './add-sales-order/add-sales-order.component';


@NgModule({
  declarations: [
    SalesComponent,
    AddCustomersComponent,
    CustomersListComponent,
    AddItemComponent,
    ItemListComponent,
    AddEstimatesComponent,
    AddInvoiceComponent,
    AddSalesOrderComponent,
  ],
  imports: [
    CommonModule,
    SalesRoutingModule,
    RouterModule, // ✅ Add this
    NbCardModule,
    NbInputModule,
    NbButtonModule,
    NbSelectModule,
    NbIconModule,
    NbIconModule,
    NbFormFieldModule,
    NbRadioModule,
    NbLayoutModule,
    NbAccordionModule,
    NbTabsetModule,
    FormsModule,
    Ng2SmartTableModule,
    NbSpinnerModule,
    NbDatepickerModule,
    NbCheckboxModule,
    NbTooltipModule,
    SharedModule,
    ThemeModule
  ]
})
export class SalesModule { }
