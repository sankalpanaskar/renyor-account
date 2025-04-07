import { NgModule } from '@angular/core';
import { NbActionsModule, NbButtonModule, NbCardModule, NbCheckboxModule, NbDatepickerModule, NbIconModule, NbInputModule, NbMenuModule, NbRadioModule, NbSelectModule, NbUserModule } from '@nebular/theme';

import { ThemeModule } from '../@theme/theme.module';
import { PagesComponent } from './pages.component';
import { DashboardModule } from './dashboard/dashboard.module';
import { ECommerceModule } from './e-commerce/e-commerce.module';
import { PagesRoutingModule } from './pages-routing.module';
import { MiscellaneousModule } from './miscellaneous/miscellaneous.module';
import { AddLeadComponent } from './add-lead/add-lead.component';
import { UploadLeadComponent } from './upload-lead/upload-lead.component';
import { ManageLeadComponent } from './manage-lead/manage-lead.component';
import { TablesRoutingModule } from './tables/tables-routing.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { LoginComponent } from './login/login.component';

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
  ],
  declarations: [
    PagesComponent,
    AddLeadComponent,
    UploadLeadComponent,
    ManageLeadComponent,
    LoginComponent
  ],
  exports: [
    
  ]
})
export class PagesModule {
}
