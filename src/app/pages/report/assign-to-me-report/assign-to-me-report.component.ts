import { Component } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-assign-to-me-report',
  templateUrl: './assign-to-me-report.component.html',
  styleUrls: ['./assign-to-me-report.component.scss']
})
export class AssignToMeReportComponent {
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
      this.globalService.assetsAssignedReport(fm.value).subscribe({
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
            'Add Lead Failed. Please try again.';

          this.toastrService.danger(errorMessage, 'Add Asset Failed');
          this.isSubmitting = false;
        },
      });


      }
  }
}
