import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LeadComponent } from './lead.component';
import { StudentFlowDataComponent } from './student-flow-data/student-flow-data.component';

const routes: Routes = [{
  path: '',
  component: LeadComponent,
  children: [
  {
    path: 'student-flow-data',
    component: StudentFlowDataComponent,
  },
],
}];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeadRoutingModule { }

export const routedComponents = [
LeadComponent,
];