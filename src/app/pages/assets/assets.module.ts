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
import { AssetActionComponent } from './asset-list/asset-action.component';
import { ViewAssetDialogComponent } from './view-asset-dialog/view-asset-dialog.component';
import { EditAssetDialogComponent } from './edit-asset-dialog/edit-asset-dialog.component';
import { PendingAssetListComponent } from './pending-asset-list/pending-asset-list.component';
import { PendingEditBtnComponent } from './pending-asset-list/pending-edit-btn.component';
import { ApproveAssetDialogComponent } from './approve-asset-dialog/approve-asset-dialog.component';
import { ApproveCenterToCenterComponent } from './approve-center-to-center/approve-center-to-center.component';
import { ApproveCenterToHoComponent } from './approve-center-to-ho/approve-center-to-ho.component';
import { AssetHistoryComponent } from './asset-history/asset-history.component';
import { TransferToScrapComponent } from './transfer-to-scrap/transfer-to-scrap.component';
import { ApproveScrapRequestComponent } from './approve-scrap-request/approve-scrap-request.component';
import { AssetOwnerChangeComponent } from './asset-owner-change/asset-owner-change.component';
import { AddBuyerFormComponent } from './add-buyer-form/add-buyer-form.component';
import { BuyerListComponent } from './buyer-list/buyer-list.component';
import { ScrapSaleFormComponent } from './scrap-sale-form/scrap-sale-form.component';


@NgModule({
  declarations: [
    AssetsComponent,
    BulkUploadComponent,
    AddAssetFormComponent,
    AssetListComponent,
    AssetTransferComponent,
    AssetStatusChangeComponent,
    AssetActionComponent,
    ViewAssetDialogComponent,
    EditAssetDialogComponent,
    PendingAssetListComponent,
    PendingEditBtnComponent,
    ApproveAssetDialogComponent,
    ApproveCenterToCenterComponent,
    ApproveCenterToHoComponent,
    AssetHistoryComponent,
    TransferToScrapComponent,
    ApproveScrapRequestComponent,
    AssetOwnerChangeComponent,
    AddBuyerFormComponent,
    BuyerListComponent,
    ScrapSaleFormComponent

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
