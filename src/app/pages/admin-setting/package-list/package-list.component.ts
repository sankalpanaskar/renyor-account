import { Component, OnInit } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { Router } from '@angular/router';
import { GlobalService } from '../../../services/global.service';

@Component({
  selector: 'ngx-package-list',
  templateUrl: './package-list.component.html',
  styleUrls: ['./package-list.component.scss']
})
export class PackageListComponent implements OnInit {
  allPackages: any[] = [];
  apiData: any[] = [];
  searchText = '';
  loading = false;
  showPackagePopup = false;
  selectedPackage: any = null;

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
    private router: Router,
  ) {}

  get activePackagesCount(): number {
    return this.allPackages.filter((item: any) => this.isPackageActive(item)).length;
  }

  get inactivePackagesCount(): number {
    return this.allPackages.length - this.activePackagesCount;
  }

  ngOnInit(): void {
    this.getPackage();
  }

  getPackage(): void {
    this.loading = true;
    this.globalService.gePackageList().subscribe({
      next: (res: any) => {
        this.allPackages = res?.data || res || [];
        this.apiData = [...this.allPackages];
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
      this.apiData = [...this.allPackages];
      return;
    }

    this.apiData = this.allPackages.filter((item: any) => {
      const values = [
        item?.package_name,
        item?.package_type,
        item?.package_details,
        item?.base_price,
        item?.offer_price,
        item?.final_price,
        this.getPackageStatus(item),
      ];

      return values.some((value: any) => String(value ?? '').toLowerCase().includes(searchValue));
    });
  }

  clearSearch(): void {
    this.onSearch('');
  }

  isPackageActive(item: any): boolean {
    const status = item?.status;
    return status === 1 || status === true || `${status}`.trim().toLowerCase() === 'active';
  }

  getPackageStatus(item: any): string {
    return this.isPackageActive(item) ? 'Active' : 'Inactive';
  }

  getPackageType(item: any): string {
    return item?.package_type || item?.type || '-';
  }

  formatCurrency(value: any): string {
    if (value === null || value === undefined || `${value}`.trim() === '') {
      return '-';
    }

    const numericValue = Number(`${value}`.replace(/,/g, ''));
    if (Number.isNaN(numericValue)) {
      return String(value);
    }

    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numericValue);
  }

  trackByPackage(index: number, item: any): number | string {
    return item?.id ?? item?.package_id ?? index;
  }

  openPackagePopup(item: any): void {
    this.selectedPackage = item;
    this.showPackagePopup = true;
  }

  closePackagePopup(): void {
    this.showPackagePopup = false;
    this.selectedPackage = null;
  }

  gotoAddPackage(): void {
    this.router.navigate(['pages/admin-setting/add-package']);
  }
}
