import { Component, OnInit } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { GlobalService } from '../../../services/global.service';

@Component({
  selector: 'ngx-subscriptions',
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.scss']
})
export class SubscriptionsComponent implements OnInit {
  loading = false;
  tenant: any = null;
  packages: any[] = [];

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService
  ) {}

  ngOnInit(): void {
    this.loadSubscription();
  }

  get currentPackage(): any {
    const packageId = this.tenant?.package_id;
    const matchedPackage = this.packages.find((item: any) =>
      `${item?.id ?? item?.package_id ?? ''}` === `${packageId ?? ''}`
    );

    return matchedPackage || {
      id: packageId,
      package_name: this.tenant?.package_name,
      status: this.tenant?.status
    };
  }

  get activePackages(): any[] {
    return this.packages.filter((item: any) => this.isPlanActive(item));
  }

  loadSubscription(): void {
    this.loading = true;

    forkJoin({
      tenantResponse: this.globalService.fetchMyTenant(),
      packageResponse: this.globalService.gePackageList()
    })
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: ({ tenantResponse, packageResponse }: any) => {
          this.tenant = this.extractTenant(tenantResponse);
          this.packages = this.extractArray(packageResponse);
        },
        error: (err: any) => {
          this.toastrService.danger(
            err?.error?.message || 'Subscription details could not be loaded.',
            'Failed'
          );
        }
      });
  }

  isCurrentPlan(plan: any): boolean {
    return `${plan?.id ?? plan?.package_id ?? ''}` === `${this.tenant?.package_id ?? ''}`;
  }

  isPlanActive(plan: any): boolean {
    const status = plan?.status;
    return status === 1
      || status === true
      || `${status ?? ''}`.trim().toLowerCase() === 'active';
  }

  isTenantActive(): boolean {
    const status = this.tenant?.is_active ?? this.tenant?.status;
    return status === 1
      || status === true
      || `${status ?? ''}`.trim().toLowerCase() === 'active';
  }

  getPlanName(plan: any): string {
    return plan?.package_name || plan?.name || 'Subscription plan';
  }

  getPlanType(plan: any): string {
    return plan?.package_type || plan?.type || 'Standard';
  }

  getPlanPrice(plan: any): any {
    return plan?.final_price ?? plan?.offer_price ?? plan?.base_price;
  }

  formatCurrency(value: any): string {
    if (value === null || value === undefined || `${value}`.trim() === '') {
      return '-';
    }

    const numericValue = Number(`${value}`.replace(/,/g, ''));
    if (Number.isNaN(numericValue)) {
      return `${value}`;
    }

    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(numericValue);
  }

  trackByPlan(index: number, plan: any): number | string {
    return plan?.id ?? plan?.package_id ?? index;
  }

  private extractTenant(response: any): any {
    const data = response?.data ?? response;
    if (Array.isArray(data)) {
      return data[0] || null;
    }

    return data?.tenant ?? data ?? null;
  }

  private extractArray(response: any): any[] {
    const data = response?.data ?? response;
    return Array.isArray(data) ? data : [];
  }
}
