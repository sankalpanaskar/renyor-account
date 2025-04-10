import { Component } from '@angular/core';
import { GlobalService } from '../../services/global.service';

@Component({
  selector: 'ngx-add-lead',
  templateUrl: './add-lead.component.html',
  styleUrls: ['./add-lead.component.scss']
})
export class AddLeadComponent {

  dashboardData: any;
  userProfile: any;
  roles: any;

  constructor(private apiService: GlobalService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.apiService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
        console.log('Dashboard Data:', data);
      },
      error: (err) => console.error('Dashboard error:', err),
    });
  }

}
