import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PurchaseRoutingModule } from './purchase-routing.module';
import { AddVendorsComponent } from './add-vendors/add-vendors.component';
import { VendorsListComponent } from './vendors-list/vendors-list.component';
import { PurchaseComponent } from './purchase.component';
import { RouterModule } from '@angular/router';
import { NbAccordionModule, NbButtonModule, NbCardModule, NbCheckboxModule, NbDatepickerModule, NbFormFieldModule, NbIconModule, NbInputModule, NbLayoutModule, NbRadioModule, NbSelectModule, NbSpinnerModule, NbTabsetModule, NbTooltipModule } from '@nebular/theme';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { ThemeModule } from '../../@theme/theme.module';
import { AddPurchaseInvoiceComponent } from './add-purchase-invoice/add-purchase-invoice.component';
import { PurchaseInvoiceListComponent } from './purchase-invoice-list/purchase-invoice-list.component';


@NgModule({
  declarations: [
    PurchaseComponent,
    AddVendorsComponent,
    VendorsListComponent,
    AddPurchaseInvoiceComponent,
    PurchaseInvoiceListComponent
  ],
  imports: [
    CommonModule,
    PurchaseRoutingModule,
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
    NbSpinnerModule,
    NbDatepickerModule,
    NbCheckboxModule,
    NbTooltipModule,
    SharedModule,
    ThemeModule
  ]
})
export class PurchaseModule { }
