import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ItemRoutingModule } from './item-routing.module';
import { ItemComponent } from './item.component';
import { BrandRoutingModule } from '../brand/brand-routing.module';
import { RouterModule } from '@angular/router';
import { NbAccordionModule, NbButtonModule, NbCardModule, NbDatepickerModule, NbFormFieldModule, NbIconModule, NbInputModule, NbLayoutModule, NbRadioModule, NbSelectModule, NbSpinnerModule, NbTabsetModule } from '@nebular/theme';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { FormsModule } from '@angular/forms';
import { CategoryListComponent } from './category-list/category-list.component';
import { CategoryEditButtonComponent } from './category-list/category-edit-btn.component';
import { AddCategoryFormComponent } from './add-category-form/add-category-form.component';
import { ItemListComponent } from './item-list/item-list.component';
import { ItemEditButtonComponent } from './item-list/item-edit-btn.component';
import { AddItemFormComponent } from './add-item-form/add-item-form.component';


@NgModule({
  declarations: [
    ItemComponent,
    CategoryListComponent,
    CategoryEditButtonComponent,
    AddCategoryFormComponent,
    ItemListComponent,
    ItemEditButtonComponent,
    AddItemFormComponent,
  ],
  imports: [
    CommonModule,
    ItemRoutingModule,
    RouterModule, // ✅ Add this
    NbCardModule,
    NbInputModule,
    NbButtonModule,
    NbSelectModule,
    NbIconModule,
    NbFormFieldModule,
    NbRadioModule,
    NbLayoutModule,
    NbAccordionModule,
    NbTabsetModule,
    FormsModule,
    Ng2SmartTableModule,
    NbSpinnerModule,
    NbDatepickerModule
  ]
})
export class ItemModule { }
