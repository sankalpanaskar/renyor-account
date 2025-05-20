import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MarcomRoutingModule } from './marcom-routing.module';
import { StateBulkLeadComponent } from './state-bulk-lead/state-bulk-lead.component';
import { PlacementOfficerRoutingModule } from '../placement-officer/placement-officer-routing.module';
import { RouterModule } from '@angular/router';
import { NbAccordionModule, NbButtonModule, NbCardModule, NbFormFieldModule, NbIconModule, NbInputModule, NbLayoutModule, NbRadioModule, NbSelectModule, NbSpinnerModule, NbTabsetModule } from '@nebular/theme';
import { FormsModule } from '@angular/forms';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { MarcomComponent } from './marcom.component';
import { ManageMarcomLeadComponent } from './manage-marcom-lead/manage-marcom-lead.component';
import { CustomCheckboxComponent } from './manage-marcom-lead/custom-checkbox.component';
import { CenterDialogComponent } from './center-dialog/center-dialog.component';


@NgModule({
  declarations: [
    StateBulkLeadComponent,
    MarcomComponent,
    ManageMarcomLeadComponent,
    CustomCheckboxComponent,
    CenterDialogComponent
  ],
  imports: [
    CommonModule,
    MarcomRoutingModule,
    RouterModule, // ✅ Add this
    NbCardModule,
    NbInputModule,
    NbButtonModule,
    NbSelectModule,
    NbIconModule,
    NbFormFieldModule,
    NbRadioModule,
    NbLayoutModule,
    NbAccordionModule,
    NbTabsetModule,
    FormsModule,
    Ng2SmartTableModule,
    NbSpinnerModule
  ]
})
export class MarcomModule { }
