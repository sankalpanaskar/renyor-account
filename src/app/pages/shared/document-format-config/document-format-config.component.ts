import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NbToastrService } from '@nebular/theme';
import { GlobalService } from '../../../services/global.service';

type DocumentFormatType = 'invoice' | 'quote' | 'sales-order';
type ConfigSection = 'header' | 'body' | 'table' | 'footer';

interface FormatDocumentOption {
  key: DocumentFormatType;
  label: string;
  icon: string;
  templatePath: string;
  defaultTitle: string;
  numberLabel: string;
  number: string;
  customerLabel: string;
}

interface FormatColumn {
  key: string;
  label: string;
  enabled: boolean;
  align: 'left' | 'right' | 'center';
}

interface FormatCustomField {
  key: string;
  label: string;
  enabled: boolean;
  defaultValue?: any;
}

interface DocumentFormatConfiguration {
  header: {
    visible: boolean;
    showLogo: boolean;
    logoUrl: string;
    businessName: string;
    businessAddress: string;
    documentTitle: string;
    accentColor: string;
  };
  body: {
    visible: boolean;
    customerLabel: string;
    introText: string;
    terms: string;
    showPaymentDetails: boolean;
    paymentDetails: string;
    customFieldPosition: 'top' | 'bottom';
    customFields: FormatCustomField[];
  };
  footer: {
    visible: boolean;
    text: string;
    showPageNumber: boolean;
  };
  columns: FormatColumn[];
}

@Component({
  selector: 'ngx-document-format-config',
  templateUrl: './document-format-config.component.html',
  styleUrls: ['./document-format-config.component.scss'],
})
export class DocumentFormatConfigComponent implements OnInit, OnDestroy {
  documentOptions: FormatDocumentOption[] = [
    {
      key: 'invoice',
      label: 'Invoice',
      icon: 'file-text-outline',
      templatePath: 'assets/format/invoice.html',
      defaultTitle: 'Invoice',
      numberLabel: 'Invoice Number',
      number: 'INV-2026-0001',
      customerLabel: 'Bill To',
    },
    {
      key: 'quote',
      label: 'Quote',
      icon: 'message-square-outline',
      templatePath: 'assets/format/quote.html',
      defaultTitle: 'Quote',
      numberLabel: 'Quote Number',
      number: 'QT-2026-0001',
      customerLabel: 'Prepared For',
    },
    {
      key: 'sales-order',
      label: 'Sales Order',
      icon: 'shopping-bag-outline',
      templatePath: 'assets/format/sales-order.html',
      defaultTitle: 'Sales Order',
      numberLabel: 'Order Number',
      number: 'SO-2026-0001',
      customerLabel: 'Customer',
    },
  ];

