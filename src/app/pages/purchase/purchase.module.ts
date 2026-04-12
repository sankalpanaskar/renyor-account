import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PurchaseRoutingModule } from './purchase-routing.module';
import { AddVendorsComponent } from './add-vendors/add-vendors.component';
import { VendorsListComponent } from './vendors-list/vendors-list.component';
import { PurchaseComponent } from './purchase.component';
import { RouterModule } from '@angular/router';
import { NbAccordionModule, NbButtonModule, NbCardModule, NbCheckboxModule, NbDatepickerModule, NbFormFieldModule, NbIconModule, NbInputModule, NbLayoutModule, NbRadioModule, NbSelectModule, NbSpinnerModule, NbTabsetModule } from '@nebular/theme';
import { FormsModule } from '@angular/forms';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { VendorsButtonComponent } from './vendors-list/vendors-btn.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [
    PurchaseComponent,
    AddVendorsComponent,
    VendorsListComponent,
    VendorsButtonComponent
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
    Ng2SmartTableModule,
    NbSpinnerModule,
    NbDatepickerModule,
    NbCheckboxModule,
    SharedModule
  ]
})
export class PurchaseModule { }
