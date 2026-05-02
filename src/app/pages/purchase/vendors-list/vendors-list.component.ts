import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-vendors-list',
  templateUrl: './vendors-list.component.html',
  styleUrls: ['./vendors-list.component.scss']
})
export class VendorsListComponent implements OnInit {
  showVendorPopup = false;
  selectedVendor: any = null;
  allVendors: any[] = [];
  model: any = [];
  isSubmitting: boolean = false;
  loading: boolean = false;
  apiData: any[] = [];
  lastSearchForm: string = '';

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
    private router : Router
  ) { }


  ngOnInit(): void {
    this.getVendorList();
  }

  openVendorPopup(vendor: any): void {
    this.selectedVendor = vendor;
    this.showVendorPopup = true;
  }

  closeVendorPopup(): void {
    this.showVendorPopup = false;
    this.selectedVendor = null;
  }

  onEdit(_vendor: any): void {
    this.toastrService.info('Vendor edit is not configured yet.', 'Edit Vendor');
  }

  getVendorList(): void {
    this.loading = true;
    this.globalService.getVendorListByTenant(46).subscribe({
      next: (res: any) => {
        this.allVendors = Array.isArray(res?.data) ? res.data : [];
        this.apiData = [...this.allVendors];
        this.onSearch(this.lastSearchForm);
        this.loading = false;
      },
      error: (err) => {
        console.error('Submit error:', err);
        const errorMessage =
          err?.error?.message ||
          err?.message ||
          'Vendor List Failed. Please try again.';

        this.toastrService.danger(errorMessage, 'Vendor List Failed');
        this.loading = false;
      },
    });
  }

  onSearch(query: string = ''): void {
    this.lastSearchForm = query || '';
    const searchText = this.lastSearchForm.trim().toLowerCase();

    if (!searchText) {
      this.apiData = [...this.allVendors];
      return;
    }

    this.apiData = this.allVendors.filter((vendor: any) => {
      const bankAccounts = this.getVendorBankAccounts(vendor);
      const bankSearchableValues = bankAccounts.reduce((values: any[], bank: any) => {
        values.push(
          bank?.account_holder_name,
          bank?.bank_name,
          bank?.account_number,
          bank?.ifsc,
        );

        return values;
      }, []);

      const searchableValues = [
        this.getVendorName(vendor),
        this.getPrimaryContact(vendor),
        vendor?.display_name,
        vendor?.company_name,
        vendor?.primary_contact_f_name,
        vendor?.primary_contact_l_name,
        vendor?.group_name,
        vendor?.group,
        vendor?.gst_treatment,
        vendor?.source_of_supply,
        vendor?.pan,
        this.getGstNumber(vendor),
        vendor?.email,
        vendor?.mobile_no,
        vendor?.work_phone,
        vendor?.department,
        vendor?.designation,
        vendor?.website,
        vendor?.document_1_name,
        vendor?.document_2_name,
        vendor?.billing_city,
        vendor?.shipping_city,
        ...bankSearchableValues,
      ];

      return searchableValues.some((value: any) =>
        String(value || '').toLowerCase().includes(searchText)
      );
    });
  }

  gotoAddVendorPage(): void {
    this.router.navigate(['pages/purchase/add-vendor']);
  }

  getVendorName(vendor: any): string {
    return vendor?.company_name
      || vendor?.display_name
      || this.getPrimaryContact(vendor)
      || '-';
  }

  getPrimaryContact(vendor: any): string {
    return `${vendor?.primary_contact_f_name || ''} ${vendor?.primary_contact_l_name || ''}`.trim();
  }

  getVendorGroupName(vendor: any): string {
    return vendor?.group_name || vendor?.group || '-';
  }

  getGstNumber(vendor: any): string {
    return vendor?.gst_no || vendor?.custom_field?.gst_no || '-';
  }

  getVendorBankAccounts(vendor: any): any[] {
    return Array.isArray(vendor?.bank_accounts) ? vendor.bank_accounts : [];
  }

  isMsmeRegistered(vendor: any): boolean {
    const value = vendor?.is_msme_registered;

    return value === true
      || value === 1
      || value === '1'
      || `${value}`.toLowerCase() === 'true'
      || `${value}`.toLowerCase() === 'yes'
      || !!vendor?.msme_registration_type
      || !!vendor?.msme_registration_number;
  }

  getCustomFieldEntries(vendor: any): Array<{ key: string; value: any }> {
    if (!vendor?.custom_field || typeof vendor.custom_field !== 'object') {
      return [];
    }

    return Object.keys(vendor.custom_field).map((key: string) => ({
      key,
      value: this.formatFieldValue(vendor.custom_field[key]),
    }));
  }

  getMaskedAccountNumber(accountNumber: any): string {
    const value = `${accountNumber || ''}`;

    if (!value) {
      return '-';
    }

    if (value.length <= 4) {
      return value;
    }

    return `${'*'.repeat(value.length - 4)}${value.slice(-4)}`;
  }

  private formatFieldValue(value: any): string {
    if (value === undefined || value === null || value === '') {
      return '-';
    }

    if (Array.isArray(value)) {
      return value.join(', ');
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return `${value}`;
  }
}
