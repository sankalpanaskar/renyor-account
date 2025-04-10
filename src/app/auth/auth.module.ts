import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxAuthRoutingModule } from './auth-routing.module';
import { NbCardModule, NbLayoutModule } from '@nebular/theme';
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

@NgModule({
  declarations: [NgxLoginComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NbAlertModule,
    NbInputModule,
    NbButtonModule,
    NbCheckboxModule,
    NgxAuthRoutingModule,
    NbCardModule,
    NbAuthModule,
  ]
})
export class NgxAuthModule { }
