import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ItemComponent } from './item.component';
import { CategoryListComponent } from './category-list/category-list.component';
import { ItemListComponent } from './item-list/item-list.component';

const routes: Routes = [
  {
    path:'',
    component:ItemComponent,
    children:[
      {
        path:'category-list',
        component:CategoryListComponent
      },
      {
        path:'item-list',
        component:ItemListComponent
      }
    ]

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ItemRoutingModule { }
