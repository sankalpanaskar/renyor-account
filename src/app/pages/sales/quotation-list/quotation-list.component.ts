import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { GlobalService } from '../../../services/global.service';
import { environment } from '../../../../environments/environment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ngx-quotation-list',
  templateUrl: './quotation-list.component.html',
  styleUrls: ['./quotation-list.component.scss'],
})
export class QuotationListComponent implements OnInit, OnDestroy {
  private readonly quotationModuleId = environment.moduleIds.quotation;

  allQuotations: any[] = [];
  apiData: any[] = [];
  searchText = '';
  loadError = '';
  loading = false;
  downloadingQuotationId: string | number | null = null;
  deleting = false;
  showQuotationPopup = false;
  selectedQuotation: any = null;
  pendingDeleteQuotation: any = null;
  quotationPreviewHtml: SafeHtml = '';
  private quotationPreviewRawHtml = '';
  quotationPreviewLoading = false;
  quotationPreviewError = '';
  private quotationTemplateHtml = '';
  private quotationCustomFields: any[] = [];
  private quotationFormatConfiguration: any = null;
  canCreate = false;
  private permissionSubscription?: Subscription;

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.permissionSubscription = this.globalService.menuPermissions$.subscribe(() => {
      this.canCreate = Number(this.globalService.getMenuPermissions('/pages/sales/quotation-list')?.can_create) === 1;
    });
    this.fetchQuotations();
    this.fetchQuotationCustomFields();
    this.fetchQuotationFormatConfiguration();
  }

  ngOnDestroy(): void {
    this.permissionSubscription?.unsubscribe();
  }

  private fetchQuotationFormatConfiguration(): void {
    this.globalService.fetchDocumentFormatConfiguration('quotation').subscribe({
      next: (response: any) => {
        const configuration = this.extractDocumentFormatConfiguration(response);
        if (!configuration) {
          return;
        }
        this.quotationFormatConfiguration = configuration;
        localStorage.setItem('document-format-config:quote', JSON.stringify(configuration));
        if (this.showQuotationPopup && this.selectedQuotation && this.quotationTemplateHtml) {
          this.renderQuotationPreview(this.selectedQuotation);
        }
      },
      error: () => {
        // The locally cached configuration remains available as an offline fallback.
      },
    });
  }

  private fetchQuotationCustomFields(): void {
    this.globalService.fetchCustomFieldsByModule(this.quotationModuleId).subscribe({
      next: (res: any) => {
        const fields = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        this.quotationCustomFields = fields
          .filter((field: any) => Number(field?.status) === 1)
          .sort((a: any, b: any) => Number(a?.field_order || 0) - Number(b?.field_order || 0));
        if (this.showQuotationPopup && this.selectedQuotation && this.quotationTemplateHtml) {
          this.renderQuotationPreview(this.selectedQuotation);
        }
      },
      error: () => {
        this.quotationCustomFields = [];
      },
    });
  }

  get acceptedQuotationsCount(): number {
    return this.allQuotations.filter((quotation: any) => {
      const status = this.getQuotationStatus(quotation).toLowerCase();
      return status === 'accepted' || status === 'approved';
    }).length;
  }

  get totalQuotationValue(): number {
    return this.allQuotations.reduce((total: number, quotation: any) => total + this.getQuotationTotal(quotation), 0);
  }

  fetchQuotations(): void {
    this.loading = true;
    this.loadError = '';
    this.globalService.fetchQuotations(this.quotationModuleId).subscribe({
      next: (res: any) => {
        const quotations = this.extractQuotations(res);
        this.allQuotations = [...quotations];
        this.onSearch(this.searchText);
        this.loading = false;
        this.changeDetectorRef.detectChanges();
      },
      error: (error: any) => {
        this.loading = false;
        this.loadError = error?.error?.message || error?.message || 'Quotation list could not be loaded.';
        this.toastrService.danger(
          this.loadError,
          'Quotation List Failed',
        );
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  private extractQuotations(response: any): any[] {
    const normalizedResponse = this.parseJsonValue(response);
    const candidates = [
      normalizedResponse,
      normalizedResponse?.body,
      normalizedResponse?.data,
      normalizedResponse?.body?.data,
      normalizedResponse?.data?.data,
      normalizedResponse?.quotations,
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
      this.apiData = [...this.allQuotations];
      return;
    }

    this.apiData = this.allQuotations.filter((quotation: any) => [
      this.getQuotationNumber(quotation),
      this.getCustomerName(quotation),
      this.getQuotationStatus(quotation),
      quotation?.ref_no ?? quotation?.reference_no,
      quotation?.subject,
      quotation?.salesperson,
      quotation?.total,
    ].some((value: any) => `${value ?? ''}`.toLowerCase().includes(searchValue)));
  }

  clearSearch(): void {
    this.onSearch('');
  }

  gotoAddQuotation(): void {
    if (!this.canCreate) {
      return;
    }
    this.router.navigate(['/pages/sales/add-quote']);
  }

  editQuotation(quotation: any): void {
    this.router.navigate(['/pages/sales/update-quotation'], {
      state: {
        isEditMode: true,
        quotationData: quotation,
      },
    });
  }

  openQuotationPopup(quotation: any): void {
    this.selectedQuotation = quotation;
    this.showQuotationPopup = true;
    this.loadQuotationPreview(quotation);
  }

  closeQuotationPopup(): void {
    this.showQuotationPopup = false;
    this.selectedQuotation = null;
    this.quotationPreviewError = '';
  }

  private loadQuotationPreview(quotation: any): void {
    this.quotationPreviewLoading = true;
    this.quotationPreviewError = '';

    if (this.quotationTemplateHtml) {
      this.renderQuotationPreview(quotation);
      return;
    }

    this.http.get('assets/format/invoice.html', { responseType: 'text' }).subscribe({
      next: (template: string) => {
        this.quotationTemplateHtml = template;
        this.renderQuotationPreview(quotation);
      },
      error: () => {
        this.quotationPreviewLoading = false;
        this.quotationPreviewError = 'The quotation format template could not be loaded.';
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  private renderQuotationPreview(quotation: any): void {
    const config = this.getQuotationFormatConfiguration();
    const columns = config.columns.filter((column: any) => column.enabled);
    const headers = columns.length
      ? columns.map((column: any) => `<th class="align-${this.getColumnAlign(column.align)}">${this.escapeHtml(column.label)}</th>`).join('')
      : '<th>Items</th>';
    const quotationItems = this.getQuotationItems(quotation);
    const rows = quotationItems.length && columns.length
      ? quotationItems.map((item: any, index: number) => `<tr>${columns.map((column: any) =>
          `<td class="align-${this.getColumnAlign(column.align)}">${this.getQuotationItemColumnValue(column.key, item, index)}</td>`
        ).join('')}</tr>`).join('')
      : `<tr><td colspan="${Math.max(columns.length, 1)}" class="align-center">No quotation items available.</td></tr>`;
    const accentColor = /^#[0-9a-f]{6}$/i.test(config.header.accentColor)
      ? config.header.accentColor
      : '#3366ff';
    const configuredLogoUrl = `${config.header.logoUrl || ''}`.trim();
    const logoUrl = !configuredLogoUrl || configuredLogoUrl === 'https://msmeaccounts.com/assets/images/logo.png'
      ? this.getTenantLogoUrl()
      : configuredLogoUrl;
    const logoBlock = config.header.showLogo && logoUrl
      ? `<img class="document-logo" src="${this.escapeHtml(logoUrl)}" alt="Business logo">`
      : '<div class="document-logo-placeholder">RY</div>';
    const customFieldEntries = this.getQuotationCustomFieldEntries(quotation, config);
    const showCustomFieldsAtTop = config.body.customFieldPosition === 'top';
    const quotationStatus = this.getQuotationStatus(quotation);
    const successfulStatuses = ['accepted', 'converted'];
    const quotationStatusClass = successfulStatuses.includes(quotationStatus.toLowerCase()) ? 'paid' : 'unpaid';
    const tokens: { [key: string]: string } = {
      '{{ACCENT_COLOR}}': accentColor,
      '{{HEADER_DISPLAY}}': config.header.visible === false ? 'none' : 'flex',
      '{{BODY_DISPLAY}}': config.body.visible === false ? 'none' : 'block',
      '{{FOOTER_DISPLAY}}': config.footer.visible === false ? 'none' : 'block',
      '{{LOGO_BLOCK}}': logoBlock,
      '{{BUSINESS_NAME}}': this.escapeHtml(config.header.businessName),
      '{{BUSINESS_ADDRESS}}': this.multilineHtml(config.header.businessAddress),
      '{{DOCUMENT_TITLE}}': this.escapeHtml(config.header.documentTitle || 'Quotation'),
      '{{DOCUMENT_NUMBER_LABEL}}': 'Quotation Number',
      '{{DOCUMENT_NUMBER}}': this.escapeHtml(this.getQuotationNumber(quotation)),
      '{{PAYMENT_STATUS}}': this.escapeHtml(quotationStatus),
      '{{PAYMENT_STATUS_CLASS}}': quotationStatusClass,
      '{{CUSTOMER_LABEL}}': this.escapeHtml(config.body.customerLabel || 'Bill To'),
      '{{BILL_TO}}': this.getQuotationAddressHtml(quotation, 'billing'),
      '{{SHIP_TO}}': this.getQuotationAddressHtml(quotation, 'shipping'),
      '{{DOCUMENT_DETAILS}}': this.getQuotationDetailsHtml(
        quotation,
        showCustomFieldsAtTop ? customFieldEntries : [],
        config.body,
      ),
      '{{BODY_INTRO}}': this.multilineHtml(config.body.introText),
      '{{TABLE_HEADERS}}': headers,
      '{{TABLE_ROW}}': rows,
      '{{TABLE_COLSPAN}}': `${Math.max(columns.length, 1)}`,
      '{{SUB_TOTAL}}': this.escapeHtml(this.formatCurrency(quotation?.sub_total)),
      '{{TAX_LABEL}}': this.getQuotationTaxLabelsHtml(quotation),
      '{{TAX_AMOUNT}}': this.getQuotationTaxAmountsHtml(quotation),
      '{{TOTAL}}': this.escapeHtml(this.formatCurrency(this.getQuotationTotal(quotation))),
      '{{PAYMENT_DISPLAY}}': config.body.showPaymentDetails ? 'block' : 'none',
      '{{PAYMENT_DETAILS}}': this.multilineHtml(config.body.paymentDetails),
      '{{CUSTOM_FIELDS_BOTTOM_DISPLAY}}': !showCustomFieldsAtTop && customFieldEntries.length ? 'block' : 'none',
      '{{CUSTOM_FIELDS_BOTTOM}}': !showCustomFieldsAtTop ? this.getCustomFieldBottomHtml(customFieldEntries) : '',
      '{{TERMS}}': this.multilineHtml(quotation?.terms_and_conditions || quotation?.terms_conditions || config.body.terms),
      '{{FOOTER_TEXT}}': this.multilineHtml(config.footer.text),
      '{{PAGE_NUMBER}}': config.footer.showPageNumber ? 'Page 1 of 1' : '',
    };

    let renderedTemplate = this.quotationTemplateHtml;
    Object.keys(tokens).forEach((token: string) => {
      renderedTemplate = renderedTemplate.split(token).join(tokens[token]);
    });
    this.quotationPreviewRawHtml = renderedTemplate;
    this.quotationPreviewHtml = this.sanitizer.bypassSecurityTrustHtml(renderedTemplate);
    this.quotationPreviewLoading = false;
    this.changeDetectorRef.detectChanges();
  }

  private getQuotationFormatConfiguration(): any {
    const defaults = {
      header: {
        visible: true,
        showLogo: true,
        logoUrl: this.getTenantLogoUrl(),
        businessName: 'RenYor',
        businessAddress: '123 Business Street, Kolkata, West Bengal\nGSTIN: 19XXXXX0000X1XX',
        documentTitle: 'Quotation',
        accentColor: '#168354',
      },
      body: {
        visible: true,
        customerLabel: 'Bill To',
        introText: 'Thank you for the opportunity to provide this quotation.',
        showTerms: true,
        showOrderNumber: true,
        showSalesperson: true,
        showProject: true,
        showReferenceNumber: true,
        showExpiryDate: true,
        terms: 'Payment is due according to the terms stated on this document.',
        showPaymentDetails: false,
        paymentDetails: 'Bank: Your Bank\nAccount: 0000000000\nIFSC: XXXX0000000',
        customFieldPosition: 'top',
        customFields: this.getQuotationCustomFieldConfiguration(),
      },
      footer: {
        visible: true,
        text: 'RenYor · billing@renyor.com · +91 00000 00000',
        showPageNumber: true,
      },
      columns: this.getDefaultQuotationColumns(),
    };
    let stored: any = this.quotationFormatConfiguration;
    if (!stored) {
      const storedValue = localStorage.getItem('document-format-config:quote');
      if (storedValue) {
        try {
          stored = JSON.parse(storedValue);
        } catch {
          stored = null;
        }
      }
    }
    if (!stored) {
      return defaults;
    }

    return {
      ...defaults,
      ...stored,
      header: { ...defaults.header, ...(stored?.header || {}) },
      body: {
        ...defaults.body,
        ...(stored?.body || {}),
        customFields: this.getQuotationCustomFieldConfiguration(stored?.body?.customFields),
      },
      footer: { ...defaults.footer, ...(stored?.footer || {}) },
      columns: Array.isArray(stored?.columns) ? stored.columns : defaults.columns,
    };
  }

  private extractDocumentFormatConfiguration(response: any): any | null {
    const candidates = [
      response?.data?.configuration,
      response?.data?.format_config,
      response?.data?.config,
      response?.configuration,
      response?.format_config,
      response?.config,
      response?.data,
    ];
    for (const candidate of candidates) {
      const configuration = this.parseJsonValue(candidate);
      if (configuration && typeof configuration === 'object'
        && (configuration.header || configuration.body || configuration.footer || configuration.columns)) {
        return configuration;
      }
    }
    return null;
  }

  private getQuotationCustomFieldConfiguration(savedFields: any[] = []): any[] {
    const normalizedSavedFields = Array.isArray(savedFields) ? savedFields : [];
    const savedState = new Map(normalizedSavedFields.map((field: any) => [field?.key, field]));
    if (!this.quotationCustomFields.length) {
      return normalizedSavedFields;
    }
    return this.quotationCustomFields.map((field: any) => {
      const key = `${field?.field_name || field?.name || ''}`.trim();
      const savedField = savedState.get(key) as any;
      return {
        key,
        label: `${field?.field_label || field?.field_name || field?.name || 'Custom Field'}`,
        enabled: savedField ? savedField.enabled !== false : true,
      };
    }).filter((field: any) => !!field.key);
  }

  private getTenantLogoUrl(): string {
    let tenantDetails: any = {};
    try {
      tenantDetails = JSON.parse(localStorage.getItem('tenant_details') || '{}');
    } catch {
      tenantDetails = {};
    }
    const logoPath = `${tenantDetails?.logo || ''}`.trim();
    if (!logoPath) {
      return 'assets/images/logo.png';
    }
    if (/^(https?:)?\/\//i.test(logoPath) || /^(data|blob):/i.test(logoPath)) {
      return logoPath;
    }
    const baseUrl = `${environment.apiBaseUrl || ''}`.replace(/\/+$/, '');
    return `${baseUrl}/${logoPath.replace(/^\/+/, '')}`;
  }

  private getDefaultQuotationColumns(): any[] {
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

  private getQuotationItemColumnValue(key: string, item: any, index: number): string {
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

  private getQuotationTaxLabelsHtml(quotation: any): string {
    if (this.isCgstSgstQuotation(quotation)) {
      return [
        `CGST (${this.formatTaxRate(this.getQuotationTaxRate(quotation, 'cgst'))}%)`,
        `SGST (${this.formatTaxRate(this.getQuotationTaxRate(quotation, 'sgst'))}%)`,
      ].map((label: string, index: number) =>
        `<span style="display:block;line-height:1.35;${index === 0 ? 'margin-bottom:7px;' : ''}">${this.escapeHtml(label)}</span>`
      ).join('');
    }

    const label = `IGST (${this.formatTaxRate(this.getQuotationTaxRate(quotation, 'igst'))}%)`;
    return `<span style="display:block">${this.escapeHtml(label)}</span>`;
  }

  private getQuotationTaxAmountsHtml(quotation: any): string {
    const totalTax = Number(quotation?.tax_amount || 0);
    if (this.isCgstSgstQuotation(quotation)) {
      const cgstAmount = Number(quotation?.cgst_amount ?? totalTax / 2);
      const sgstAmount = Number(quotation?.sgst_amount ?? (totalTax - cgstAmount));
      return [cgstAmount, sgstAmount]
        .map((amount: number, index: number) =>
          `<span style="display:block;line-height:1.35;${index === 0 ? 'margin-bottom:7px;' : ''}">${this.escapeHtml(this.formatCurrency(amount))}</span>`
        )
        .join('');
    }

    const igstAmount = Number(quotation?.igst_amount ?? totalTax);
    return `<span style="display:block">${this.escapeHtml(this.formatCurrency(igstAmount))}</span>`;
  }

  private isCgstSgstQuotation(quotation: any): boolean {
    const taxMode = `${quotation?.tax_mode || ''}`.trim().toUpperCase().replace(/[\s+]+/g, '_');
    return taxMode === 'CGST_SGST' || Number(quotation?.cgst_amount || 0) > 0 || Number(quotation?.sgst_amount || 0) > 0;
  }

  private getQuotationTaxRate(quotation: any, component: 'cgst' | 'sgst' | 'igst'): number {
    const explicitRate = Number(
      quotation?.[`${component}_rate`]
      ?? quotation?.[`${component}_percentage`]
      ?? quotation?.[`${component}_percent`]
    );
    if (Number.isFinite(explicitRate) && explicitRate > 0) {
      return explicitRate;
    }

    const subTotal = Number(quotation?.sub_total || 0);
    const taxAmount = Number(quotation?.tax_amount || 0);
    const totalRate = subTotal > 0 ? (taxAmount / subTotal) * 100 : 0;
    return component === 'igst' ? totalRate : totalRate / 2;
  }

  private formatTaxRate(value: number): string {
    const roundedValue = Number((Number(value) || 0).toFixed(2));
    return Number.isInteger(roundedValue) ? `${roundedValue}` : roundedValue.toFixed(2);
  }

  private getQuotationAddressHtml(quotation: any, type: 'billing' | 'shipping'): string {
    const customer = quotation?.customer || {};
    const displayName = quotation?.customer_display_name || quotation?.customer_company_name
      || customer?.display_name || customer?.company_name || this.getCustomerName(quotation);
    const prefix = type === 'billing' ? 'billing' : 'shipping';
    const addressParts = [
      quotation?.[`${prefix}_address`] || customer?.[`${prefix}_address`],
      quotation?.[`${prefix}_street`] || customer?.[`${prefix}_street`],
      quotation?.[`${prefix}_city`] || customer?.[`${prefix}_city`],
      quotation?.[`${prefix}_state`] || customer?.[`${prefix}_state`] || (type === 'billing' ? quotation?.customer_state : ''),
      quotation?.[`${prefix}_pin`] || quotation?.[`${prefix}_pincode`] || customer?.[`${prefix}_pin`],
      quotation?.[`${prefix}_country`] || customer?.[`${prefix}_country`],
    ].filter((value: any) => `${value || ''}`.trim());

    if (type === 'shipping' && addressParts.length === 0) {
      return this.getQuotationAddressHtml(quotation, 'billing');
    }

    const lines = [`<strong>${this.escapeHtml(displayName)}</strong>`];
    if (addressParts.length) {
      lines.push(this.escapeHtml(addressParts.join(', ')));
    }
    const gstNumber = quotation?.customer_gst || quotation?.gst_no || customer?.gst_no;
    if (gstNumber) {
      lines.push(`GSTIN: ${this.escapeHtml(gstNumber)}`);
    }
    return lines.join('<br>');
  }

  private getQuotationDetailsHtml(
    quotation: any,
    customFields: Array<{ label: string; value: any }> = [],
    bodyConfig: any = {},
  ): string {
    const details: any[][] = [
      ['Quotation Date', this.formatDate(quotation?.quotation_date || quotation?.date)],
    ];
    if (bodyConfig?.showExpiryDate !== false) {
      details.push(['Expiry Date', this.formatDate(quotation?.expiry_date || quotation?.valid_until || quotation?.valid_till)]);
    }
    if (bodyConfig?.showReferenceNumber !== false) {
      details.push(['Reference No.', quotation?.ref_no || quotation?.reference_no || '-']);
    }
    if (bodyConfig?.showSalesperson !== false) {
      details.push([
        'Salesperson',
        this.formatDocumentDetailValue(quotation?.salesperson ?? quotation?.sales_person),
      ]);
    }
    if (bodyConfig?.showProject !== false) {
      details.push([
        'Project',
        this.formatDocumentDetailValue(quotation?.project_name ?? quotation?.project),
      ]);
    }
    customFields.forEach((field: { label: string; value: any }) => {
      details.push([field.label, this.formatCustomFieldValue(field.value)]);
    });
    return details.map((detail: any[]) =>
      `<tr><td>${this.escapeHtml(detail[0])}</td><td>${this.escapeHtml(detail[1])}</td></tr>`
    ).join('');
  }

  private formatDocumentDetailValue(value: any): string {
    if (value && typeof value === 'object') {
      return `${value?.name ?? value?.display_name ?? value?.project_name ?? value?.full_name ?? value?.label ?? '-'}`;
    }
    return `${value ?? ''}`.trim() || '-';
  }

  private getQuotationCustomFieldEntries(quotation: any, config: any): Array<{ label: string; value: any }> {
    const configuredFields = Array.isArray(config?.body?.customFields)
      ? config.body.customFields.filter((field: any) => field?.enabled !== false)
      : [];
    const values = this.normalizeQuotationCustomFieldValues(
      quotation?.custom_field ?? quotation?.custom_fields ?? quotation?.customField
    );

    return configuredFields.map((field: any) => ({
      label: `${field?.label || field?.key || 'Custom Field'}`,
      value: values[field?.key],
    }));
  }

  private normalizeQuotationCustomFieldValues(value: any): any {
    const parsedValue = this.parseJsonValue(value);
    if (Array.isArray(parsedValue)) {
      return parsedValue.reduce((values: any, field: any) => {
        const key = field?.field_name ?? field?.name ?? field?.key;
        if (key) {
          values[key] = field?.field_value ?? field?.value ?? '';
        }
        return values;
      }, {});
    }
    return parsedValue && typeof parsedValue === 'object' ? parsedValue : {};
  }

  private getCustomFieldBottomHtml(fields: Array<{ label: string; value: any }>): string {
    return fields.map((field: { label: string; value: any }) =>
      `<div class="custom-field-line"><span>${this.escapeHtml(field.label)}</span><strong>${this.escapeHtml(this.formatCustomFieldValue(field.value))}</strong></div>`
    ).join('');
  }

  private formatCustomFieldValue(value: any): string {
    if (Array.isArray(value)) {
      return value.join(', ') || '-';
    }
    if (value && typeof value === 'object') {
      return Object.values(value).join(', ') || '-';
    }
    return `${value ?? ''}`.trim() || '-';
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

  requestDeleteQuotation(quotation: any): void {
    this.pendingDeleteQuotation = quotation;
  }

  cancelDeleteQuotation(): void {
    if (!this.deleting) {
      this.pendingDeleteQuotation = null;
    }
  }

  confirmDeleteQuotation(): void {
    const quotationId = this.getQuotationId(this.pendingDeleteQuotation);
    if (!quotationId) {
      this.toastrService.danger('Quotation id is missing.', 'Delete Failed');
      return;
    }

    this.deleting = true;
    this.globalService.deleteQuotation(quotationId).subscribe({
      next: (res: any) => {
        this.allQuotations = this.allQuotations.filter((quotation: any) => this.getQuotationId(quotation) !== quotationId);
        this.onSearch(this.searchText);
        this.pendingDeleteQuotation = null;
        this.deleting = false;
        this.toastrService.success(res?.message || 'Quotation deleted successfully.', 'Deleted');
      },
      error: (error: any) => {
        this.deleting = false;
        this.toastrService.danger(
          error?.error?.message || error?.message || 'Quotation could not be deleted.',
          'Delete Failed',
        );
      },
    });
  }

  downloadPdf(quotation: any): void {
    const quotationId = this.getQuotationId(quotation);
    if (!quotationId) {
      this.toastrService.danger('Quotation id is missing.', 'Download Failed');
      return;
    }

    this.downloadingQuotationId = quotationId;

    if (this.quotationTemplateHtml) {
      this.renderQuotationPreview(quotation);
      this.requestGeneratedQuotationPdf(quotation);
      return;
    }

    this.http.get('assets/format/invoice.html', { responseType: 'text' }).subscribe({
      next: (template: string) => {
        this.quotationTemplateHtml = template;
        this.renderQuotationPreview(quotation);
        this.requestGeneratedQuotationPdf(quotation);
      },
      error: () => {
        this.downloadingQuotationId = null;
        this.toastrService.danger('The quotation template could not be loaded.', 'PDF Failed');
      },
    });
  }

  private requestGeneratedQuotationPdf(quotation: any): void {
    const quotationId = this.getQuotationId(quotation);
    if (!quotationId || !this.quotationPreviewRawHtml) {
      this.downloadingQuotationId = null;
      this.toastrService.danger('Quotation HTML could not be generated.', 'PDF Failed');
      return;
    }

    const quotationNumber = this.getQuotationNumber(quotation).replace(/[^a-z0-9_-]+/gi, '-');
    const fileName = `${quotationNumber || 'quotation'}.pdf`;
    this.globalService.generateQuotationPdf({
      quotation_id: quotationId,
      document_type: 'quotation',
      file_name: fileName,
      html: this.quotationPreviewRawHtml,
    }).subscribe({
      next: (response: any) => {
        const pdfLink = response?.data?.pdf_link;
        const generatedFileName = response?.data?.file_name || fileName;

        if (!pdfLink) {
          this.downloadingQuotationId = null;
          this.toastrService.danger('The backend did not return a PDF link.', 'PDF Failed');
          this.changeDetectorRef.detectChanges();
          return;
        }

        this.downloadGeneratedPdf(pdfLink, generatedFileName);
      },
      error: (error: any) => {
        this.downloadingQuotationId = null;
        this.toastrService.danger(
          error?.error?.message || error?.message || 'The quotation PDF could not be generated.',
          'PDF Failed',
        );
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  private downloadGeneratedPdf(pdfLink: string, fileName: string): void {
    const downloadUrl = new URL(pdfLink, window.location.origin);

    // Avoid mixed-content blocking when the API returns an http link on an https page.
    if (window.location.protocol === 'https:' && downloadUrl.protocol === 'http:') {
      downloadUrl.protocol = 'https:';
    }

    const anchor = document.createElement('a');
    anchor.href = downloadUrl.toString();
    anchor.download = fileName;
    anchor.target = '_blank';
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    this.downloadingQuotationId = null;
    this.changeDetectorRef.detectChanges();
  }

  isDownloading(quotation: any): boolean {
    return this.downloadingQuotationId === this.getQuotationId(quotation);
  }

  getQuotationId(quotation: any): string | number | null {
    return quotation?.quotation_id ?? quotation?.id ?? null;
  }

  getQuotationNumber(quotation: any): string {
    return `${quotation?.quotation_no ?? quotation?.quote_no ?? quotation?.quotation_number ?? quotation?.number ?? '-'}`;
  }

  getCustomerName(quotation: any): string {
    const customer = quotation?.customer || {};
    const contactName = `${customer?.primary_contact_f_name || ''} ${customer?.primary_contact_l_name || ''}`.trim();
    const quotationContactName = `${quotation?.customer_first_name || ''} ${quotation?.customer_last_name || ''}`.trim();
    return quotation?.customer_display_name
      || quotation?.customer_company_name
      || quotation?.customer_name
      || quotation?.display_name
      || customer?.display_name
      || customer?.company_name
      || quotationContactName
      || contactName
      || '-';
  }

  getCustomerInitials(quotation: any): string {
    return this.getCustomerName(quotation).split(/\s+/).filter(Boolean).slice(0, 2)
      .map((word: string) => word.charAt(0).toUpperCase()).join('') || 'QT';
  }

  getQuotationStatus(quotation: any): string {
    const rawStatus = quotation?.quotation_status ?? quotation?.quote_status ?? quotation?.status;
    const statusLabels: { [key: number]: string } = {
      0: 'Draft',
      1: 'Sent',
      2: 'Viewed',
      3: 'Accepted',
      4: 'Rejected',
      5: 'Expired',
      6: 'Cancelled',
      7: 'Converted',
    };

    if (rawStatus !== undefined && rawStatus !== null && /^\d+$/.test(`${rawStatus}`.trim())) {
      return statusLabels[Number(rawStatus)] || 'Draft';
    }

    return `${rawStatus ?? 'Draft'}`.trim() || 'Draft';
  }

  getStatusClass(quotation: any): string {
    const status = this.getQuotationStatus(quotation).toLowerCase();
    if (status === 'accepted' || status === 'approved' || status === 'converted') {
      return 'paid-status';
    }
    if (status.includes('expired') || status.includes('cancel') || status.includes('reject')) {
      return 'overdue-status';
    }
    if (status.includes('sent') || status.includes('viewed') || status.includes('pending')) {
      return 'partial-status';
    }
    return 'unpaid-status';
  }

  getQuotationTotal(quotation: any): number {
    return Number(quotation?.total ?? quotation?.grand_total ?? quotation?.amount ?? 0) || 0;
  }

  getQuotationItems(quotation: any): any[] {
    const rawItems = quotation?.items ?? quotation?.quotation_items ?? quotation?.quote_items ?? quotation?.details ?? [];
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

  trackByQuotation(index: number, quotation: any): string | number {
    return quotation?.quotation_id ?? quotation?.id ?? index;
  }
}
