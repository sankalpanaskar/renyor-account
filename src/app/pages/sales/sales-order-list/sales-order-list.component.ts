import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { GlobalService } from '../../../services/global.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'ngx-sales-order-list',
  templateUrl: './sales-order-list.component.html',
  styleUrls: ['./sales-order-list.component.scss'],
})
export class SalesOrderListComponent implements OnInit {
  allSalesOrders: any[] = [];
  apiData: any[] = [];
  searchText = '';
  loadError = '';
  loading = false;
  downloadingSalesOrderId: string | number | null = null;
  deleting = false;
  showSalesOrderPopup = false;
  selectedSalesOrder: any = null;
  pendingDeleteSalesOrder: any = null;
  salesOrderPreviewHtml: SafeHtml = '';
  private salesOrderPreviewRawHtml = '';
  salesOrderPreviewLoading = false;
  salesOrderPreviewError = '';
  private salesOrderTemplateHtml = '';
  private salesOrderCustomFields: any[] = [];
  private salesOrderFormatConfiguration: any = null;

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.fetchSalesOrders();
    this.fetchSalesOrderCustomFields();
    this.fetchSalesOrderFormatConfiguration();
  }

  private fetchSalesOrderFormatConfiguration(): void {
    this.globalService.fetchDocumentFormatConfiguration('sales_order').subscribe({
      next: (response: any) => {
        const configuration = this.extractDocumentFormatConfiguration(response);
        if (!configuration) {
          return;
        }
        this.salesOrderFormatConfiguration = configuration;
        localStorage.setItem('document-format-config:sales-order', JSON.stringify(configuration));
        if (this.showSalesOrderPopup && this.selectedSalesOrder && this.salesOrderTemplateHtml) {
          this.renderSalesOrderPreview(this.selectedSalesOrder);
        }
      },
      error: () => {
        // The locally cached configuration remains available as an offline fallback.
      },
    });
  }

  private fetchSalesOrderCustomFields(): void {
    this.globalService.fetchCustomFieldsByModule(57).subscribe({
      next: (res: any) => {
        const fields = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        this.salesOrderCustomFields = fields
          .filter((field: any) => Number(field?.status) === 1)
          .sort((a: any, b: any) => Number(a?.field_order || 0) - Number(b?.field_order || 0));
        if (this.showSalesOrderPopup && this.selectedSalesOrder && this.salesOrderTemplateHtml) {
          this.renderSalesOrderPreview(this.selectedSalesOrder);
        }
      },
      error: () => {
        this.salesOrderCustomFields = [];
      },
    });
  }

  get confirmedSalesOrdersCount(): number {
    return this.allSalesOrders.filter((salesOrder: any) => {
      const status = this.getSalesOrderStatus(salesOrder).toLowerCase();
      return status === 'confirmed' || status === 'processing' || status === 'shipped' || status === 'delivered';
    }).length;
  }

  get totalSalesOrderValue(): number {
    return this.allSalesOrders.reduce((total: number, salesOrder: any) => total + this.getSalesOrderTotal(salesOrder), 0);
  }

  fetchSalesOrders(): void {
    this.loading = true;
    this.loadError = '';
    this.globalService.fetchSalesOrders(57).subscribe({
      next: (res: any) => {
        const salesOrders = this.extractSalesOrders(res);
        this.allSalesOrders = [...salesOrders];
        this.onSearch(this.searchText);
        this.loading = false;
        this.changeDetectorRef.detectChanges();
      },
      error: (error: any) => {
        this.loading = false;
        this.loadError = error?.error?.message || error?.message || 'Sales order list could not be loaded.';
        this.toastrService.danger(
          this.loadError,
          'Sales Order List Failed',
        );
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  private extractSalesOrders(response: any): any[] {
    const normalizedResponse = this.parseJsonValue(response);
    const candidates = [
      normalizedResponse,
      normalizedResponse?.body,
      normalizedResponse?.data,
      normalizedResponse?.body?.data,
      normalizedResponse?.data?.data,
      normalizedResponse?.salesOrders,
      normalizedResponse?.sales_orders,
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
      this.apiData = [...this.allSalesOrders];
      return;
    }

    this.apiData = this.allSalesOrders.filter((salesOrder: any) => [
      this.getSalesOrderNumber(salesOrder),
      this.getCustomerName(salesOrder),
      this.getSalesOrderStatus(salesOrder),
      salesOrder?.ref_no ?? salesOrder?.reference_no,
      salesOrder?.subject,
      salesOrder?.salesperson,
      salesOrder?.total,
    ].some((value: any) => `${value ?? ''}`.toLowerCase().includes(searchValue)));
  }

  clearSearch(): void {
    this.onSearch('');
  }

  gotoAddSalesOrder(): void {
    this.router.navigate(['/pages/sales/add-sales-order']);
  }

  editSalesOrder(salesOrder: any): void {
    this.router.navigate(['/pages/sales/update-sales-order'], {
      state: {
        isEditMode: true,
        salesOrderData: salesOrder,
      },
    });
  }

  openSalesOrderPopup(salesOrder: any): void {
    this.selectedSalesOrder = salesOrder;
    this.showSalesOrderPopup = true;
    this.loadSalesOrderPreview(salesOrder);
  }

  closeSalesOrderPopup(): void {
    this.showSalesOrderPopup = false;
    this.selectedSalesOrder = null;
    this.salesOrderPreviewError = '';
  }

  private loadSalesOrderPreview(salesOrder: any): void {
    this.salesOrderPreviewLoading = true;
    this.salesOrderPreviewError = '';

    if (this.salesOrderTemplateHtml) {
      this.renderSalesOrderPreview(salesOrder);
      return;
    }

    this.http.get('assets/format/sales-order.html', { responseType: 'text' }).subscribe({
      next: (template: string) => {
        this.salesOrderTemplateHtml = template;
        this.renderSalesOrderPreview(salesOrder);
      },
      error: () => {
        this.salesOrderPreviewLoading = false;
        this.salesOrderPreviewError = 'The sales order format template could not be loaded.';
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  private renderSalesOrderPreview(salesOrder: any): void {
    const config = this.getSalesOrderFormatConfiguration();
    const columns = config.columns.filter((column: any) => column.enabled);
    const headers = columns.length
      ? columns.map((column: any) => `<th class="align-${this.getColumnAlign(column.align)}">${this.escapeHtml(column.label)}</th>`).join('')
      : '<th>Items</th>';
    const salesOrderItems = this.getSalesOrderItems(salesOrder);
    const rows = salesOrderItems.length && columns.length
      ? salesOrderItems.map((item: any, index: number) => `<tr>${columns.map((column: any) =>
          `<td class="align-${this.getColumnAlign(column.align)}">${this.getSalesOrderItemColumnValue(column.key, item, index)}</td>`
        ).join('')}</tr>`).join('')
      : `<tr><td colspan="${Math.max(columns.length, 1)}" class="align-center">No sales order items available.</td></tr>`;
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
    const customFieldEntries = this.getSalesOrderCustomFieldEntries(salesOrder, config);
    const showCustomFieldsAtTop = config.body.customFieldPosition === 'top';
    const salesOrderStatus = this.getSalesOrderStatus(salesOrder);
    const successfulStatuses = ['confirmed', 'processing', 'shipped', 'delivered', 'closed'];
    const salesOrderStatusClass = successfulStatuses.includes(salesOrderStatus.toLowerCase()) ? 'paid' : 'unpaid';
    const tokens: { [key: string]: string } = {
      '{{ACCENT_COLOR}}': accentColor,
      '{{HEADER_DISPLAY}}': config.header.visible === false ? 'none' : 'flex',
      '{{BODY_DISPLAY}}': config.body.visible === false ? 'none' : 'block',
      '{{FOOTER_DISPLAY}}': config.footer.visible === false ? 'none' : 'block',
      '{{LOGO_BLOCK}}': logoBlock,
      '{{BUSINESS_NAME}}': this.escapeHtml(config.header.businessName),
      '{{BUSINESS_ADDRESS}}': this.multilineHtml(config.header.businessAddress),
      '{{DOCUMENT_TITLE}}': this.escapeHtml(config.header.documentTitle || 'Sales Order'),
      '{{DOCUMENT_NUMBER_LABEL}}': 'Sales Order Number',
      '{{DOCUMENT_NUMBER}}': this.escapeHtml(this.getSalesOrderNumber(salesOrder)),
      '{{PAYMENT_STATUS}}': this.escapeHtml(salesOrderStatus),
      '{{PAYMENT_STATUS_CLASS}}': salesOrderStatusClass,
      '{{CUSTOMER_LABEL}}': this.escapeHtml(config.body.customerLabel || 'Bill To'),
      '{{BILL_TO}}': this.getSalesOrderAddressHtml(salesOrder, 'billing'),
      '{{SHIP_TO}}': this.getSalesOrderAddressHtml(salesOrder, 'shipping'),
      '{{DOCUMENT_DETAILS}}': this.getSalesOrderDetailsHtml(
        salesOrder,
        showCustomFieldsAtTop ? customFieldEntries : [],
        config.body,
      ),
      '{{BODY_INTRO}}': this.multilineHtml(config.body.introText),
      '{{TABLE_HEADERS}}': headers,
      '{{TABLE_ROW}}': rows,
      '{{TABLE_COLSPAN}}': `${Math.max(columns.length, 1)}`,
      '{{SUB_TOTAL}}': this.escapeHtml(this.formatCurrency(salesOrder?.sub_total)),
      '{{TAX_LABEL}}': this.getSalesOrderTaxLabelsHtml(salesOrder),
      '{{TAX_AMOUNT}}': this.getSalesOrderTaxAmountsHtml(salesOrder),
      '{{TOTAL}}': this.escapeHtml(this.formatCurrency(this.getSalesOrderTotal(salesOrder))),
      '{{PAYMENT_DISPLAY}}': config.body.showPaymentDetails ? 'block' : 'none',
      '{{PAYMENT_DETAILS}}': this.multilineHtml(config.body.paymentDetails),
      '{{CUSTOM_FIELDS_BOTTOM_DISPLAY}}': !showCustomFieldsAtTop && customFieldEntries.length ? 'block' : 'none',
      '{{CUSTOM_FIELDS_BOTTOM}}': !showCustomFieldsAtTop ? this.getCustomFieldBottomHtml(customFieldEntries) : '',
      '{{TERMS}}': this.multilineHtml(salesOrder?.terms_and_conditions || salesOrder?.terms_conditions || config.body.terms),
      '{{FOOTER_TEXT}}': this.multilineHtml(config.footer.text),
      '{{PAGE_NUMBER}}': config.footer.showPageNumber ? 'Page 1 of 1' : '',
    };

    let renderedTemplate = this.salesOrderTemplateHtml;
    Object.keys(tokens).forEach((token: string) => {
      renderedTemplate = renderedTemplate.split(token).join(tokens[token]);
    });
    this.salesOrderPreviewRawHtml = renderedTemplate;
    this.salesOrderPreviewHtml = this.sanitizer.bypassSecurityTrustHtml(renderedTemplate);
    this.salesOrderPreviewLoading = false;
    this.changeDetectorRef.detectChanges();
  }

  private getSalesOrderFormatConfiguration(): any {
    const defaults = {
      header: {
        visible: true,
        showLogo: true,
        logoUrl: this.getTenantLogoUrl(),
        businessName: 'RenYor',
        businessAddress: '123 Business Street, Kolkata, West Bengal\nGSTIN: 19XXXXX0000X1XX',
        documentTitle: 'Sales Order',
        accentColor: '#168354',
      },
      body: {
        visible: true,
        customerLabel: 'Bill To',
        introText: 'Thank you for your order.',
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
        customFields: this.getSalesOrderCustomFieldConfiguration(),
      },
      footer: {
        visible: true,
        text: 'RenYor · billing@renyor.com · +91 00000 00000',
        showPageNumber: true,
      },
      columns: this.getDefaultSalesOrderColumns(),
    };
    let stored: any = this.salesOrderFormatConfiguration;
    if (!stored) {
      const storedValue = localStorage.getItem('document-format-config:sales-order');
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
        customFields: this.getSalesOrderCustomFieldConfiguration(stored?.body?.customFields),
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

  private getSalesOrderCustomFieldConfiguration(savedFields: any[] = []): any[] {
    const normalizedSavedFields = Array.isArray(savedFields) ? savedFields : [];
    const savedState = new Map(normalizedSavedFields.map((field: any) => [field?.key, field]));
    if (!this.salesOrderCustomFields.length) {
      return normalizedSavedFields;
    }
    return this.salesOrderCustomFields.map((field: any) => {
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

  private getDefaultSalesOrderColumns(): any[] {
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

  private getSalesOrderItemColumnValue(key: string, item: any, index: number): string {
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

  private getSalesOrderTaxLabelsHtml(salesOrder: any): string {
    if (this.isCgstSgstSalesOrder(salesOrder)) {
      return [
        `CGST (${this.formatTaxRate(this.getSalesOrderTaxRate(salesOrder, 'cgst'))}%)`,
        `SGST (${this.formatTaxRate(this.getSalesOrderTaxRate(salesOrder, 'sgst'))}%)`,
      ].map((label: string, index: number) =>
        `<span style="display:block;line-height:1.35;${index === 0 ? 'margin-bottom:7px;' : ''}">${this.escapeHtml(label)}</span>`
      ).join('');
    }

    const label = `IGST (${this.formatTaxRate(this.getSalesOrderTaxRate(salesOrder, 'igst'))}%)`;
    return `<span style="display:block">${this.escapeHtml(label)}</span>`;
  }

  private getSalesOrderTaxAmountsHtml(salesOrder: any): string {
    const totalTax = Number(salesOrder?.tax_amount || 0);
    if (this.isCgstSgstSalesOrder(salesOrder)) {
      const cgstAmount = Number(salesOrder?.cgst_amount ?? totalTax / 2);
      const sgstAmount = Number(salesOrder?.sgst_amount ?? (totalTax - cgstAmount));
      return [cgstAmount, sgstAmount]
        .map((amount: number, index: number) =>
          `<span style="display:block;line-height:1.35;${index === 0 ? 'margin-bottom:7px;' : ''}">${this.escapeHtml(this.formatCurrency(amount))}</span>`
        )
        .join('');
    }

    const igstAmount = Number(salesOrder?.igst_amount ?? totalTax);
    return `<span style="display:block">${this.escapeHtml(this.formatCurrency(igstAmount))}</span>`;
  }

  private isCgstSgstSalesOrder(salesOrder: any): boolean {
    const taxMode = `${salesOrder?.tax_mode || ''}`.trim().toUpperCase().replace(/[\s+]+/g, '_');
    return taxMode === 'CGST_SGST' || Number(salesOrder?.cgst_amount || 0) > 0 || Number(salesOrder?.sgst_amount || 0) > 0;
  }

  private getSalesOrderTaxRate(salesOrder: any, component: 'cgst' | 'sgst' | 'igst'): number {
    const explicitRate = Number(
      salesOrder?.[`${component}_rate`]
      ?? salesOrder?.[`${component}_percentage`]
      ?? salesOrder?.[`${component}_percent`]
    );
    if (Number.isFinite(explicitRate) && explicitRate > 0) {
      return explicitRate;
    }

    const subTotal = Number(salesOrder?.sub_total || 0);
    const taxAmount = Number(salesOrder?.tax_amount || 0);
    const totalRate = subTotal > 0 ? (taxAmount / subTotal) * 100 : 0;
    return component === 'igst' ? totalRate : totalRate / 2;
  }

  private formatTaxRate(value: number): string {
    const roundedValue = Number((Number(value) || 0).toFixed(2));
    return Number.isInteger(roundedValue) ? `${roundedValue}` : roundedValue.toFixed(2);
  }

  private getSalesOrderAddressHtml(salesOrder: any, type: 'billing' | 'shipping'): string {
    const customer = salesOrder?.customer || {};
    const displayName = salesOrder?.customer_display_name || salesOrder?.customer_company_name
      || customer?.display_name || customer?.company_name || this.getCustomerName(salesOrder);
    const prefix = type === 'billing' ? 'billing' : 'shipping';
    const addressParts = [
      salesOrder?.[`${prefix}_address`] || customer?.[`${prefix}_address`],
      salesOrder?.[`${prefix}_street`] || customer?.[`${prefix}_street`],
      salesOrder?.[`${prefix}_city`] || customer?.[`${prefix}_city`],
      salesOrder?.[`${prefix}_state`] || customer?.[`${prefix}_state`] || (type === 'billing' ? salesOrder?.customer_state : ''),
      salesOrder?.[`${prefix}_pin`] || salesOrder?.[`${prefix}_pincode`] || customer?.[`${prefix}_pin`],
      salesOrder?.[`${prefix}_country`] || customer?.[`${prefix}_country`],
    ].filter((value: any) => `${value || ''}`.trim());

    if (type === 'shipping' && addressParts.length === 0) {
      return this.getSalesOrderAddressHtml(salesOrder, 'billing');
    }

    const lines = [`<strong>${this.escapeHtml(displayName)}</strong>`];
    if (addressParts.length) {
      lines.push(this.escapeHtml(addressParts.join(', ')));
    }
    const gstNumber = salesOrder?.customer_gst || salesOrder?.gst_no || customer?.gst_no;
    if (gstNumber) {
      lines.push(`GSTIN: ${this.escapeHtml(gstNumber)}`);
    }
    return lines.join('<br>');
  }

  private getSalesOrderDetailsHtml(
    salesOrder: any,
    customFields: Array<{ label: string; value: any }> = [],
    bodyConfig: any = {},
  ): string {
    const details: any[][] = [
      ['Sales Order Date', this.formatDate(salesOrder?.sales_order_date || salesOrder?.date)],
    ];
    if (bodyConfig?.showExpiryDate !== false) {
      details.push([
        'Expected Shipment',
        this.formatDate(salesOrder?.expected_shipment_date || salesOrder?.shipment_date),
      ]);
    }
    if (bodyConfig?.showReferenceNumber !== false) {
      details.push(['Reference No.', salesOrder?.ref_no || salesOrder?.reference_no || '-']);
    }
    if (salesOrder?.payment_terms || salesOrder?.term) {
      details.push(['Payment Terms', salesOrder?.payment_terms || salesOrder?.term]);
    }
    if (salesOrder?.delivery_method) {
      details.push(['Delivery Method', salesOrder.delivery_method]);
    }
    if (bodyConfig?.showSalesperson !== false) {
      details.push([
        'Salesperson',
        this.formatDocumentDetailValue(salesOrder?.salesperson ?? salesOrder?.sales_person),
      ]);
    }
    if (bodyConfig?.showProject !== false) {
      details.push([
        'Project',
        this.formatDocumentDetailValue(salesOrder?.project_name ?? salesOrder?.project),
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

  private getSalesOrderCustomFieldEntries(salesOrder: any, config: any): Array<{ label: string; value: any }> {
    const configuredFields = Array.isArray(config?.body?.customFields)
      ? config.body.customFields.filter((field: any) => field?.enabled !== false)
      : [];
    const values = this.normalizeSalesOrderCustomFieldValues(
      salesOrder?.custom_field ?? salesOrder?.custom_fields ?? salesOrder?.customField
    );

    return configuredFields.map((field: any) => ({
      label: `${field?.label || field?.key || 'Custom Field'}`,
      value: values[field?.key],
    }));
  }

  private normalizeSalesOrderCustomFieldValues(value: any): any {
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

  requestDeleteSalesOrder(salesOrder: any): void {
    this.pendingDeleteSalesOrder = salesOrder;
  }

  cancelDeleteSalesOrder(): void {
    if (!this.deleting) {
      this.pendingDeleteSalesOrder = null;
    }
  }

  confirmDeleteSalesOrder(): void {
    const salesOrderId = this.getSalesOrderId(this.pendingDeleteSalesOrder);
    if (!salesOrderId) {
      this.toastrService.danger('Sales order id is missing.', 'Delete Failed');
      return;
    }

    this.deleting = true;
    this.globalService.deleteSalesOrder(salesOrderId).subscribe({
      next: (res: any) => {
        this.allSalesOrders = this.allSalesOrders.filter((salesOrder: any) => this.getSalesOrderId(salesOrder) !== salesOrderId);
        this.onSearch(this.searchText);
        this.pendingDeleteSalesOrder = null;
        this.deleting = false;
        this.toastrService.success(res?.message || 'Sales order deleted successfully.', 'Deleted');
      },
      error: (error: any) => {
        this.deleting = false;
        this.toastrService.danger(
          error?.error?.message || error?.message || 'Sales order could not be deleted.',
          'Delete Failed',
        );
      },
    });
  }

  downloadPdf(salesOrder: any): void {
    const salesOrderId = this.getSalesOrderId(salesOrder);
    if (!salesOrderId) {
      this.toastrService.danger('Sales order id is missing.', 'Download Failed');
      return;
    }

    this.downloadingSalesOrderId = salesOrderId;

    if (this.salesOrderTemplateHtml) {
      this.renderSalesOrderPreview(salesOrder);
      this.requestGeneratedSalesOrderPdf(salesOrder);
      return;
    }

    this.http.get('assets/format/sales-order.html', { responseType: 'text' }).subscribe({
      next: (template: string) => {
        this.salesOrderTemplateHtml = template;
        this.renderSalesOrderPreview(salesOrder);
        this.requestGeneratedSalesOrderPdf(salesOrder);
      },
      error: () => {
        this.downloadingSalesOrderId = null;
        this.toastrService.danger('The sales order template could not be loaded.', 'PDF Failed');
      },
    });
  }

  private requestGeneratedSalesOrderPdf(salesOrder: any): void {
    const salesOrderId = this.getSalesOrderId(salesOrder);
    if (!salesOrderId || !this.salesOrderPreviewRawHtml) {
      this.downloadingSalesOrderId = null;
      this.toastrService.danger('Sales order HTML could not be generated.', 'PDF Failed');
      return;
    }

    const salesOrderNumber = this.getSalesOrderNumber(salesOrder).replace(/[^a-z0-9_-]+/gi, '-');
    const fileName = `${salesOrderNumber || 'sales-order'}.pdf`;
    this.globalService.generateSalesOrderPdf({
      sales_order_id: salesOrderId,
      document_type: 'SalesOrder',
      file_name: fileName,
      html: this.salesOrderPreviewRawHtml,
    }).subscribe({
      next: (response: any) => {
        const pdfLink = response?.data?.pdf_link;
        const generatedFileName = response?.data?.file_name || fileName;

        if (!pdfLink) {
          this.downloadingSalesOrderId = null;
          this.toastrService.danger('The backend did not return a PDF link.', 'PDF Failed');
          this.changeDetectorRef.detectChanges();
          return;
        }

        this.downloadGeneratedPdf(pdfLink, generatedFileName);
      },
      error: (error: any) => {
        this.downloadingSalesOrderId = null;
        this.toastrService.danger(
          error?.error?.message || error?.message || 'The sales order PDF could not be generated.',
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

    this.downloadingSalesOrderId = null;
    this.changeDetectorRef.detectChanges();
  }

  isDownloading(salesOrder: any): boolean {
    return this.downloadingSalesOrderId === this.getSalesOrderId(salesOrder);
  }

  getSalesOrderId(salesOrder: any): string | number | null {
    return salesOrder?.sales_order_id ?? salesOrder?.id ?? null;
  }

  getSalesOrderNumber(salesOrder: any): string {
    return `${salesOrder?.sales_order_no ?? salesOrder?.sales_order_number ?? salesOrder?.order_no ?? salesOrder?.number ?? '-'}`;
  }

  getCustomerName(salesOrder: any): string {
    const customer = salesOrder?.customer || {};
    const contactName = `${customer?.primary_contact_f_name || ''} ${customer?.primary_contact_l_name || ''}`.trim();
    const salesOrderContactName = `${salesOrder?.customer_first_name || ''} ${salesOrder?.customer_last_name || ''}`.trim();
    return salesOrder?.customer_display_name
      || salesOrder?.customer_company_name
      || salesOrder?.customer_name
      || salesOrder?.display_name
      || customer?.display_name
      || customer?.company_name
      || salesOrderContactName
      || contactName
      || '-';
  }

  getCustomerInitials(salesOrder: any): string {
    return this.getCustomerName(salesOrder).split(/\s+/).filter(Boolean).slice(0, 2)
      .map((word: string) => word.charAt(0).toUpperCase()).join('') || 'SO';
  }

  getSalesOrderStatus(salesOrder: any): string {
    const rawStatus = salesOrder?.sales_order_status ?? salesOrder?.status;
    const statusLabels: { [key: number]: string } = {
      0: 'Draft',
      1: 'Confirmed',
      2: 'Processing',
      3: 'Shipped',
      4: 'Delivered',
      5: 'Cancelled',
      6: 'Closed',
    };

    if (rawStatus !== undefined && rawStatus !== null && /^\d+$/.test(`${rawStatus}`.trim())) {
      return statusLabels[Number(rawStatus)] || 'Draft';
    }

    return `${rawStatus ?? 'Draft'}`.trim() || 'Draft';
  }

  getStatusClass(salesOrder: any): string {
    const status = this.getSalesOrderStatus(salesOrder).toLowerCase();
    if (status === 'confirmed' || status === 'delivered' || status === 'closed') {
      return 'paid-status';
    }
    if (status.includes('cancel')) {
      return 'overdue-status';
    }
    if (status.includes('processing') || status.includes('shipped') || status.includes('pending')) {
      return 'partial-status';
    }
    return 'unpaid-status';
  }

  getSalesOrderTotal(salesOrder: any): number {
    return Number(salesOrder?.total ?? salesOrder?.grand_total ?? salesOrder?.amount ?? 0) || 0;
  }

  getSalesOrderItems(salesOrder: any): any[] {
    const rawItems = salesOrder?.items ?? salesOrder?.sales_order_items ?? salesOrder?.details ?? [];
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

  trackBySalesOrder(index: number, salesOrder: any): string | number {
    return salesOrder?.sales_order_id ?? salesOrder?.id ?? index;
  }
}
