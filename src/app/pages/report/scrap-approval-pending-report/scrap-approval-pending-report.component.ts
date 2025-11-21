import { Component } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-scrap-approval-pending-report',
  templateUrl: './scrap-approval-pending-report.component.html',
  styleUrls: ['./scrap-approval-pending-report.component.scss']
})
export class ScrapApprovalPendingReportComponent {
  isSubmitting: boolean = false;
  model: any = [];

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService
  ) { }


  onSubmit(fm) {
    if (fm.valid) {
      console.log(fm.value);
      fm.value.member_id = this.globalService.member_id;
      this.isSubmitting = true;
      this.globalService.scrapApprovalPendingReport(fm.value).subscribe({
        next: (res) => {
          console.log(res);
          //fm.resetForm();
          //this.toastrService.success(res.message, 'Added');
          window.open(res.file_path, '_blank');
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('Submit error:', err);
          const errorMessage =
            err?.error?.message ||
            err?.message ||
            'Report Download Failed. Please try again.';

          this.toastrService.danger(errorMessage, 'Report Download Failed');
          this.isSubmitting = false;
        },
      });


    }
  }
}