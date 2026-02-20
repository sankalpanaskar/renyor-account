import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrganizationSettingsRoutingModule } from './organization-settings-routing.module';
import { RolesComponent } from './roles/roles.component';
import { AddRolesComponent } from './add-roles/add-roles.component';
import { OrganizationSettingComponent } from './organization-settings.component';
import { NbAlertModule, NbButtonModule, NbCardModule, NbFormFieldModule, NbIconModule, NbInputModule, NbLayoutModule, NbListModule, NbSelectModule, NbSpinnerModule, NbCheckboxModule } from '@nebular/theme';
import { FormsModule } from '@angular/forms';
import { ProfileComponent } from './profile/profile.component';
import { AddUserComponent } from './add-user/add-user.component';
import { UserListComponent } from './user-list/user-list.component';
import { UserButtonComponent } from './user-list/custom-btn.component';
import { Ng2SmartTableModule } from 'ng2-smart-table';


@NgModule({
  declarations: [
    OrganizationSettingComponent,
    RolesComponent,
    AddRolesComponent,
    ProfileComponent,
    AddUserComponent,
    UserListComponent,
    UserButtonComponent
  ],
  imports: [
    CommonModule,
    OrganizationSettingsRoutingModule,
    NbCardModule,
    NbInputModule,
    NbButtonModule,
    NbSelectModule,
    NbIconModule,
    NbIconModule,
    NbFormFieldModule,
    NbLayoutModule,
    FormsModule,
    NbSpinnerModule,
    NbListModule,
    NbAlertModule,
    NbCheckboxModule,
    Ng2SmartTableModule
  ]
})
export class OrganizationSettingsModule { }
