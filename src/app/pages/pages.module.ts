import { NgModule } from '@angular/core';
import { NbActionsModule, NbButtonModule, NbCardModule, NbCheckboxModule, NbDatepickerModule, NbIconModule, NbInputModule, NbMenuModule, NbRadioModule, NbSelectModule, NbSpinnerModule, NbUserModule } from '@nebular/theme';

import { ThemeModule } from '../@theme/theme.module';
import { PagesComponent } from './pages.component';
import { DashboardModule } from './dashboard/dashboard.module';
import { ECommerceModule } from './e-commerce/e-commerce.module';
import { PagesRoutingModule } from './pages-routing.module';
import { MiscellaneousModule } from './miscellaneous/miscellaneous.module';
import { TablesRoutingModule } from './tables/tables-routing.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { FormsModule } from '@angular/forms';
import { ProfileComponent } from './profile/profile.component';
import { CustomDashboardComponent } from './custom-dashboard/custom-dashboard.component';
import { ChartsModule } from './charts/charts.module';
import { SettingsComponent } from './settings/settings.component';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    PagesRoutingModule,
    ThemeModule,
    NbMenuModule,
    DashboardModule,
    ECommerceModule,
    MiscellaneousModule,
    NbCardModule,
    NbInputModule,
    NbCardModule,
    NbButtonModule,
    NbActionsModule,
    NbUserModule,
    NbCheckboxModule,
    NbRadioModule,
    NbDatepickerModule,
    NbSelectModule,
    NbIconModule,
    TablesRoutingModule,
    Ng2SmartTableModule,
    FormsModule,
    NbSpinnerModule,
    ChartsModule,
    RouterModule

  ],
  declarations: [
    PagesComponent,
    ProfileComponent,
    CustomDashboardComponent,
    SettingsComponent
  ],
  exports: [
    
  ]
})
export class PagesModule {
}
