import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { GlobalService } from '../../services/global.service';

@Component({
  selector: 'ngx-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent {
  reportUrl: SafeResourceUrl;
  role: any;

  constructor(
    private sanitizer: DomSanitizer,
    private globalService: GlobalService,

  ) {
    if (this.globalService.role_id === 15) {
      //CM  data  studio
      this.role = "CM"
      this.reportUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        'https://lookerstudio.google.com/embed/reporting/5d582906-1b68-4d67-aefd-012eab3eee0c/page/fJ1KF'
      );
    } else if (this.globalService.role_id === 17) {
      this.role = "RM"

      this.reportUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        'https://lookerstudio.google.com/embed/reporting/81d9d0c0-a5d2-4bb2-a367-19c4737dc47c/page/fJ1KF'
      );
    } else {
      this.role = "ALL"

      this.reportUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        'https://lookerstudio.google.com/embed/reporting/6f0c9bf3-87dc-46c4-bf74-4beb2908f457/page/fJ1KF'
      );
    }
  }
}
