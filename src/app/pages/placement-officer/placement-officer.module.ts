import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlacementOfficerRoutingModule } from './placement-officer-routing.module';
import { NbAccordionModule, NbButtonModule, NbCardModule, NbFormFieldModule, NbIconModule, NbInputModule, NbLayoutModule, NbRadioModule, NbSelectModule, NbSpinnerModule, NbTabsetModule } from '@nebular/theme';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PlacementOfficerComponent } from './placement-officer.component';
import { InterviewQuestionsComponent } from './interview-questions/interview-questions.component';
import { StudentAnswersComponent } from './student-answers/student-answers.component';
import { ManageCounselingComponent } from './manage-counseling/manage-counseling.component';
import { Ng2SmartTableModule } from 'ng2-smart-table';


@NgModule({
  declarations: [
    PlacementOfficerComponent,
    InterviewQuestionsComponent,
    StudentAnswersComponent,
    ManageCounselingComponent
  ],
  imports: [
    CommonModule,
    PlacementOfficerRoutingModule,
    RouterModule, // ✅ Add this
    NbCardModule,
    NbInputModule,
    NbButtonModule,
    NbSelectModule,
    NbIconModule,
    NbFormFieldModule,
    NbRadioModule,
    NbLayoutModule,
    NbAccordionModule,
    NbTabsetModule,
    FormsModule,
    Ng2SmartTableModule,
    NbSpinnerModule    
        
  ]
})
export class PlacementOfficerModule { }
