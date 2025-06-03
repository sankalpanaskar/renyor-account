import { Component } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-lead-crm-report',
  templateUrl: './lead-crm-report.component.html',
  styleUrls: ['./lead-crm-report.component.scss']
})
export class LeadCrmReportComponent {
  startDate: Date | null = null;
  endDate: Date | null = null;
  isSubmitting: boolean = false;
  today: Date = new Date(); // ✅ Restrict future dates

    constructor(
      private globalService: GlobalService,
      private toastrService: NbToastrService
    ) 
    {}

 onSubmit(form: any) {
  if (form.valid) {
    const reportType = form.value.report_type;
    console.log('✅ Report Type:', reportType); // should log "module_completion"
    form.value.member_id = this.globalService.member_id;
    form.value.user_id = this.globalService.user_id;
    form.value.role_id = this.globalService.role_id

      this.isSubmitting = true;

      this.globalService.downloadReport(form.value).subscribe({
      next: (res:any) => {
       window.open(res.data.excelPath, '_blank');
      //   this.toastrService.danger(res.message, 'Error');
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Course error:', err);
        this.toastrService.danger(err.message, 'Error');
        this.isSubmitting = false;
      }
    });
  } 
}

}
