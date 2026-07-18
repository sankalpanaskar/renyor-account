import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { PagesComponent } from './pages.component';
import { NotFoundComponent } from './miscellaneous/not-found/not-found.component';
import { authGuard } from '../auth/auth.guard';
import { ProfileComponent } from './profile/profile.component';
import { CustomDashboardComponent } from './custom-dashboard/custom-dashboard.component';
import { SettingsComponent } from './settings/settings.component';
import { DocumentFormatConfigComponent } from './shared/document-format-config/document-format-config.component';


const routes: Routes = [{
  path: '',
  component: PagesComponent,
  children: [
    {
      path: 'profile',
      component: ProfileComponent,
      canActivate: [authGuard],
    },
    {
      path: 'miscellaneous',
      loadChildren: () => import('./miscellaneous/miscellaneous.module')
        .then(m => m.MiscellaneousModule),
    },    
    {
      path: '',
      redirectTo: 'dashboard',
      pathMatch: 'full',
    },
    {
      path: 'custom-dashboard',
      component: CustomDashboardComponent,
      canActivate: [authGuard],
    },
    {
      path: 'sales',
      loadChildren: () => import('./sales/sales.module')
        .then(m => m.SalesModule)

    },
    {
      path: 'purchase',
      loadChildren: () => import('./purchase/purchase.module')
        .then(m => m.PurchaseModule)

    },
    {
      path: 'accountant',
      loadChildren: () => import('./accountant/accountant.module')
        .then(m => m.AccountantModule)

    },
    {
      path: 'admin-setting',
      loadChildren: () => import('./admin-setting/admin-setting.module')
        .then(m => m.AdminSettingModule)

    },
    {
      path: 'organization-setting',
      loadChildren: () => import('./organization-settings/organization-settings.module')
        .then(m => m.OrganizationSettingsModule)

    },
    {
      path: 'settings',
      component: SettingsComponent,
      canActivate: [authGuard],
    },
    {
      path: 'document-format-configuration',
      component: DocumentFormatConfigComponent,
      canActivate: [authGuard],
    },
    {
      path: '**',
      component: NotFoundComponent,
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {
}
