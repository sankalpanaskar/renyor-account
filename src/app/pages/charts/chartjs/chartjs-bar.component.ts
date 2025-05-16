import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { NbThemeService, NbColorHelper } from '@nebular/theme';

@Component({
  selector: 'ngx-chartjs-bar',
  template: `<chart type="bar" [data]="data" [options]="options"></chart>`,
})
export class ChartjsBarComponent implements OnChanges, OnDestroy {
  @Input() chartData: any; // 👈 Input to accept data

  data: any;
  options: any;
  themeSubscription: any;

  constructor(private theme: NbThemeService) {
    this.themeSubscription = this.theme.getJsTheme().subscribe(config => {
      const chartjs: any = config.variables.chartjs;

      this.options = {
        maintainAspectRatio: false,
        responsive: true,
        legend: {
          labels: {
            fontColor: chartjs.textColor,
          },
        },
        scales: {
          xAxes: [
            {
              gridLines: {
                display: false,
                color: chartjs.axisLineColor,
              },
              ticks: {
                fontColor: chartjs.textColor,
              },
            },
          ],
          yAxes: [
            {
              gridLines: {
                display: true,
                color: chartjs.axisLineColor,
              },
              ticks: {
                fontColor: chartjs.textColor,
              },
            },
          ],
        },
      };
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.chartData && changes.chartData.currentValue) {
      this.data = this.chartData; // 👈 Set incoming data
    }
  }

  ngOnDestroy(): void {
    this.themeSubscription.unsubscribe();
  }
}
