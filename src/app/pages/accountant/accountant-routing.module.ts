import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../../auth/auth.guard';
import { AccountantComponent } from './accountant.component';
import { ChartOfAccountComponent } from './chart-of-account/chart-of-account.component';
import { ChartOfAccountTypeComponent } from './chart-of-account-type/chart-of-account-type.component';

const routes: Routes = [
  {
    path: '',
    component: AccountantComponent,
    children: [
      {
        path: 'chart-of-account',
        component: ChartOfAccountComponent,
        canActivate: [authGuard],
      },
      {
        path: 'chart-of-account-type',
        component: ChartOfAccountTypeComponent,
        canActivate: [authGuard],
      },
      {
        path: '',
        redirectTo: 'chart-of-account',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountantRoutingModule {}
