import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StudentDetailsComponent } from './student-details/student-details.component';
import { StudentFormComponent } from './student-form/student-form.component';
import { StudentComponent } from './student.component';

const routes: Routes = [{
  path: '',
  component: StudentComponent,
  children: [{
    path: 'student-details',
    component: StudentDetailsComponent,
  }, {
    path: 'student-form',
    component: StudentFormComponent,
  }
],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentRoutingModule { }

export const routedComponents = [
StudentComponent,
StudentFormComponent,
];