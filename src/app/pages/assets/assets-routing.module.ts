import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssetsComponent } from './assets.component';
import { BulkUploadComponent } from './bulk-upload/bulk-upload.component';
import { AddAssetFormComponent } from './add-asset-form/add-asset-form.component';
import { AssetListComponent } from './asset-list/asset-list.component';
import { AssetTransferComponent } from './asset-transfer/asset-transfer.component';
import { AssetStatusChangeComponent } from './asset-status-change/asset-status-change.component';
import { PendingAssetListComponent } from './pending-asset-list/pending-asset-list.component';
import { ApproveCenterToCenterComponent } from './approve-center-to-center/approve-center-to-center.component';
import { ApproveCenterToHoComponent } from './approve-center-to-ho/approve-center-to-ho.component';
import { AssetHistoryComponent } from './asset-history/asset-history.component';
import { TransferToScrapComponent } from './transfer-to-scrap/transfer-to-scrap.component';
import { ApproveScrapRequestComponent } from './approve-scrap-request/approve-scrap-request.component';

const routes: Routes = [{
  path:'',
  component:AssetsComponent,
  children: [
    {
      path:'bulk-upload',
      component:BulkUploadComponent
    },
    {
      path:'add-asset',
      component:AddAssetFormComponent
    },
    {
      path:'asset-list',
      component:AssetListComponent
    },
    {
      path:'asset-transfer',
      component:AssetTransferComponent
    },
    {
      path:'asset-status-change',
      component:AssetStatusChangeComponent
    },
    {
      path:'pending-asset-list',
      component:PendingAssetListComponent
    },
    {
      path:'center-to-center',
      component:ApproveCenterToCenterComponent
    },
    {
      path:'center-to-ho',
      component:ApproveCenterToHoComponent
    },
    {
      path:'asset-history',
      component:AssetHistoryComponent
    },
    {
      path:'transfer-to-scrap',
      component:TransferToScrapComponent
    },
    {
      path:'approve-scrap-request',
      component:ApproveScrapRequestComponent
    },

  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssetsRoutingModule { }
