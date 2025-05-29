import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../services/global.service';
import { NbColorHelper, NbThemeService, NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-custom-dashboard',
  templateUrl: './custom-dashboard.component.html',
  styleUrls: ['./custom-dashboard.component.scss']
})
export class CustomDashboardComponent implements OnInit {
  //M
  // Summary Cards
  stats = [
    { title: "Today's Leads", value: 45 },
    { title: 'Total Followups', value: 10 },
    { title: 'Total Counseling', value: 200 },
    { title: 'Student Pending', value: 24 },
    { title: 'PO Pending', value: 30 },
    { title: 'Quiz Pending', value: 140 },
    { title: 'ORI Pending', value: 80 },
    { title: 'Ready to Enroll', value: 27 },
  ];

  // Follow-up Table
  followups = [
    { name: 'Rani Dutta', phone: '9089898876' },
    { name: 'Sankalpa Naskar', phone: '9089898876' },
    { name: 'Pritam Basu', phone: '9089898876' },
    { name: 'Rani Dutta', phone: '9089898876' },
    { name: 'Sankalpa Naskar', phone: '9089898876' },
  ];

  isSubmitting: boolean = false;
  statsData: any = [];
  chartBarData: any = null;

  constructor(
    public globalService: GlobalService,
    private toastrService: NbToastrService,
        private themeService: NbThemeService // ✅ FIX: Inject NbThemeService
  ) { }

  ngOnInit(): void {
    this.loadStatsData();
    this.loadChartData(); // ✅ ADD THIS
  }

  loadStatsData(): void {
    this.isSubmitting = true; // <-- start loader

    this.globalService.getStatsData().subscribe({
      next: (res) => {
        this.statsData = res.data;
        this.isSubmitting = false; // <-- stop loader
      },
      error: (err) => {
        console.error('Student error:', err);
        this.toastrService.danger(err.message, 'Error');
        this.isSubmitting = false; // <-- stop loader even on error
      },
    });
  }

loadChartData(): void {
  this.isSubmitting = true;

  this.themeService.getJsTheme().subscribe(theme => {
    const colors = theme.variables;
    const colorList = [
      colors.primaryLight,
      colors.infoLight,
      colors.dangerLight,
      colors.successLight,
      // colors.warningLight,
      // colors.dangerLight,
    ];

    this.globalService.getChartData().subscribe({
      next: (res) => {
        this.chartBarData = {
          labels: res.labels,
          datasets: [
            {
              label: 'Total Leads',
              data: res.totalLeads,
              backgroundColor: NbColorHelper.hexToRgbA(colorList[0], 0.8),
            },
            {
              label: 'Total Connected',
              data: res.totalConnected,
              backgroundColor: NbColorHelper.hexToRgbA(colorList[1], 0.8),
            },
            {
              label: 'Rejected',
              data: res.rejected,
              backgroundColor: NbColorHelper.hexToRgbA(colorList[2], 0.8),
            },
            {
              label: 'Total Enroll',
              data: res.totalEnroll,
              backgroundColor: NbColorHelper.hexToRgbA(colorList[3], 0.8),
            }
          ],
        };

        this.isSubmitting = false;
      },
      error: (err) => {
        this.toastrService.danger(err.message, 'Chart Load Error');
        this.isSubmitting = false;
      },
    });
  });
}




}