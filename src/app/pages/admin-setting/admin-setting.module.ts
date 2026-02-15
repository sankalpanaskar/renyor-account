import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminSettingRoutingModule } from './admin-setting-routing.module';
import { RouterModule } from '@angular/router';
import { NbAccordionModule, NbAlertModule, NbButtonModule, NbCardModule, NbCheckboxComponent, NbCheckboxModule, NbDatepickerModule, NbFormFieldModule, NbIconModule, NbInputModule, NbLayoutModule, NbListModule, NbRadioModule, NbSelectModule, NbSpinnerModule, NbTabsetModule } from '@nebular/theme';
import { FormsModule } from '@angular/forms';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { AdminSettingComponent } from './admin-setting.component';
import { AddPackageComponent } from './add-package/add-package.component';
import { PackageListComponent } from './package-list/package-list.component';
import { PackageButtonComponent } from './package-list/custom-btn.component';
import { ModuleListComponent } from './module-list/module-list.component';
import { AddModuleComponent } from './add-module/add-module.component';
import { ModuleButtonComponent } from './module-list/custom-btn.component';
import { AssignModuleComponent } from './assign-module/assign-module.component';
import { SetupMenuComponent } from './setup-menu/setup-menu.component';
import { AssignModuleIntoPackageComponent } from './assign-module-into-package/assign-module-into-package.component';
import { AddCompanyComponent } from './add-company/add-company.component';
import { CompanyListComponent } from './company-list/company-list.component';
import { CompanyButtonComponent } from './company-list/custom-btn.component';
import { AddCustomFieldComponent } from './add-custom-field/add-custom-field.component';
import { CustomFieldComponent } from './custom-field/custom-field.component';

@NgModule({
  declarations: [
    AdminSettingComponent,
    AddPackageComponent,
    PackageListComponent,
    PackageButtonComponent,
    ModuleListComponent,
    AddModuleComponent,
    ModuleButtonComponent,
    AssignModuleComponent,
    SetupMenuComponent,
    AssignModuleIntoPackageComponent,
    AddCompanyComponent,
    CompanyListComponent,
    CompanyButtonComponent,
    AddCustomFieldComponent,
    CustomFieldComponent
  ],
  imports: [
    CommonModule,
    AdminSettingRoutingModule,
    RouterModule, // ✅ Add this
    NbCardModule,
    NbInputModule,
    NbButtonModule,
    NbSelectModule,
    NbIconModule,
    NbIconModule,
    NbFormFieldModule,
    NbRadioModule,
    NbLayoutModule,
    NbAccordionModule,
    NbTabsetModule,
    FormsModule,
    Ng2SmartTableModule,
    NbSpinnerModule,
    NbDatepickerModule,
    NbCheckboxModule,
    NbListModule,
    NbAlertModule
  ]
})
export class AdminSettingModule { }
