import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssetsRoutingModule } from './assets-routing.module';
import { BulkUploadComponent } from './bulk-upload/bulk-upload.component';
import { AssetsComponent } from './assets.component';
import { RouterModule } from '@angular/router';
import { NbAccordionModule, NbButtonModule, NbCardModule, NbDatepickerModule, NbFormFieldModule, NbIconModule, NbInputModule, NbLayoutModule, NbRadioModule, NbSelectModule, NbSpinnerModule, NbTabsetModule } from '@nebular/theme';
import { FormsModule } from '@angular/forms';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { AddAssetFormComponent } from './add-asset-form/add-asset-form.component';
import { AssetListComponent } from './asset-list/asset-list.component';
import { AssetTransferComponent } from './asset-transfer/asset-transfer.component';
import { AssetStatusChangeComponent } from './asset-status-change/asset-status-change.component';


@NgModule({
  declarations: [
    AssetsComponent,
    BulkUploadComponent,
    AddAssetFormComponent,
    AssetListComponent,
    AssetTransferComponent,
    AssetStatusChangeComponent
  ],
  imports: [
    CommonModule,
    AssetsRoutingModule,
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
export class AssetsModule { }
