import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssetsComponent } from './assets.component';
import { BulkUploadComponent } from './bulk-upload/bulk-upload.component';
import { AddAssetFormComponent } from './add-asset-form/add-asset-form.component';
import { AssetListComponent } from './asset-list/asset-list.component';
import { AssetTransferComponent } from './asset-transfer/asset-transfer.component';
import { AssetStatusChangeComponent } from './asset-status-change/asset-status-change.component';

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

  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssetsRoutingModule { }
