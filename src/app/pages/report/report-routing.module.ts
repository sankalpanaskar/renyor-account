import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportComponent } from './report.component';
import { AssetsReportComponent } from './assets-report/assets-report.component';
import { AssignToMeReportComponent } from './assign-to-me-report/assign-to-me-report.component';
import { DepriciationReportComponent } from './depriciation-report/depriciation-report.component';
import { NotWorkingAssetReportComponent } from './not-working-asset-report/not-working-asset-report.component';
import { ScrapApprovalPendingReportComponent } from './scrap-approval-pending-report/scrap-approval-pending-report.component';
import { ScrapAssetReportComponent } from './scrap-asset-report/scrap-asset-report.component';
import { authGuard } from '../../auth/auth.guard';

const routes: Routes = [{
  path: '',
  component: ReportComponent,
  children: [
  {
    path: 'assets-report',
    component: AssetsReportComponent,
    canActivate: [authGuard]
  },
  {
    path: 'assign-to-me-report',
    component: AssignToMeReportComponent,
    canActivate: [authGuard]
  },
  {
    path: 'depriciation-report',
    component: DepriciationReportComponent,
    canActivate: [authGuard]
  },
  {
    path: 'not-working-asset-report',
    component: NotWorkingAssetReportComponent,
    canActivate: [authGuard]
  },
  {
    path: 'scrap-approval-pending-report',
    component: ScrapApprovalPendingReportComponent,
    canActivate: [authGuard]
  },
  {
    path: 'scrap-asset-report',
    component: ScrapAssetReportComponent,
    canActivate: [authGuard]
  },
],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportRoutingModule { }
export const routedComponents = [
ReportComponent,
];
