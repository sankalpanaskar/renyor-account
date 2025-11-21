import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportComponent } from './report.component';
import { AssetsReportComponent } from './assets-report/assets-report.component';
import { AssignToMeReportComponent } from './assign-to-me-report/assign-to-me-report.component';
import { DepriciationReportComponent } from './depriciation-report/depriciation-report.component';
import { NotWorkingAssetReportComponent } from './not-working-asset-report/not-working-asset-report.component';
import { ScrapApprovalPendingReportComponent } from './scrap-approval-pending-report/scrap-approval-pending-report.component';
import { ScrapAssetReportComponent } from './scrap-asset-report/scrap-asset-report.component';

const routes: Routes = [{
  path: '',
  component: ReportComponent,
  children: [
  {
    path: 'assets-report',
    component: AssetsReportComponent,
  },
  {
    path: 'assign-to-me-report',
    component: AssignToMeReportComponent,
  },
  {
    path: 'depriciation-report',
    component: DepriciationReportComponent,
  },
  {
    path: 'not-working-asset-report',
    component: NotWorkingAssetReportComponent,
  },
  {
    path: 'scrap-approval-pending-report',
    component: ScrapApprovalPendingReportComponent,
  },
  {
    path: 'scrap-asset-report',
    component: ScrapAssetReportComponent,
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
