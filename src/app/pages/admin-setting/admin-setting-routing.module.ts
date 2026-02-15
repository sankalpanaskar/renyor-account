import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminSettingComponent } from './admin-setting.component';
import { AddPackageComponent } from './add-package/add-package.component';
import { authGuard } from '../../auth/auth.guard';
import { PackageListComponent } from './package-list/package-list.component';
import { AddModuleComponent } from './add-module/add-module.component';
import { ModuleListComponent } from './module-list/module-list.component';
import { SetupMenuComponent } from './setup-menu/setup-menu.component';
import { AssignModuleIntoPackageComponent } from './assign-module-into-package/assign-module-into-package.component';
import { AddCompanyComponent } from './add-company/add-company.component';
import { CompanyListComponent } from './company-list/company-list.component';
import { AddCustomFieldComponent } from './add-custom-field/add-custom-field.component';
import { CustomFieldComponent } from './custom-field/custom-field.component';

const routes: Routes = [
  {
      path:'',
      component:AdminSettingComponent,
      children: [
        {
          path:'add-package',
          component:AddPackageComponent,
          canActivate: [authGuard]
        },
        {
          path:'package-list',
          component:PackageListComponent,
          canActivate: [authGuard]
        },
        {
          path:'assign-module',
          component:AssignModuleIntoPackageComponent,
          canActivate: [authGuard]
        },
        // {
        //   path:'module-list',
        //   component:ModuleListComponent,
        //   canActivate: [authGuard]
        // },
        {
          path:'setup-menu',
          component:SetupMenuComponent,
          canActivate: [authGuard]
        },
        {
          path:'add-company',
          component:AddCompanyComponent,
          canActivate: [authGuard]
        },
        {
          path:'company-list',
          component:CompanyListComponent,
          canActivate: [authGuard]
        },
        {
          path:'add-custom-field',
          component:AddCustomFieldComponent,
          canActivate: [authGuard]
        },
        {
          path:'custom-field',
          component:CustomFieldComponent,
          canActivate: [authGuard]
        },
      ]
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminSettingRoutingModule { }
