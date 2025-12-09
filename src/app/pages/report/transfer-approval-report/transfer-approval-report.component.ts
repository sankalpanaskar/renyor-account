import { Component } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-transfer-approval-report',
  templateUrl: './transfer-approval-report.component.html',
  styleUrls: ['./transfer-approval-report.component.scss']
})
export class TransferApprovalReportComponent {
  isSubmitting: boolean = false;
  model:any = [];

    constructor(
      private globalService: GlobalService,
      private toastrService: NbToastrService
    ) { }
    

    onSubmit(fm){
    if(fm.valid){
      console.log(fm.value);
      fm.value.member_id = this.globalService.member_id;
      this.isSubmitting = true;
      this.globalService.transferPendingReport().subscribe({
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
