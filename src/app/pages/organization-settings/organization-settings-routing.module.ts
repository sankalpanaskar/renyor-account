import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../../auth/auth.guard';
import { OrganizationSettingComponent } from './organization-settings.component';
import { AddRolesComponent } from './add-roles/add-roles.component';
import { RolesComponent } from './roles/roles.component';
import { ProfileComponent } from '../organization-settings/profile/profile.component';
import { AddUserComponent } from './add-user/add-user.component';
import { UserListComponent } from './user-list/user-list.component';

const routes: Routes = [
  {
    path:'',
    component:OrganizationSettingComponent,
    children: [
      {
        path:'orgprofile',
        component:ProfileComponent,
        canActivate: [authGuard]
      },
      {
        path:'add-roles',
        component:AddRolesComponent,
        canActivate: [authGuard]
      },
      {
        path:'roles',
        component:RolesComponent,
        canActivate: [authGuard]
      },
      {
        path:'add-user',
        component:AddUserComponent,
        canActivate: [authGuard]
      },
      {
        path:'user-list',
        component:UserListComponent,
        canActivate: [authGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganizationSettingsRoutingModule { }
