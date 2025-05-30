import { Component } from '@angular/core';

@Component({
  selector: 'ngx-lead-crm-report',
  templateUrl: './lead-crm-report.component.html',
  styleUrls: ['./lead-crm-report.component.scss']
})
export class LeadCrmReportComponent {
  startDate: Date | null = null;
  endDate: Date | null = null;

 onSubmit(form: any) {
  if (form.valid) {
    const reportType = form.value.report_type;
    console.log('✅ Report Type:', reportType); // should log "module_completion"
    console.log('Start:', this.startDate, 'End:', this.endDate);
  } else {
    form.control.markAllAsTouched();
  }
}

}
