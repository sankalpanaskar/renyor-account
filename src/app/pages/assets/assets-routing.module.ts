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
import { AssetOwnerChangeComponent } from './asset-owner-change/asset-owner-change.component';
import { AddBuyerFormComponent } from './add-buyer-form/add-buyer-form.component';
import { BuyerListComponent } from './buyer-list/buyer-list.component';
import { ScrapSaleFormComponent } from './scrap-sale-form/scrap-sale-form.component';
import { ScrapSaleDetailsComponent } from './scrap-sale-details/scrap-sale-details.component';
import { authGuard } from '../../auth/auth.guard';

const routes: Routes = [{
  path:'',
  component:AssetsComponent,
  children: [
    {
      path:'bulk-upload',
      component:BulkUploadComponent,
      canActivate: [authGuard]
    },
    {
      path:'add-asset',
      component:AddAssetFormComponent,
      canActivate: [authGuard]
    },
    {
      path:'asset-list',
      component:AssetListComponent,
      canActivate: [authGuard]
     
    },
    {
      path:'asset-transfer',
      component:AssetTransferComponent,
      canActivate: [authGuard]

    },
    {
      path:'asset-status-change',
      component:AssetStatusChangeComponent,
      canActivate: [authGuard]
    },
    {
      path:'pending-asset-list',
      component:PendingAssetListComponent,
      canActivate: [authGuard]
    },
    {
      path:'center-to-center',
      component:ApproveCenterToCenterComponent,
      canActivate: [authGuard]
    },
    {
      path:'center-to-ho',
      component:ApproveCenterToHoComponent,
      canActivate: [authGuard]
    },
    {
      path:'asset-history',
      component:AssetHistoryComponent,
      canActivate: [authGuard]
    },
    {
      path:'transfer-to-scrap',
      component:TransferToScrapComponent,
      canActivate: [authGuard]
    },
    {
      path:'approve-scrap-request',
      component:ApproveScrapRequestComponent,
      canActivate: [authGuard]
    },
    {
      path:'asset-owner-change',
      component:AssetOwnerChangeComponent,
      canActivate: [authGuard]
    },
    {
      path:'add-buyer-form',
      component:AddBuyerFormComponent,
      canActivate: [authGuard]
    },
    {
      path:'buyer-list',
      component:BuyerListComponent,
      canActivate: [authGuard]
    },    
    {
      path:'scrap-sale-form',
      component:ScrapSaleFormComponent,
      canActivate: [authGuard]
    }, 
    {
      path:'scrap-sale-details',
      component:ScrapSaleDetailsComponent,
      canActivate: [authGuard]
    }, 
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssetsRoutingModule { }
