import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { environment } from '../../../../environments/environment';
import { GlobalService } from '../../../services/global.service';

@Component({
  selector: 'ngx-invoice-list',
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.scss'],
})
export class InvoiceListComponent implements OnInit {
  allInvoices: any[] = [];
  apiData: any[] = [];
  searchText = '';
  loadError = '';
  loading = false;
  downloadingInvoiceId: string | number | null = null;
  deleting = false;
  showInvoicePopup = false;
  selectedInvoice: any = null;
  pendingDeleteInvoice: any = null;

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.fetchInvoices();
  }

  get paidInvoicesCount(): number {
    return this.allInvoices.filter((invoice: any) => this.getInvoiceStatus(invoice).toLowerCase() === 'paid').length;
  }

  get outstandingTotal(): number {
    return this.allInvoices.reduce((total: number, invoice: any) => total + this.getBalance(invoice), 0);
  }

  fetchInvoices(): void {
    this.loading = true;
    this.loadError = '';
    this.globalService.fetchInvoices().subscribe({
      next: (res: any) => {
        const invoices = this.extractInvoices(res);
        this.allInvoices = [...invoices];
        this.onSearch(this.searchText);
        this.loading = false;
        this.changeDetectorRef.detectChanges();
      },
      error: (error: any) => {
        this.loading = false;
        this.loadError = error?.error?.message || error?.message || 'Invoice list could not be loaded.';
        this.toastrService.danger(
          this.loadError,
          'Invoice List Failed',
        );
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  private extractInvoices(response: any): any[] {
    const normalizedResponse = this.parseJsonValue(response);
    const candidates = [
      normalizedResponse,
      normalizedResponse?.body,
      normalizedResponse?.data,
      normalizedResponse?.body?.data,
      normalizedResponse?.data?.data,
      normalizedResponse?.invoices,
      normalizedResponse?.result,
      normalizedResponse?.result?.data,
      normalizedResponse?.records,
      normalizedResponse?.rows,
    ];

    for (const candidate of candidates) {
      const normalizedCandidate = this.parseJsonValue(candidate);
      if (Array.isArray(normalizedCandidate)) {
        return normalizedCandidate;
      }
    }

    const dataObject = this.parseJsonValue(normalizedResponse?.data);
    if (dataObject && typeof dataObject === 'object') {
      const keys = Object.keys(dataObject);
      if (keys.length > 0 && keys.every((key: string) => /^\d+$/.test(key))) {
        return Object.values(dataObject);
      }
    }

    return [];
  }

  private parseJsonValue(value: any): any {
    if (typeof value !== 'string') {
      return value;
    }

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  onSearch(query: string = ''): void {
    this.searchText = query || '';
    const searchValue = this.searchText.trim().toLowerCase();

    if (!searchValue) {
      this.apiData = [...this.allInvoices];
      return;
    }

    this.apiData = this.allInvoices.filter((invoice: any) => [
      this.getInvoiceNumber(invoice),
      this.getCustomerName(invoice),
      this.getInvoiceStatus(invoice),
      invoice?.order_no,
      invoice?.subject,
      invoice?.salesperson,
      invoice?.total,
    ].some((value: any) => `${value ?? ''}`.toLowerCase().includes(searchValue)));
  }

  clearSearch(): void {
    this.onSearch('');
  }

  gotoAddInvoice(): void {
    this.router.navigate(['/pages/sales/add-invoice']);
  }

  editInvoice(invoice: any): void {
    this.router.navigate(['/pages/sales/update-invoice'], {
      state: {
        isEditMode: true,
        invoiceData: invoice,
      },
    });
  }

  openInvoicePopup(invoice: any): void {
    this.selectedInvoice = invoice;
    this.showInvoicePopup = true;
  }

  closeInvoicePopup(): void {
    this.showInvoicePopup = false;
    this.selectedInvoice = null;
  }

  requestDeleteInvoice(invoice: any): void {
    this.pendingDeleteInvoice = invoice;
  }

  cancelDeleteInvoice(): void {
    if (!this.deleting) {
      this.pendingDeleteInvoice = null;
    }
  }

  confirmDeleteInvoice(): void {
    const invoiceId = this.getInvoiceId(this.pendingDeleteInvoice);
    if (!invoiceId) {
      this.toastrService.danger('Invoice id is missing.', 'Delete Failed');
      return;
    }

    this.deleting = true;
    this.globalService.deleteInvoice(invoiceId).subscribe({
      next: (res: any) => {
        this.allInvoices = this.allInvoices.filter((invoice: any) => this.getInvoiceId(invoice) !== invoiceId);
        this.onSearch(this.searchText);
        this.pendingDeleteInvoice = null;
        this.deleting = false;
        this.toastrService.success(res?.message || 'Invoice deleted successfully.', 'Deleted');
      },
      error: (error: any) => {
        this.deleting = false;
        this.toastrService.danger(
          error?.error?.message || error?.message || 'Invoice could not be deleted.',
          'Delete Failed',
        );
      },
    });
  }

  downloadPdf(invoice: any): void {
    const existingPdfUrl = this.getPdfUrl(invoice);
    if (existingPdfUrl) {
      window.open(existingPdfUrl, '_blank', 'noopener');
      return;
    }

    const invoiceId = this.getInvoiceId(invoice);
    if (!invoiceId) {
      this.toastrService.danger('Invoice id is missing.', 'Download Failed');
      return;
    }

    this.downloadingInvoiceId = invoiceId;
    this.globalService.downloadInvoicePdf(invoiceId).subscribe({
      next: (blob: Blob) => {
        const objectUrl = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = objectUrl;
        anchor.download = `${this.getInvoiceNumber(invoice) || 'invoice'}.pdf`;
        anchor.click();
        window.URL.revokeObjectURL(objectUrl);
        this.downloadingInvoiceId = null;
      },
      error: (error: any) => {
        this.downloadingInvoiceId = null;
        this.toastrService.danger(
          error?.error?.message || error?.message || 'Invoice PDF could not be downloaded.',
          'Download Failed',
        );
      },
    });
  }

  isDownloading(invoice: any): boolean {
    return this.downloadingInvoiceId === this.getInvoiceId(invoice);
  }

  getInvoiceId(invoice: any): string | number | null {
    return invoice?.invoice_id ?? invoice?.id ?? null;
  }

  getInvoiceNumber(invoice: any): string {
    return `${invoice?.invoice_no ?? invoice?.invoice_number ?? invoice?.number ?? '-'}`;
  }

  getCustomerName(invoice: any): string {
    const customer = invoice?.customer || {};
    const contactName = `${customer?.primary_contact_f_name || ''} ${customer?.primary_contact_l_name || ''}`.trim();
    const invoiceContactName = `${invoice?.customer_first_name || ''} ${invoice?.customer_last_name || ''}`.trim();
    return invoice?.customer_display_name
      || invoice?.customer_company_name
      || invoice?.customer_name
      || invoice?.display_name
      || customer?.display_name
      || customer?.company_name
      || invoiceContactName
      || contactName
      || '-';
  }

  getCustomerInitials(invoice: any): string {
    return this.getCustomerName(invoice).split(/\s+/).filter(Boolean).slice(0, 2)
      .map((word: string) => word.charAt(0).toUpperCase()).join('') || 'IN';
  }

  getInvoiceStatus(invoice: any): string {
    return `${invoice?.payment_status ?? invoice?.status ?? 'Unpaid'}`.trim() || 'Unpaid';
  }

  getStatusClass(invoice: any): string {
    const status = this.getInvoiceStatus(invoice).toLowerCase();
    if (status === 'paid') {
      return 'paid-status';
    }
    if (status.includes('overdue') || status.includes('cancel')) {
      return 'overdue-status';
    }
    if (status.includes('partial')) {
      return 'partial-status';
    }
    return 'unpaid-status';
  }

  getInvoiceTotal(invoice: any): number {
    return Number(invoice?.total ?? invoice?.grand_total ?? invoice?.amount ?? 0) || 0;
  }

  getBalance(invoice: any): number {
    const explicitBalance = invoice?.balance_due ?? invoice?.balance ?? invoice?.amount_due;
    if (explicitBalance !== undefined && explicitBalance !== null && `${explicitBalance}` !== '') {
      return Number(explicitBalance) || 0;
    }

    return this.getInvoiceStatus(invoice).toLowerCase() === 'paid' ? 0 : this.getInvoiceTotal(invoice);
  }

  getInvoiceItems(invoice: any): any[] {
    const rawItems = invoice?.items ?? invoice?.invoice_items ?? invoice?.details ?? [];
    if (Array.isArray(rawItems)) {
      return rawItems;
    }
    if (typeof rawItems === 'string') {
      try {
        const items = JSON.parse(rawItems);
        return Array.isArray(items) ? items : [];
      } catch {
        return [];
      }
    }
    return [];
  }

  getPdfUrl(invoice: any): string {
    const path = invoice?.pdf_url ?? invoice?.invoice_pdf ?? invoice?.pdf_path ?? invoice?.download_url ?? '';
    if (!path) {
      return '';
    }
    if (/^https?:\/\//i.test(path)) {
      return path;
    }
    return `${(environment as any)?.apiBaseUrl || ''}${path}`.replace(/([^:]\/)\/+/g, '$1');
  }

  formatCurrency(value: any): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value || 0));
  }

  formatDate(value: any): string {
    if (!value) {
      return '-';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return `${value}`;
    }
    return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
  }

  trackByInvoice(index: number, invoice: any): string | number {
    return invoice?.invoice_id ?? invoice?.id ?? index;
  }
}
