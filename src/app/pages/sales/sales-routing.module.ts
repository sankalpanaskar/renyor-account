import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalesComponent } from './sales.component';
import { AddCustomersComponent } from './add-customers/add-customers.component';
import { authGuard } from '../../auth/auth.guard';
import { CustomersListComponent } from './customers-list/customers-list.component';
import { AddItemComponent } from './add-item/add-item.component';
import { ItemListComponent } from './item-list/item-list.component';
import { AddEstimatesComponent } from './add-estimates/add-estimates.component';
import { AddInvoiceComponent } from './add-invoice/add-invoice.component';
import { AddSalesOrderComponent } from './add-sales-order/add-sales-order.component';

const routes: Routes = [
  {
    path:'',
    component:SalesComponent,
    children: [
      {
        path:'add-customer',
        component:AddCustomersComponent,
        canActivate: [authGuard]
      },
      {
        path:'customer-list',
        component:CustomersListComponent,
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
      },
      {
        path:'add-estimate',
        component:AddEstimatesComponent,
        canActivate: [authGuard]
      },
      {
        path:'add-invoice',
        component:AddInvoiceComponent,
        canActivate: [authGuard]
      },
      {
        path:'add-sales-order',
        component:AddSalesOrderComponent,
        canActivate: [authGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalesRoutingModule { }
