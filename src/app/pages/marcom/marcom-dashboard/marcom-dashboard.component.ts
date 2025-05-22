import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'ngx-marcom-dashboard',
  templateUrl: './marcom-dashboard.component.html',
  styleUrls: ['./marcom-dashboard.component.scss']
})
export class MarcomDashboardComponent {
  reportUrl: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    this.reportUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://lookerstudio.google.com/embed/reporting/2753a8bc-315f-47b6-9e8b-0667f2ee135a/page/e1ALF'
    );
  }
}
