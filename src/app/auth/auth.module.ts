import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxAuthRoutingModule } from './auth-routing.module';
import { NbCardModule, NbIconModule, NbLayoutModule, NbThemeModule, NbSpinnerModule, NbSelectModule, NbToastrModule } from '@nebular/theme'; // <-- Add NbSpinnerModule here
import { FormsModule } from '@angular/forms';

import { NbAuthModule } from '@nebular/auth';
import { 
  NbAlertModule,
  NbButtonModule,
  NbCheckboxModule,
  NbInputModule
} from '@nebular/theme';
import { RouterModule } from '@angular/router';
import { NgxLoginComponent } from './login/login.component';
import { StudentRegisterComponent } from './student-register/student-register.component';

@NgModule({
  declarations: [NgxLoginComponent, StudentRegisterComponent],
  imports: [
    NbThemeModule.forRoot(),
    CommonModule,
    FormsModule,
    NbSelectModule,
    RouterModule,
    NbAlertModule,
    NbInputModule,
    NbButtonModule,
    NbCheckboxModule,
    NgxAuthRoutingModule,
    NbCardModule,
    NbAuthModule,
    NbIconModule,
    NbSpinnerModule, // <-- Ensure this is imported
    NbToastrModule.forRoot(), // ✅ Add this line
  ]
})
export class NgxAuthModule { }
