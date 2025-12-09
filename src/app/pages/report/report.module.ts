import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportRoutingModule } from './report-routing.module';
import { ReportComponent } from './report.component';
import { RouterModule } from '@angular/router';
import { NbAccordionModule, NbButtonModule, NbCardModule, NbDatepickerModule, NbFormFieldModule, NbIconModule, NbInputModule, NbLayoutModule, NbRadioModule, NbSelectModule, NbSpinnerModule, NbTabsetModule } from '@nebular/theme';
import { FormsModule } from '@angular/forms';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { AssetsReportComponent } from './assets-report/assets-report.component';
import { AssignToMeReportComponent } from './assign-to-me-report/assign-to-me-report.component';
import { DepriciationReportComponent } from './depriciation-report/depriciation-report.component';
import { NotWorkingAssetReportComponent } from './not-working-asset-report/not-working-asset-report.component';
import { ScrapApprovalPendingReportComponent } from './scrap-approval-pending-report/scrap-approval-pending-report.component';
import { ScrapAssetReportComponent } from './scrap-asset-report/scrap-asset-report.component';
import { TransferApprovalReportComponent } from './transfer-approval-report/transfer-approval-report.component';


@NgModule({
  declarations: [
    ReportComponent,
    AssetsReportComponent,
    AssignToMeReportComponent,
    DepriciationReportComponent,
    NotWorkingAssetReportComponent,
    ScrapApprovalPendingReportComponent,
    ScrapAssetReportComponent,
    TransferApprovalReportComponent
    
  ],
  imports: [
    CommonModule,
    ReportRoutingModule,
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
    NbSpinnerModule,
    NbDatepickerModule,    
            
  ]
})
export class ReportModule { }