  selectedType: DocumentFormatType = 'invoice';
  activeSection: ConfigSection = 'header';
  config: DocumentFormatConfiguration = this.createDefaultConfiguration('invoice');
  templateHtml = '';
  previewHtml: SafeHtml = '';
  previewLoading = false;
  templateError = '';
  availableCustomFields: any[] = [];
  customFieldsLoading = false;
  private previewTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private toastrService: NbToastrService,
    private globalService: GlobalService,
  ) {}

  ngOnInit(): void {
    this.loadSelectedConfiguration();
    this.fetchInvoiceCustomFields();
  }

  ngOnDestroy(): void {
    if (this.previewTimer) {
      clearTimeout(this.previewTimer);
    }
  }

  get selectedDocument(): FormatDocumentOption {
    return this.documentOptions.find((option: FormatDocumentOption) => option.key === this.selectedType)
      || this.documentOptions[0];
  }

  get enabledColumnCount(): number {
    return this.config.columns.filter((column: FormatColumn) => column.enabled).length;
  }

  get enabledCustomFieldCount(): number {
    return this.config.body.customFields.filter((field: FormatCustomField) => field.enabled).length;
  }

  selectDocument(type: DocumentFormatType): void {
    if (this.selectedType === type) {
      return;
    }
    this.selectedType = type;
    this.activeSection = 'header';
    this.loadSelectedConfiguration();
  }

  setActiveSection(section: ConfigSection): void {
    this.activeSection = section;
  }

  schedulePreview(): void {
    if (this.previewTimer) {
      clearTimeout(this.previewTimer);
    }
    this.previewTimer = setTimeout(() => this.refreshPreview(), 0);
  }

  moveColumn(index: number, direction: -1 | 1): void {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= this.config.columns.length) {
      return;
    }
    const columns = [...this.config.columns];
    [columns[index], columns[targetIndex]] = [columns[targetIndex], columns[index]];
    this.config.columns = columns;
    this.refreshPreview();
  }

  saveConfiguration(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.config));
    this.toastrService.success(`${this.selectedDocument.label} format saved successfully.`, 'Format Saved');
  }

  resetConfiguration(): void {
    localStorage.removeItem(this.storageKey);
    this.config = this.createDefaultConfiguration(this.selectedType);
    this.syncCustomFieldsWithConfiguration();
    this.refreshPreview();
    this.toastrService.info(`${this.selectedDocument.label} format restored to default.`, 'Format Reset');
  }

  private get storageKey(): string {
    return `document-format-config:${this.selectedType}`;
  }

  private loadSelectedConfiguration(): void {
    this.config = this.getStoredConfiguration() || this.createDefaultConfiguration(this.selectedType);
    this.syncCustomFieldsWithConfiguration();
    this.loadTemplate();
  }

  private fetchInvoiceCustomFields(): void {
    this.customFieldsLoading = true;
    this.globalService.fetchCustomFieldsByModule(54).subscribe({
      next: (res: any) => {
        const fields = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        this.availableCustomFields = fields
          .filter((field: any) => Number(field?.status) === 1)
          .sort((a: any, b: any) => Number(a?.field_order || 0) - Number(b?.field_order || 0));
        this.syncCustomFieldsWithConfiguration();
        this.customFieldsLoading = false;
        this.schedulePreview();
      },
      error: () => {
        this.availableCustomFields = [];
        this.customFieldsLoading = false;
      },
    });
  }

  private syncCustomFieldsWithConfiguration(): void {
    if (this.selectedType !== 'invoice') {
      this.config.body.customFields = [];
      return;
    }

    if (!this.availableCustomFields.length) {
      return;
    }

    const savedFields = Array.isArray(this.config.body.customFields) ? this.config.body.customFields : [];
    const savedState = new Map(savedFields.map((field: FormatCustomField) => [field.key, field]));
    this.config.body.customFields = this.availableCustomFields.map((field: any) => {
      const key = `${field?.field_name || field?.name || ''}`.trim();
      const savedField = savedState.get(key);
      return {
        key,
        label: `${field?.field_label || field?.field_name || field?.name || 'Custom Field'}`,
        enabled: savedField ? savedField.enabled !== false : true,
        defaultValue: field?.default_value ?? '',
      };
    }).filter((field: FormatCustomField) => !!field.key);
  }

  private getStoredConfiguration(): DocumentFormatConfiguration | null {
    const storedValue = localStorage.getItem(this.storageKey);
    if (!storedValue) {
      return null;
    }
    try {
      const storedConfig = JSON.parse(storedValue);
      const defaults = this.createDefaultConfiguration(this.selectedType);
      return {
        ...defaults,
        ...storedConfig,
        header: { ...defaults.header, ...(storedConfig?.header || {}) },
        body: { ...defaults.body, ...(storedConfig?.body || {}) },
        footer: { ...defaults.footer, ...(storedConfig?.footer || {}) },
        columns: Array.isArray(storedConfig?.columns) ? storedConfig.columns : defaults.columns,
      };
    } catch {
      return null;
    }
  }

  private loadTemplate(): void {
    this.previewLoading = true;
    this.templateError = '';
    this.http.get(this.selectedDocument.templatePath, { responseType: 'text' }).subscribe({
      next: (template: string) => {
        this.templateHtml = template;
        this.previewLoading = false;
        this.refreshPreview();
      },
      error: () => {
        this.templateHtml = '';
        this.previewLoading = false;
        this.templateError = `${this.selectedDocument.templatePath} could not be loaded.`;
      },
    });
  }

  private refreshPreview(): void {
    if (!this.templateHtml) {
      this.previewHtml = '';
      return;
    }

    const columns = this.config.columns.filter((column: FormatColumn) => column.enabled);
    const headers = columns.length
      ? columns.map((column: FormatColumn) => `<th class="align-${column.align}">${this.escapeHtml(column.label)}</th>`).join('')
      : '<th>No columns selected</th>';
    const sampleValues: { [key: string]: string } = {
      serial: '1', item: 'Professional Services', description: 'Consulting and implementation',
      hsn: '998314', quantity: '2', unit: 'Hrs', rate: '₹5,000.00', tax: 'GST 18%',
      discount: '₹0.00', amount: '₹11,800.00',
    };
    const row = columns.length
      ? `<tr>${columns.map((column: FormatColumn) => `<td class="align-${column.align}">${sampleValues[column.key] || '-'}</td>`).join('')}</tr>`
      : '<tr><td>Enable at least one table column.</td></tr>';

    const accentColor = /^#[0-9a-f]{6}$/i.test(this.config.header.accentColor)
      ? this.config.header.accentColor
      : '#3366ff';
    const logoBlock = this.config.header.showLogo && this.config.header.logoUrl.trim()
      ? `<img class="document-logo" src="${this.escapeHtml(this.config.header.logoUrl.trim())}" alt="Business logo">`
      : '<div class="document-logo-placeholder">RY</div>';
    const customFields = this.config.body.customFields.filter((field: FormatCustomField) => field.enabled);
    const customFieldRows = customFields.map((field: FormatCustomField) => ({
      label: field.label,
      value: field.defaultValue || 'Sample value',
    }));
    const topCustomFieldRows = this.config.body.customFieldPosition === 'top'
      ? this.getCustomFieldDetailRows(customFieldRows)
      : '';
    const bottomCustomFields = this.config.body.customFieldPosition === 'bottom'
      ? this.getCustomFieldBottomHtml(customFieldRows)
      : '';

    const tokens: { [key: string]: string } = {
      '{{ACCENT_COLOR}}': accentColor,
      '{{HEADER_DISPLAY}}': this.config.header.visible ? 'flex' : 'none',
      '{{BODY_DISPLAY}}': this.config.body.visible ? 'block' : 'none',
      '{{FOOTER_DISPLAY}}': this.config.footer.visible ? 'block' : 'none',
      '{{LOGO_BLOCK}}': logoBlock,
      '{{BUSINESS_NAME}}': this.escapeHtml(this.config.header.businessName),
      '{{BUSINESS_ADDRESS}}': this.multilineHtml(this.config.header.businessAddress),
      '{{DOCUMENT_TITLE}}': this.escapeHtml(this.config.header.documentTitle),
      '{{DOCUMENT_NUMBER_LABEL}}': this.escapeHtml(this.selectedDocument.numberLabel),
      '{{DOCUMENT_NUMBER}}': this.escapeHtml(this.selectedDocument.number),
      '{{PAYMENT_STATUS}}': 'Unpaid',
      '{{PAYMENT_STATUS_CLASS}}': 'unpaid',
      '{{CUSTOMER_LABEL}}': this.escapeHtml(this.config.body.customerLabel),
      '{{BILL_TO}}': '<strong>ANU · Anudip Foundation</strong><br>21 Park Street<br>Kolkata, West Bengal, 700001<br>India<br>GSTIN: 19XXXXX0000X1XX',
      '{{SHIP_TO}}': '<strong>ANU · Anudip Foundation</strong><br>21 Park Street<br>Kolkata, West Bengal, 700001<br>India',
      '{{DOCUMENT_DETAILS}}': `<tr><td>Invoice Date</td><td>19 Jul 2026</td></tr><tr><td>Due Date</td><td>19 Jul 2026</td></tr><tr><td>Terms</td><td>Due on Receipt</td></tr><tr><td>Order No.</td><td>1234</td></tr>${topCustomFieldRows}`,
      '{{BODY_INTRO}}': this.multilineHtml(this.config.body.introText),
      '{{TABLE_HEADERS}}': headers,
      '{{TABLE_ROW}}': row,
      '{{TABLE_COLSPAN}}': `${Math.max(columns.length, 1)}`,
      '{{SUB_TOTAL}}': '₹10,000.00',
      '{{TAX_LABEL}}': 'IGST (18%)',
      '{{TAX_AMOUNT}}': '₹1,800.00',
      '{{TOTAL}}': '₹11,800.00',
      '{{PAYMENT_DISPLAY}}': this.config.body.showPaymentDetails ? 'block' : 'none',
      '{{PAYMENT_DETAILS}}': this.multilineHtml(this.config.body.paymentDetails),
      '{{CUSTOM_FIELDS_BOTTOM_DISPLAY}}': bottomCustomFields ? 'block' : 'none',
      '{{CUSTOM_FIELDS_BOTTOM}}': bottomCustomFields,
      '{{TERMS}}': this.multilineHtml(this.config.body.terms),
      '{{FOOTER_TEXT}}': this.multilineHtml(this.config.footer.text),
      '{{PAGE_NUMBER}}': this.config.footer.showPageNumber ? 'Page 1 of 1' : '',
    };

    let renderedTemplate = this.templateHtml;
    Object.keys(tokens).forEach((token: string) => {
      renderedTemplate = renderedTemplate.split(token).join(tokens[token]);
    });
    this.previewHtml = this.sanitizer.bypassSecurityTrustHtml(renderedTemplate);
  }

  private createDefaultConfiguration(type: DocumentFormatType): DocumentFormatConfiguration {
    const option = this.documentOptions.find((item: FormatDocumentOption) => item.key === type) || this.documentOptions[0];
    const accentColors: { [key in DocumentFormatType]: string } = {
      invoice: '#3366ff', quote: '#168354', 'sales-order': '#7850b5',
    };
    return {
      header: {
        visible: true,
        showLogo: true,
        logoUrl: 'https://msmeaccounts.com/assets/images/logo.png',
        businessName: 'RenYor',
        businessAddress: '123 Business Street, Kolkata, West Bengal\nGSTIN: 19XXXXX0000X1XX',
        documentTitle: option.defaultTitle,
        accentColor: accentColors[type],
      },
      body: {
        visible: true,
        customerLabel: option.customerLabel,
        introText: type === 'quote' ? 'Thank you for the opportunity to provide this quotation.' : '',
        terms: 'Payment is due according to the terms stated on this document.',
        showPaymentDetails: type === 'invoice',
        paymentDetails: 'Bank: Your Bank\nAccount: 0000000000\nIFSC: XXXX0000000',
        customFieldPosition: 'top',
        customFields: [],
      },
      footer: {
        visible: true,
        text: 'RenYor · billing@renyor.com · +91 00000 00000',
        showPageNumber: true,
      },
      columns: [
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
      ],
    };
  }

  private multilineHtml(value: string): string {
    return this.escapeHtml(value || '').replace(/\r?\n/g, '<br>');
  }

  private getCustomFieldDetailRows(fields: Array<{ label: string; value: any }>): string {
    return fields.map((field: { label: string; value: any }) =>
      `<tr><td>${this.escapeHtml(field.label)}</td><td>${this.escapeHtml(this.formatCustomFieldValue(field.value))}</td></tr>`
    ).join('');
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

  private escapeHtml(value: any): string {
    return `${value ?? ''}`
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }
}
