import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportComponent } from './report.component';
import { LeadCrmReportComponent } from './lead-crm-report/lead-crm-report.component';

const routes: Routes = [{
  path: '',
  component: ReportComponent,
  children: [
  {
    path: 'lead-crm-report',
    component: LeadCrmReportComponent,
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
