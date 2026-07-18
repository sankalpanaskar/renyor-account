import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
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
  invoicePreviewHtml: SafeHtml = '';
  private invoicePreviewRawHtml = '';
  invoicePreviewLoading = false;
  invoicePreviewError = '';
  private invoiceTemplateHtml = '';

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
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
    this.loadInvoicePreview(invoice);
  }

  closeInvoicePopup(): void {
    this.showInvoicePopup = false;
    this.selectedInvoice = null;
    this.invoicePreviewError = '';
  }

  private loadInvoicePreview(invoice: any): void {
    this.invoicePreviewLoading = true;
    this.invoicePreviewError = '';

    if (this.invoiceTemplateHtml) {
      this.renderInvoicePreview(invoice);
      return;
    }

    this.http.get('assets/format/invoice.html', { responseType: 'text' }).subscribe({
      next: (template: string) => {
        this.invoiceTemplateHtml = template;
        this.renderInvoicePreview(invoice);
      },
      error: () => {
        this.invoicePreviewLoading = false;
        this.invoicePreviewError = 'The invoice format template could not be loaded.';
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  private renderInvoicePreview(invoice: any): void {
    const config = this.getInvoiceFormatConfiguration();
    const columns = config.columns.filter((column: any) => column.enabled);
    const headers = columns.length
      ? columns.map((column: any) => `<th class="align-${this.getColumnAlign(column.align)}">${this.escapeHtml(column.label)}</th>`).join('')
      : '<th>Items</th>';
    const invoiceItems = this.getInvoiceItems(invoice);
    const rows = invoiceItems.length && columns.length
      ? invoiceItems.map((item: any, index: number) => `<tr>${columns.map((column: any) =>
          `<td class="align-${this.getColumnAlign(column.align)}">${this.getInvoiceItemColumnValue(column.key, item, index)}</td>`
        ).join('')}</tr>`).join('')
      : `<tr><td colspan="${Math.max(columns.length, 1)}" class="align-center">No invoice items available.</td></tr>`;
    const accentColor = /^#[0-9a-f]{6}$/i.test(config.header.accentColor)
      ? config.header.accentColor
      : '#3366ff';
    const logoUrl = `${config.header.logoUrl || ''}`.trim();
    const logoBlock = config.header.showLogo && logoUrl
      ? `<img class="document-logo" src="${this.escapeHtml(logoUrl)}" alt="Business logo">`
      : '<div class="document-logo-placeholder">RY</div>';
    const tokens: { [key: string]: string } = {
      '{{ACCENT_COLOR}}': accentColor,
      '{{HEADER_DISPLAY}}': config.header.visible === false ? 'none' : 'flex',
      '{{BODY_DISPLAY}}': config.body.visible === false ? 'none' : 'block',
      '{{FOOTER_DISPLAY}}': config.footer.visible === false ? 'none' : 'block',
      '{{LOGO_BLOCK}}': logoBlock,
      '{{BUSINESS_NAME}}': this.escapeHtml(config.header.businessName),
      '{{BUSINESS_ADDRESS}}': this.multilineHtml(config.header.businessAddress),
      '{{DOCUMENT_TITLE}}': this.escapeHtml(config.header.documentTitle || 'Invoice'),
      '{{DOCUMENT_NUMBER_LABEL}}': 'Invoice Number',
      '{{DOCUMENT_NUMBER}}': this.escapeHtml(this.getInvoiceNumber(invoice)),
      '{{CUSTOMER_LABEL}}': this.escapeHtml(config.body.customerLabel || 'Bill To'),
      '{{BILL_TO}}': this.getInvoiceAddressHtml(invoice, 'billing'),
      '{{SHIP_TO}}': this.getInvoiceAddressHtml(invoice, 'shipping'),
      '{{DOCUMENT_DETAILS}}': this.getInvoiceDetailsHtml(invoice),
      '{{BODY_INTRO}}': this.multilineHtml(config.body.introText),
      '{{TABLE_HEADERS}}': headers,
      '{{TABLE_ROW}}': rows,
      '{{TABLE_COLSPAN}}': `${Math.max(columns.length, 1)}`,
      '{{SUB_TOTAL}}': this.escapeHtml(this.formatCurrency(invoice?.sub_total)),
      '{{TAX_LABEL}}': this.escapeHtml(invoice?.tax_mode || 'Tax'),
      '{{TAX_AMOUNT}}': this.escapeHtml(this.formatCurrency(invoice?.tax_amount)),
      '{{TOTAL}}': this.escapeHtml(this.formatCurrency(this.getInvoiceTotal(invoice))),
      '{{PAYMENT_DISPLAY}}': config.body.showPaymentDetails ? 'block' : 'none',
      '{{PAYMENT_DETAILS}}': this.multilineHtml(config.body.paymentDetails),
      '{{NOTES}}': this.multilineHtml(invoice?.customer_notes || config.body.notes),
      '{{TERMS}}': this.multilineHtml(invoice?.terms_and_conditions || invoice?.terms_conditions || config.body.terms),
      '{{FOOTER_TEXT}}': this.multilineHtml(config.footer.text),
      '{{PAGE_NUMBER}}': config.footer.showPageNumber ? 'Page 1 of 1' : '',
    };

    let renderedTemplate = this.invoiceTemplateHtml;
    Object.keys(tokens).forEach((token: string) => {
      renderedTemplate = renderedTemplate.split(token).join(tokens[token]);
    });
    this.invoicePreviewRawHtml = renderedTemplate;
    this.invoicePreviewHtml = this.sanitizer.bypassSecurityTrustHtml(renderedTemplate);
    this.invoicePreviewLoading = false;
    this.changeDetectorRef.detectChanges();
  }

  private getInvoiceFormatConfiguration(): any {
    const defaults = {
      header: {
        visible: true,
        showLogo: true,
        logoUrl: 'https://msmeaccounts.com/assets/images/logo.png',
        businessName: 'RenYor',
        businessAddress: '123 Business Street, Kolkata, West Bengal\nGSTIN: 19XXXXX0000X1XX',
        documentTitle: 'Invoice',
        accentColor: '#3366ff',
      },
      body: {
        visible: true,
        customerLabel: 'Bill To',
        introText: '',
        notes: 'Thank you for your business.',
        terms: 'Payment is due according to the terms stated on this document.',
        showPaymentDetails: true,
        paymentDetails: 'Bank: Your Bank\nAccount: 0000000000\nIFSC: XXXX0000000',
      },
      footer: {
        visible: true,
        text: 'RenYor · billing@renyor.com · +91 00000 00000',
        showPageNumber: true,
      },
      columns: this.getDefaultInvoiceColumns(),
    };
    const storedValue = localStorage.getItem('document-format-config:invoice');
    if (!storedValue) {
      return defaults;
    }

    try {
      const stored = JSON.parse(storedValue);
      return {
        ...defaults,
        ...stored,
        header: { ...defaults.header, ...(stored?.header || {}) },
        body: { ...defaults.body, ...(stored?.body || {}) },
        footer: { ...defaults.footer, ...(stored?.footer || {}) },
        columns: Array.isArray(stored?.columns) ? stored.columns : defaults.columns,
      };
    } catch {
      return defaults;
    }
  }

  private getDefaultInvoiceColumns(): any[] {
    return [
      { key: 'serial', label: '#', enabled: true, align: 'center' },
      { key: 'item', label: 'Item', enabled: true, align: 'left' },
      { key: 'description', label: 'Description', enabled: true, align: 'left' },
      { key: 'hsn', label: 'HSN/SAC', enabled: true, align: 'left' },
      { key: 'quantity', label: 'Qty', enabled: true, align: 'right' },
      { key: 'unit', label: 'Unit', enabled: false, align: 'center' },
      { key: 'rate', label: 'Rate', enabled: true, align: 'right' },
      { key: 'tax', label: 'Tax', enabled: true, align: 'right' },
      { key: 'discount', label: 'Discount', enabled: false, align: 'right' },
      { key: 'amount', label: 'Amount', enabled: true, align: 'right' },
    ];
  }

  private getInvoiceItemColumnValue(key: string, item: any, index: number): string {
    const values: { [key: string]: any } = {
      serial: index + 1,
      item: item?.item_name || item?.item_details || item?.name || '-',
      description: item?.item_description || item?.description || '-',
      hsn: item?.hsn_sac || item?.hsn_code || item?.sac || '-',
      quantity: item?.quantity ?? 0,
      unit: item?.unit || item?.item_unit || '-',
      rate: this.formatCurrency(item?.rate),
      tax: item?.tax || '-',
      discount: this.formatCurrency(item?.discount || 0),
      amount: this.formatCurrency(item?.amount ?? (Number(item?.quantity || 0) * Number(item?.rate || 0))),
    };
    return this.escapeHtml(values[key] ?? '-');
  }

  private getInvoiceAddressHtml(invoice: any, type: 'billing' | 'shipping'): string {
    const customer = invoice?.customer || {};
    const displayName = invoice?.customer_display_name || invoice?.customer_company_name
      || customer?.display_name || customer?.company_name || this.getCustomerName(invoice);
    const contactName = `${invoice?.customer_first_name || customer?.primary_contact_f_name || ''} ${invoice?.customer_last_name || customer?.primary_contact_l_name || ''}`.trim();
    const prefix = type === 'billing' ? 'billing' : 'shipping';
    const addressParts = [
      invoice?.[`${prefix}_address`] || customer?.[`${prefix}_address`],
      invoice?.[`${prefix}_street`] || customer?.[`${prefix}_street`],
      invoice?.[`${prefix}_city`] || customer?.[`${prefix}_city`],
      invoice?.[`${prefix}_state`] || customer?.[`${prefix}_state`] || (type === 'billing' ? invoice?.customer_state : ''),
      invoice?.[`${prefix}_pin`] || invoice?.[`${prefix}_pincode`] || customer?.[`${prefix}_pin`],
      invoice?.[`${prefix}_country`] || customer?.[`${prefix}_country`],
    ].filter((value: any) => `${value || ''}`.trim());

    if (type === 'shipping' && addressParts.length === 0) {
      return this.getInvoiceAddressHtml(invoice, 'billing');
    }

    const lines = [`<strong>${this.escapeHtml(displayName)}</strong>`];
    if (contactName && contactName !== displayName) {
      lines.push(`Attn: ${this.escapeHtml(contactName)}`);
    }
    if (addressParts.length) {
      lines.push(this.escapeHtml(addressParts.join(', ')));
    }
    const gstNumber = invoice?.customer_gst || invoice?.gst_no || customer?.gst_no;
    if (gstNumber) {
      lines.push(`GSTIN: ${this.escapeHtml(gstNumber)}`);
    }
    return lines.join('<br>');
  }

  private getInvoiceDetailsHtml(invoice: any): string {
    const details = [
      ['Invoice Date', this.formatDate(invoice?.invoice_date || invoice?.date)],
      ['Due Date', this.formatDate(invoice?.due_date)],
      ['Terms', invoice?.term || invoice?.payment_term || '-'],
      ['Order No.', invoice?.order_no || '-'],
    ];
    return details.map((detail: any[]) =>
      `<tr><td>${this.escapeHtml(detail[0])}</td><td>${this.escapeHtml(detail[1])}</td></tr>`
    ).join('');
  }

  private getColumnAlign(value: any): 'left' | 'right' | 'center' {
    return value === 'right' || value === 'center' ? value : 'left';
  }

  private multilineHtml(value: any): string {
    return this.escapeHtml(value || '').replace(/\r?\n/g, '<br>');
  }

  private escapeHtml(value: any): string {
    return `${value ?? ''}`
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
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
    const invoiceId = this.getInvoiceId(invoice);
    if (!invoiceId) {
      this.toastrService.danger('Invoice id is missing.', 'Download Failed');
      return;
    }

    this.downloadingInvoiceId = invoiceId;

    if (this.invoiceTemplateHtml) {
      this.renderInvoicePreview(invoice);
      this.requestGeneratedInvoicePdf(invoice);
      return;
    }

    this.http.get('assets/format/invoice.html', { responseType: 'text' }).subscribe({
      next: (template: string) => {
        this.invoiceTemplateHtml = template;
        this.renderInvoicePreview(invoice);
        this.requestGeneratedInvoicePdf(invoice);
      },
      error: () => {
        this.downloadingInvoiceId = null;
        this.toastrService.danger('The invoice template could not be loaded.', 'PDF Failed');
      },
    });
  }

  private requestGeneratedInvoicePdf(invoice: any): void {
    const invoiceId = this.getInvoiceId(invoice);
    if (!invoiceId || !this.invoicePreviewRawHtml) {
      this.downloadingInvoiceId = null;
      this.toastrService.danger('Invoice HTML could not be generated.', 'PDF Failed');
      return;
    }

    const invoiceNumber = this.getInvoiceNumber(invoice).replace(/[^a-z0-9_-]+/gi, '-');
    const fileName = `${invoiceNumber || 'invoice'}.pdf`;
    this.globalService.generateInvoicePdf({
      invoice_id: invoiceId,
      document_type: 'invoice',
      file_name: fileName,
      html: this.invoicePreviewRawHtml,
    }).subscribe({
      next: (pdfBlob: Blob) => {
        if (!pdfBlob || pdfBlob.size === 0) {
          this.downloadingInvoiceId = null;
          this.toastrService.danger('The backend returned an empty PDF.', 'PDF Failed');
          return;
        }

        const objectUrl = window.URL.createObjectURL(pdfBlob);
        const anchor = document.createElement('a');
        anchor.href = objectUrl;
        anchor.download = fileName;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.URL.revokeObjectURL(objectUrl);
        this.downloadingInvoiceId = null;
        this.changeDetectorRef.detectChanges();
      },
      error: (error: any) => {
        this.downloadingInvoiceId = null;
        this.toastrService.danger(
          error?.error?.message || error?.message || 'The invoice PDF could not be generated.',
          'PDF Failed',
        );
        this.changeDetectorRef.detectChanges();
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
