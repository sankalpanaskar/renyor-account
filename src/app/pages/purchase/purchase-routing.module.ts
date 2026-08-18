import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PurchaseComponent } from './purchase.component';
import { AddVendorsComponent } from './add-vendors/add-vendors.component';
import { authGuard } from '../../auth/auth.guard';
import { VendorsListComponent } from './vendors-list/vendors-list.component';
import { AddPurchaseInvoiceComponent } from './add-purchase-invoice/add-purchase-invoice.component';
import { PurchaseInvoiceListComponent } from './purchase-invoice-list/purchase-invoice-list.component';

const routes: Routes = [
  {
    path:'',
    component:PurchaseComponent,
    children: [
      {
        path:'add-vendor',
        component:AddVendorsComponent,
        canActivate: [authGuard]
      },
      {
        path:'update-vendor',
        component:AddVendorsComponent,
        canActivate: [authGuard]
      },
      {
        path:'vendor-list',
        component:VendorsListComponent,
        canActivate: [authGuard]
      },
      {
        path:'add-purchase-invoice',
        component:AddPurchaseInvoiceComponent,
        canActivate: [authGuard]
      },
      {
        path:'update-purchase-invoice',
        component:AddPurchaseInvoiceComponent,
        canActivate: [authGuard]
      },
      {
        path:'purchase-invoice-list',
        component:PurchaseInvoiceListComponent,
        canActivate: [authGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PurchaseRoutingModule { }
