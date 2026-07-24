import { Component, OnInit } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { Router } from '@angular/router';
import { GlobalService } from '../../../services/global.service';

@Component({
  selector: 'ngx-company-list',
  templateUrl: './company-list.component.html',
  styleUrls: ['./company-list.component.scss']
})
export class CompanyListComponent implements OnInit {
  allCompanies: any[] = [];
  apiData: any[] = [];
  packages: any[] = [];
  searchText = '';
  loading = false;
  packagesLoading = false;
  subscriptionSubmitting = false;
  showCompanyPopup = false;
  showSubscriptionPopup = false;
  selectedCompany: any = null;
  subscriptionCompany: any = null;
  subscriptionModel: any = this.createEmptySubscriptionModel();
  readonly paymentStatuses = [
    { value: 'paid', label: 'Paid' },
    { value: 'pending', label: 'Pending' },
  ];
  readonly paymentMethods = ['Cash', 'UPI', 'Net Banking', 'Cheque', 'Bank Transfer'];

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
    private router: Router,
  ) {}

  get activeCompaniesCount(): number {
    return this.allCompanies.filter((item: any) => this.isCompanyActive(item)).length;
  }

  get inactiveCompaniesCount(): number {
    return this.allCompanies.length - this.activeCompaniesCount;
  }

  ngOnInit(): void {
    this.getCompany();
    this.getPackages();
  }

  getCompany(): void {
    this.loading = true;
    this.globalService.geCompanyList().subscribe({
      next: (res: any) => {
        this.allCompanies = res?.data || res || [];
        this.apiData = [...this.allCompanies];
        this.onSearch(this.searchText);
        this.loading = false;
      },
      error: (err: any) => {
        this.toastrService.danger(err?.message || err, 'Failed');
        this.loading = false;
      },
    });
  }

  onSearch(query: string = ''): void {
    this.searchText = query || '';
    const searchValue = this.searchText.trim().toLowerCase();

    if (!searchValue) {
      this.apiData = [...this.allCompanies];
      return;
    }

    this.apiData = this.allCompanies.filter((item: any) => {
      const values = [
        item?.name,
        this.getCompanyPackageNames(item),
        item?.industry,
        item?.email,
        item?.phone,
        item?.country,
        item?.state,
        item?.city,
        item?.pin,
        item?.pan,
        item?.gst,
        this.getSubscriptionStatus(item),
        this.getCompanyStatus(item),
      ];

      return values.some((value: any) => String(value ?? '').toLowerCase().includes(searchValue));
    });
  }

  clearSearch(): void {
    this.onSearch('');
  }

  isCompanyActive(item: any): boolean {
    const status = item?.is_active ?? item?.status;
    return status === 1 || status === true || `${status}`.trim().toLowerCase() === 'active';
  }

  getCompanyStatus(item: any): string {
    return this.isCompanyActive(item) ? 'Active' : 'Inactive';
  }

  hasActiveSubscription(item: any): boolean {
    return this.getCompanyPackages(item).some((packageItem: any) =>
      this.isPackageActive(packageItem)
    );
  }

  getSubscriptionStatus(item: any): 'Active' | 'Expired' {
    return this.hasActiveSubscription(item) ? 'Active' : 'Expired';
  }

  getCompanyInitials(item: any): string {
    const name = `${item?.name || 'Company'}`.trim();
    return name.split(/\s+/).filter(Boolean).slice(0, 2)
      .map((word: string) => word.charAt(0).toUpperCase()).join('') || 'CO';
  }

  trackByCompany(index: number, item: any): number | string {
    return item?.id ?? item?.company_id ?? item?.tenant_id ?? index;
  }

  openCompanyPopup(item: any): void {
    this.selectedCompany = item;
    this.showCompanyPopup = true;
  }

  closeCompanyPopup(): void {
    this.showCompanyPopup = false;
    this.selectedCompany = null;
  }

  getPackages(): void {
    this.packagesLoading = true;
    this.globalService.gePackageList().subscribe({
      next: (res: any) => {
        const data = res?.data ?? res;
        this.packages = Array.isArray(data) ? data : [];
        this.packagesLoading = false;
      },
      error: (err: any) => {
        this.packages = [];
        this.packagesLoading = false;
        this.toastrService.danger(
          err?.error?.message || err?.message || 'Package list could not be loaded.',
          'Failed'
        );
      },
    });
  }

  openSubscriptionPopup(item: any): void {
    const tenantId = this.getTenantId(item);

    if (tenantId === null || tenantId === undefined || tenantId === '') {
      this.toastrService.danger('This company does not have a valid tenant ID.', 'Subscription');
      return;
    }

    this.subscriptionCompany = item;
    this.subscriptionModel = this.createEmptySubscriptionModel(
      tenantId,
      item?.package_id ?? null
    );
    this.showSubscriptionPopup = true;

    if (this.packages.length === 0 && !this.packagesLoading) {
      this.getPackages();
    }
  }

  closeSubscriptionPopup(): void {
    if (this.subscriptionSubmitting) {
      return;
    }

    this.showSubscriptionPopup = false;
    this.subscriptionCompany = null;
    this.subscriptionModel = this.createEmptySubscriptionModel();
  }

  onSubscriptionOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeSubscriptionPopup();
    }
  }

  submitSubscription(form: any): void {
    if (form.invalid || this.subscriptionSubmitting) {
      return;
    }

    const payload = {
      tenant_id: this.subscriptionModel.tenant_id,
      package_id: this.subscriptionModel.package_id,
      payment_status: this.subscriptionModel.payment_status,
      payment_method: this.subscriptionModel.payment_method,
      transaction_id: `${this.subscriptionModel.transaction_id}`.trim(),
      invoice_id: `${this.subscriptionModel.invoice_id}`.trim(),
    };

    this.subscriptionSubmitting = true;
    this.globalService.createSubscription(payload).subscribe({
      next: (res: any) => {
        this.subscriptionSubmitting = false;
        this.toastrService.success(
          res?.message || 'Subscription payment was added successfully.',
          'Subscription added'
        );
        this.closeSubscriptionPopup();
        this.getCompany();
      },
      error: (err: any) => {
        this.subscriptionSubmitting = false;
        this.toastrService.danger(
          err?.error?.message || err?.message || 'Subscription payment could not be added.',
          'Failed'
        );
      },
    });
  }

  getPackageName(item: any): string {
    return item?.package_name || item?.name || `Package #${item?.id ?? item?.package_id ?? '-'}`;
  }

  getCompanyPackages(item: any): any[] {
    return Array.isArray(item?.packages) ? item.packages : [];
  }

  getCurrentCompanyPackage(item: any): any {
    const companyPackages = this.getCompanyPackages(item);
    const currentPackageId = item?.package_id;

    return companyPackages.find((packageItem: any) =>
      `${packageItem?.package_id ?? ''}` === `${currentPackageId ?? ''}`
    ) || companyPackages.find((packageItem: any) => this.isPackageActive(packageItem))
      || companyPackages[0]
      || null;
  }

  getCompanyPackageName(item: any): string {
    return this.getCurrentCompanyPackage(item)?.package_name || '-';
  }

  getCompanyPackageType(item: any): string {
    return this.getCurrentCompanyPackage(item)?.package_type || '-';
  }

  getCompanyPackageNames(item: any): string {
    return this.getCompanyPackages(item)
      .map((packageItem: any) => packageItem?.package_name || packageItem?.package_type)
      .filter(Boolean)
      .join(' ');
  }

  isCurrentCompanyPackage(company: any, packageItem: any): boolean {
    return `${packageItem?.package_id ?? ''}` === `${company?.package_id ?? ''}`;
  }

  isPackageActive(packageItem: any): boolean {
    const status = packageItem?.status;
    return status === 1
      || status === true
      || `${status ?? ''}`.trim().toLowerCase() === 'active';
  }

  getPackageStatus(packageItem: any): string {
    return this.isPackageActive(packageItem) ? 'Active' : 'Inactive';
  }

  isPaymentPaid(packageItem: any): boolean {
    return `${packageItem?.payment_status ?? ''}`.trim().toLowerCase() === 'paid';
  }

  getPaymentStatus(packageItem: any): string {
    const status = `${packageItem?.payment_status ?? ''}`.trim().toLowerCase();
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : '-';
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
      maximumFractionDigits: 2,
    }).format(numericValue);
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
      year: 'numeric',
    }).format(date);
  }

  trackBySubscription(index: number, packageItem: any): number | string {
    return packageItem?.subscription_id ?? packageItem?.package_id ?? index;
  }

  editCompany(item: any): void {
    const companyName = item?.name || 'Company';
    this.toastrService.warning(`${companyName} edit API is not connected yet.`, 'Company');
  }

  deactivateCompany(item: any): void {
    if (!this.isCompanyActive(item)) {
      return;
    }

    const companyName = item?.name || 'Company';
    this.toastrService.warning(`${companyName} deactivate API is not connected yet.`, 'Company');
  }

  gotoAddCompany(): void {
    this.router.navigate(['pages/admin-setting/add-company']);
  }

  private getTenantId(item: any): any {
    return item?.tenant_id ?? item?.id ?? item?.company_id ?? null;
  }

  private createEmptySubscriptionModel(tenantId: any = null, packageId: any = null): any {
    return {
      tenant_id: tenantId,
      package_id: packageId,
      payment_status: 'pending',
      payment_method: null,
      transaction_id: '',
      invoice_id: '',
    };
  }
}
