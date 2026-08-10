import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

type DashboardPeriod = '6m' | 'fy';

interface CashFlowSeries {
  labels: string[];
  income: number[];
  expenses: number[];
}

@Component({
  selector: 'ngx-custom-dashboard',
  templateUrl: './custom-dashboard.component.html',
  styleUrls: ['./custom-dashboard.component.scss']
})
export class CustomDashboardComponent implements OnInit {
  readonly chartWidth = 720;
  readonly chartTop = 24;
  readonly chartBottom = 210;
  readonly chartLeft = 52;
  readonly chartRight = 18;

  todayLabel = '';
  selectedPeriod: DashboardPeriod = '6m';

  readonly summaryCards = [
    {
      label: 'Cash balance',
      value: 482760,
      change: '12.4%',
      direction: 'up',
      context: 'across all bank accounts',
      icon: 'credit-card-outline',
      tone: 'blue',
    },
    {
      label: 'Revenue',
      value: 864200,
      change: '8.2%',
      direction: 'up',
      context: 'compared with last month',
      icon: 'trending-up-outline',
      tone: 'green',
    },
    {
      label: 'Expenses',
      value: 518640,
      change: '3.1%',
      direction: 'down',
      context: 'lower than last month',
      icon: 'trending-down-outline',
      tone: 'orange',
    },
    {
      label: 'Net profit',
      value: 345560,
      change: '18.6%',
      direction: 'up',
      context: '40.0% profit margin',
      icon: 'pie-chart-outline',
      tone: 'violet',
    },
  ];

  readonly chartData: Record<DashboardPeriod, CashFlowSeries> = {
    '6m': {
      labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
      income: [520000, 610000, 572000, 748000, 692000, 864200],
      expenses: [378000, 424000, 398000, 486000, 472000, 518640],
    },
    fy: {
      labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
      income: [520000, 610000, 572000, 748000, 692000, 864200, 812000, 905000, 886000, 978000, 1024000, 1090000],
      expenses: [378000, 424000, 398000, 486000, 472000, 518640, 496000, 548000, 526000, 584000, 602000, 628000],
    },
  };

  readonly expenseBreakdown = [
    { label: 'Purchases', value: 228202, percentage: 44, color: '#3867ed' },
    { label: 'Payroll', value: 134846, percentage: 26, color: '#19a974' },
    { label: 'Operations', value: 93355, percentage: 18, color: '#f5a524' },
    { label: 'Other', value: 62237, percentage: 12, color: '#9b7cf0' },
  ];

  readonly outstandingInvoices = [
    { number: 'INV-2048', customer: 'Aster Retail Pvt. Ltd.', due: 'Due today', amount: 84200, status: 'due' },
    { number: 'INV-2044', customer: 'Northstar Foods', due: '2 days overdue', amount: 46800, status: 'overdue' },
    { number: 'INV-2039', customer: 'Kaveri Distribution', due: 'Due 18 Sep', amount: 62150, status: 'upcoming' },
    { number: 'INV-2035', customer: 'BluePeak Services', due: 'Due 22 Sep', amount: 38500, status: 'upcoming' },
  ];

  readonly accounts = [
    { name: 'HDFC Current Account', suffix: '•• 4812', balance: 326540, icon: 'briefcase-outline', tone: 'blue' },
    { name: 'ICICI Business Account', suffix: '•• 0934', balance: 138720, icon: 'credit-card-outline', tone: 'green' },
    { name: 'Petty cash', suffix: 'Cash on hand', balance: 17500, icon: 'inbox-outline', tone: 'orange' },
  ];

  readonly transactions = [
    { title: 'Payment from Aster Retail', meta: 'Invoice INV-2041 · Today, 10:42 AM', amount: 72400, type: 'credit', icon: 'arrow-downward-outline' },
    { title: 'Office lease', meta: 'Bank transfer · Today, 9:15 AM', amount: -45000, type: 'debit', icon: 'arrow-upward-outline' },
    { title: 'Cloud software subscription', meta: 'Corporate card · Yesterday', amount: -6820, type: 'debit', icon: 'arrow-upward-outline' },
    { title: 'Payment from Northstar Foods', meta: 'Invoice INV-2037 · Yesterday', amount: 58900, type: 'credit', icon: 'arrow-downward-outline' },
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.todayLabel = new Intl.DateTimeFormat('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());
  }

  get currentSeries(): CashFlowSeries {
    return this.chartData[this.selectedPeriod];
  }

  get chartMax(): number {
    const highestValue = Math.max(...this.currentSeries.income, ...this.currentSeries.expenses);
    return Math.ceil(highestValue / 200000) * 200000;
  }

  get chartTicks(): number[] {
    return [1, 0.75, 0.5, 0.25, 0].map((ratio: number) => this.chartMax * ratio);
  }

  get incomeTotal(): number {
    return this.currentSeries.income.reduce((total: number, value: number) => total + value, 0);
  }

  get expenseTotal(): number {
    return this.currentSeries.expenses.reduce((total: number, value: number) => total + value, 0);
  }

  getChartX(index: number): number {
    const count = this.currentSeries.labels.length;
    const availableWidth = this.chartWidth - this.chartLeft - this.chartRight;
    return count === 1
      ? this.chartLeft
      : this.chartLeft + (availableWidth * index / (count - 1));
  }

  getChartY(value: number): number {
    const availableHeight = this.chartBottom - this.chartTop;
    return this.chartBottom - (value / this.chartMax * availableHeight);
  }

  getLinePoints(values: number[]): string {
    return values.map((value: number, index: number) =>
      `${this.getChartX(index)},${this.getChartY(value)}`
    ).join(' ');
  }

  getAreaPoints(values: number[]): string {
    const firstX = this.getChartX(0);
    const lastX = this.getChartX(values.length - 1);
    return `${firstX},${this.chartBottom} ${this.getLinePoints(values)} ${lastX},${this.chartBottom}`;
  }

  shouldShowChartLabel(index: number): boolean {
    return this.selectedPeriod === '6m' || index % 2 === 0 || index === this.currentSeries.labels.length - 1;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  }

  formatCompactCurrency(value: number): string {
    const absoluteValue = Math.abs(value);
    if (absoluteValue >= 10000000) {
      return `₹${(value / 10000000).toFixed(1)}Cr`;
    }
    if (absoluteValue >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    }
    if (absoluteValue >= 1000) {
      return `₹${(value / 1000).toFixed(0)}K`;
    }
    return `₹${value}`;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
