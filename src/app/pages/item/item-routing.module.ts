import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ItemComponent } from './item.component';
import { CategoryListComponent } from './category-list/category-list.component';
import { ItemListComponent } from './item-list/item-list.component';
import { authGuard } from '../../auth/auth.guard';

const routes: Routes = [
  {
    path:'',
    component:ItemComponent,
    children:[
      {
        path:'category-list',
        component:CategoryListComponent,
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
export class ItemRoutingModule { }
