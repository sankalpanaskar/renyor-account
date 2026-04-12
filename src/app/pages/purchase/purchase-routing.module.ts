import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PurchaseComponent } from './purchase.component';
import { AddVendorsComponent } from './add-vendors/add-vendors.component';
import { authGuard } from '../../auth/auth.guard';
import { VendorsListComponent } from './vendors-list/vendors-list.component';

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
        path:'customer-list',
        component:VendorsListComponent,
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
