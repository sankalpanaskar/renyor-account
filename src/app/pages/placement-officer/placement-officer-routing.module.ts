import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlacementOfficerComponent } from './placement-officer.component';
import { InterviewQuestionsComponent } from './interview-questions/interview-questions.component';
import { StudentAnswersComponent } from './student-answers/student-answers.component';
import { ManageCounselingComponent } from './manage-counseling/manage-counseling.component';
import { authGuard } from '../../auth/auth.guard';
import { RejectedCounselingComponent } from './rejected-counseling/rejected-counseling.component';
import { RejectedInterviewComponent } from './rejected-interview/rejected-interview.component';

const routes: Routes = [{
  path: '',
  component: PlacementOfficerComponent,
  children: [
  {
    path: 'interview-questions',
    component: InterviewQuestionsComponent,
  },
  {
    path: 'student-answers',
    component: StudentAnswersComponent,
  },
  {
    path: 'manage-counseling',
    component: ManageCounselingComponent,
    canActivate: [authGuard],
    
  },
    {
    path: 'rejected-counseling',
    component: RejectedCounselingComponent,
    canActivate: [authGuard],
    
  },
     {
    path: 'rejected-interview',
    component: RejectedInterviewComponent,
    canActivate: [authGuard],
    
  }
],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlacementOfficerRoutingModule { }

export const routedComponents = [
PlacementOfficerComponent,
];