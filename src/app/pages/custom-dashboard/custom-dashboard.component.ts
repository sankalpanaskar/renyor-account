import { Component } from '@angular/core';

@Component({
  selector: 'ngx-custom-dashboard',
  templateUrl: './custom-dashboard.component.html',
  styleUrls: ['./custom-dashboard.component.scss']
})
export class CustomDashboardComponent {

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

  // Bar Chart (Leads Performance)
  barChartLabels: string[] = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // barChartData: ChartDataset[] = [
  //   {
  //     label: 'Total Leads',
  //     data: [35, 45, 55, 40, 50, 60, 70, 90, 65, 55, 50, 75],
  //     backgroundColor: '#00BFFF',
  //   },
  //   {
  //     label: 'Rejected',
  //     data: [15, 25, 20, 22, 18, 30, 25, 40, 30, 22, 25, 35],
  //     backgroundColor: '#FFA07A',
  //   },
  //   {
  //     label: 'Ready to Enroll',
  //     data: [10, 20, 30, 25, 28, 35, 40, 50, 38, 33, 30, 40],
  //     backgroundColor: '#ADFF2F',
  //   },
  // ];

  // barChartOptions: ChartOptions = {
  //   responsive: true,
  //   plugins: {
  //     legend: {
  //       position: 'top',
  //     },
  //   },
  // };

  // Doughnut Chart (Social Media)
  // doughnutLabels: string[] = ['WhatsApp', 'Facebook', 'Email'];
  // doughnutData: ChartData<'doughnut'> = {
  //   labels: this.doughnutLabels,
  //   datasets: [
  //     {
  //       label: 'Social Media Engagement',
  //       data: [65, 20, 15],
  //       backgroundColor: ['#FF1493', '#7B68EE', '#ADFF2F'],
  //     },
  //   ],
  // };

  // doughnutOptions: ChartOptions = {
  //   responsive: true,
  //   plugins: {
  //     legend: {
  //       position: 'bottom',
  //     },
  //   },
  // };
}