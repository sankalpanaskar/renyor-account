import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MarcomComponent } from './marcom.component';
import { StateBulkLeadComponent } from './state-bulk-lead/state-bulk-lead.component';
import { ManageMarcomLeadComponent } from './manage-marcom-lead/manage-marcom-lead.component';
import { CenterBulkLeadComponent } from './center-bulk-lead/center-bulk-lead.component';

const routes: Routes = [{
  path: '',
  component: MarcomComponent,
  children: [
  {
    path: 'state-bulk-lead',
    component: StateBulkLeadComponent,
  },
     {
    path: 'center-bulk-lead',
    component: CenterBulkLeadComponent,
  },
   {
    path: 'manage-marcom-lead',
    component: ManageMarcomLeadComponent,
  },

],
}];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarcomRoutingModule { }
export const routedComponents = [
MarcomComponent,
];