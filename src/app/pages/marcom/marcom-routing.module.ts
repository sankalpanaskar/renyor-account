import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MarcomComponent } from './marcom.component';
import { StateBulkLeadComponent } from './state-bulk-lead/state-bulk-lead.component';

const routes: Routes = [{
  path: '',
  component: MarcomComponent,
  children: [
  {
    path: 'state-bulk-lead',
    component: StateBulkLeadComponent,
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