// ...existing code...
import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { DatePipe } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'ngx-customers-list',
  templateUrl: './customers-list.component.html',
  styleUrls: ['./customers-list.component.scss']
})
export class CustomersListComponent implements OnInit{

  showCustomerPopup = false;
  showDocumentViewer = false;
  selectedDocumentUrl = '';
  selectedDocumentViewerUrl: SafeResourceUrl | string = '';
  selectedDocumentName = '';
  selectedCustomer: any = null;
  allCustomers: any[] = [];

  openCustomerPopup(customer: any) {
    this.selectedCustomer = customer;
    this.showCustomerPopup = true;
  }

  closeCustomerPopup() {
    this.showCustomerPopup = false;
    this.selectedCustomer = null;
    this.closeDocumentViewer();
  }

  private formatDateOnly(value: any): string {
    if (!value) {
      return '-';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return `${value}`;
    }

    return this.datePipe.transform(date, 'dd/MM/yyyy') || `${value}`;
  }

  getCustomerDateLabel(customer: any): string {
    return customer?.customer_type === 'Business' ? 'Date of Incorporation' : 'Date of Birth';
  }

  getCustomerDateValue(customer: any): string {
    if (customer?.customer_type === 'Business') {
      return this.formatDateOnly(customer?.doi);
    }

    return this.formatDateOnly(customer?.dob);
  }

  getCustomerDocuments(customer: any): Array<{ name: string; path: string; type: 'image' | 'pdf' | 'file' }> {
    return [
      {
        name: customer?.document_1_name || 'Document 1',
        path: customer?.document_1 || '',
        type: this.getDocumentType(customer?.document_1 || ''),
      },
      {
        name: customer?.document_2_name || 'Document 2',
        path: customer?.document_2 || '',
        type: this.getDocumentType(customer?.document_2 || ''),
      },
    ].filter((document: { name: string; path: string; type: 'image' | 'pdf' | 'file' }) => !!document.path);
  }

  private getDocumentType(path: string): 'image' | 'pdf' | 'file' {
    const normalizedPath = `${path || ''}`.toLowerCase();

    if (normalizedPath.endsWith('.pdf')) {
      return 'pdf';
    }

    if (/\.(png|jpg|jpeg|gif|webp|bmp|svg)$/.test(normalizedPath)) {
      return 'image';
    }

    return 'file';
  }

  getDocumentUrl(path: string): string {
    if (!path) {
      return '';
    }

    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    const baseUrl = (environment as any)?.apiBaseUrl || '';
    return `${baseUrl}${path}`.replace(/([^:]\/)\/+/g, '$1');
  }

  isPdfDocument(document: { type?: string; path?: string }): boolean {
    return document?.type === 'pdf' || this.getDocumentType(document?.path || '') === 'pdf';
  }

  openDocumentViewer(document: { name: string; path: string }): void {
    this.selectedDocumentName = document?.name || 'Document';
    this.selectedDocumentUrl = this.getDocumentUrl(document?.path || '');
    this.selectedDocumentViewerUrl = this.isPdfDocument(document)
      ? this.sanitizer.bypassSecurityTrustResourceUrl(this.selectedDocumentUrl)
      : this.selectedDocumentUrl;
    this.showDocumentViewer = !!this.selectedDocumentUrl;
  }

  closeDocumentViewer(): void {
    this.showDocumentViewer = false;
    this.selectedDocumentUrl = '';
    this.selectedDocumentViewerUrl = '';
    this.selectedDocumentName = '';
  }

  model: any = [];
  isSubmitting: boolean = false;
  loading: boolean = false; // <-- Add this to your class
  apiData: any = [];
  lastSearchForm: string = '';

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
    private router : Router,
    private dialogService: NbDialogService,
    private datePipe: DatePipe,
    private sanitizer: DomSanitizer,
  ) { }


  ngOnInit(): void {
    this.getCustomerList();
  }

  get businessCustomersCount(): number {
    return this.allCustomers.filter((customer: any) =>
      `${customer?.customer_type || ''}`.trim().toLowerCase() === 'business'
    ).length;
  }

  get individualCustomersCount(): number {
    return this.allCustomers.filter((customer: any) =>
      `${customer?.customer_type || ''}`.trim().toLowerCase() === 'individual'
    ).length;
  }

  getCustomerName(customer: any): string {
    const contactName = `${customer?.primary_contact_f_name || ''} ${customer?.primary_contact_l_name || ''}`.trim();
    return customer?.display_name || customer?.company_name || contactName || '-';
  }

  getCustomerInitials(customer: any): string {
    return this.getCustomerName(customer)
      .split(/\s+/)
      .filter((part: string) => !!part)
      .slice(0, 2)
      .map((part: string) => part.charAt(0).toUpperCase())
      .join('') || 'CU';
  }

  getCustomerLocation(customer: any): string {
    return customer?.billing_city || customer?.shipping_city || customer?.source_of_supply || '-';
  }

  getCustomerList() {
    this.loading = true;
    this.globalService.getCustomerListByTenant(34).subscribe({
      next: (res: any) => {
        console.log("customer list response", res);
        this.allCustomers = res?.data || [];
        this.apiData = [...this.allCustomers];
        this.onSearch(this.lastSearchForm);
        this.loading = false;
      },
      error: (err) => {
        console.error('Submit error:', err);
        const errorMessage =
          err?.error?.message ||
          err?.message ||
          'Customer List Failed. Please try again.';

        this.toastrService.danger(errorMessage, 'Customer List Failed');
        this.loading = false;
      },
    });
  }
  onSearch(query: string = ''): void {
    this.lastSearchForm = query || '';
    const searchText = this.lastSearchForm.trim().toLowerCase();

    if (!searchText) {
      this.apiData = [...this.allCustomers];
      return;
    }

    this.apiData = this.allCustomers.filter((customer: any) => {
      const searchableValues = [
        customer?.display_name,
        customer?.company_name,
        customer?.primary_contact_f_name,
        customer?.primary_contact_l_name,
        `${customer?.primary_contact_f_name || ''} ${customer?.primary_contact_l_name || ''}`.trim(),
        customer?.customer_type,
        customer?.customer_group,
        customer?.email,
        customer?.mobile_no,
        customer?.work_phone,
        customer?.department,
        customer?.designation,
        customer?.source_of_supply,
        customer?.billing_city,
        customer?.shipping_city
      ];

      return searchableValues.some((value: any) =>
        String(value || '').toLowerCase().includes(searchText)
      );
    });
  }

  clearSearch(): void {
    this.onSearch('');
  }

  trackByCustomer(index: number, customer: any): number | string {
    return customer?.id ?? index;
  }

  onEdit(customer: any): void {
    this.router.navigate(['pages/sales/update-customer'], {
      state: {
        isEditMode: true,
        customerData: customer,
      }
    });
  }

  gotoAddCustomerPage() {
    this.router.navigate(['pages/sales/add-customer']);
  }
}
