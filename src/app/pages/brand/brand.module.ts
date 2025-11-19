import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BrandRoutingModule } from './brand-routing.module';
import { BrandComponent } from './brand.component';
import { NbAccordionModule, NbButtonModule, NbCardModule, NbDatepickerModule, NbFormFieldModule, NbIconModule, NbInputModule, NbLayoutModule, NbRadioModule, NbSelectModule, NbSpinnerModule, NbTabsetModule } from '@nebular/theme';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { AddBrandComponent } from './add-brand/add-brand.component';
import { BrandListComponent } from './brand-list/brand-list.component';
import { BrandEditButtonComponent } from './brand-list/brand-edit-btn.component';


@NgModule({
  declarations: [
    BrandComponent,
    AddBrandComponent,
    BrandListComponent,
    BrandEditButtonComponent
  ],
  imports: [
    CommonModule,
    BrandRoutingModule,
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
export class BrandModule { }
