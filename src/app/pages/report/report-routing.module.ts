import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportComponent } from './report.component';
import { AssetsReportComponent } from './assets-report/assets-report.component';

const routes: Routes = [{
  path: '',
  component: ReportComponent,
  children: [
  {
    path: 'assets-report',
    component: AssetsReportComponent,
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
