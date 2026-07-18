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
  searchText = '';
  loading = false;
  showCompanyPopup = false;
  selectedCompany: any = null;

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
        item?.package_name,
        item?.package_type,
        item?.industry,
        item?.email,
        item?.phone,
        item?.country,
        item?.state,
        item?.city,
        item?.pin,
        item?.pan,
        item?.gst,
        this.getCompanyStatus(item),
      ];

      return values.some((value: any) => String(value ?? '').toLowerCase().includes(searchValue));
    });
  }

  clearSearch(): void {
    this.onSearch('');
  }

  isCompanyActive(item: any): boolean {
    const status = item?.status;
    return status === 1 || status === true || `${status}`.trim().toLowerCase() === 'active';
  }

  getCompanyStatus(item: any): string {
    return this.isCompanyActive(item) ? 'Active' : 'Inactive';
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
}
