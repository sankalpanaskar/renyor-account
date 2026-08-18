import { Component, OnInit } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { finalize } from 'rxjs/operators';
import { GlobalService } from '../../../services/global.service';

@Component({
  selector: 'ngx-subscriptions',
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.scss']
})
export class SubscriptionsComponent implements OnInit {
  readonly includedModules = ['Customer', 'Item', 'Vendor', 'Invoice', 'Quote'];

  loading = false;
  subscriptions: any[] = [];

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService
  ) {}

  ngOnInit(): void {
    this.loadSubscriptions();
  }

  get currentSubscription(): any {
    return this.subscriptions.find((subscription: any) => this.isSubscriptionActive(subscription))
      || this.subscriptions[0]
      || null;
  }

  loadSubscriptions(): void {
    this.loading = true;

    this.globalService.fetchSubscriptions()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response: any) => {
          console.log('Subscription details response:', response);
          this.subscriptions = this.extractArray(response);
        },
        error: (err: any) => {
          this.toastrService.danger(
            err?.error?.message || 'Subscription details could not be loaded.',
            'Failed'
          );
        }
      });
  }

  isSubscriptionActive(subscription: any): boolean {
    const status = subscription?.status;
    return status === 1
      || status === true
      || `${status ?? ''}`.trim().toLowerCase() === 'active';
  }

  isCurrentSubscription(subscription: any): boolean {
    return `${subscription?.id ?? ''}` === `${this.currentSubscription?.id ?? ''}`;
  }

  getPlanName(subscription: any): string {
    return subscription?.package_name || 'Subscription plan';
  }

  getPlanType(subscription: any): string {
    return subscription?.package_type || 'Standard';
  }

  getSubscriptionEndDate(subscription: any): any {
    return this.isLifetimePackage(subscription)
      ? new Date()
      : subscription?.end_date;
  }

  getSubscriptionAmount(subscription: any): any {
    return subscription?.amount ?? subscription?.final_price ?? subscription?.offer_price ?? subscription?.base_price;
  }

  hasOfferPrice(subscription: any): boolean {
    const basePrice = Number(subscription?.base_price);
    const offerPrice = Number(subscription?.offer_price);

    return Number.isFinite(basePrice)
      && Number.isFinite(offerPrice)
      && offerPrice > 0
      && offerPrice < basePrice;
  }

  getPaymentStatus(subscription: any): string {
    const status = `${subscription?.payment_status ?? ''}`.trim();
    return status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : 'Pending';
  }

  isPaymentPaid(subscription: any): boolean {
    return `${subscription?.payment_status ?? ''}`.trim().toLowerCase() === 'paid';
  }

  formatDate(value: any): string {
    if (!value) {
      return '-';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return `${value}`;
    }

    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
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

  trackBySubscription(index: number, subscription: any): number | string {
    return subscription?.id ?? index;
  }

  private isLifetimePackage(subscription: any): boolean {
    const packageType = `${subscription?.package_type || ''}`
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, '');

    return packageType === 'lifetime';
  }

  private extractArray(response: any): any[] {
    const data = response?.data ?? response;
    return Array.isArray(data) ? data : [];
  }
}
