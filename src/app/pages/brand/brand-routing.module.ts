import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrandComponent } from './brand.component';
import { AddBrandComponent } from './add-brand/add-brand.component';
import { BrandListComponent } from './brand-list/brand-list.component';

const routes: Routes = [
  {
    path:'',
    component:BrandComponent,
    children:[
      {
        path:'add-brand',
        component:AddBrandComponent
      },
      {
        path:'brand-list',
        component:BrandListComponent
      }
    ]

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BrandRoutingModule { }
