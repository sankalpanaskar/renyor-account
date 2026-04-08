import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PurchaseComponent } from './purchase.component';
import { AddVendorsComponent } from './add-vendors/add-vendors.component';
import { authGuard } from '../../auth/auth.guard';
import { VendorsListComponent } from './vendors-list/vendors-list.component';
import { AddItemComponent } from './add-item/add-item.component';
import { ItemListComponent } from './item-list/item-list.component';

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
      },
      {
        path:'add-item',
        component:AddItemComponent,
        canActivate: [authGuard]
      },
      {
        path:'item-list',
        component:ItemListComponent,
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
