import { Component, OnInit } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { GlobalService } from '../../../services/global.service';
import { Router } from '@angular/router';

interface InvoiceItemRow {
  item_id: string | number;
  item_details: string;
  item_description: string;
  hsn_sac: string;
  quantity: number;
  rate: string | number;
  tax: string;
  item_unit?: string;
  item_type?: string;
  item_list_open?: boolean;
  item_is_manual?: boolean;
}

interface InvoiceCustomerOption {
  id: number;
  label: string;
  billing_state?: string;
  state?: string;
  state_name?: string;
}

interface InvoicePaymentTermOption {
  id?: string | number;
  termName: string;
  days: string | number;
}

interface InvoiceTaxOption {
  id?: string | number;
  taxName: string;
  rate: number;
  label: string;
}

interface InvoiceItemOption {
  id: number;
  label: string;
  name?: string;
  type?: string;
  selling_price?: number | string;
  hsn_code?: string;
  sac?: string;
  unit?: string;
  tax_preference?: string;
  tax_rate_name?: string;
  tax_rate_percentage?: number | string;
  sales_account_description?: string;
  purchase_account_description?: string;
  description?: string;
  item_description?: string;
}

@Component({
  selector: 'ngx-add-invoice',
  templateUrl: './add-invoice.component.html',
  styleUrls: ['./add-invoice.component.scss']
})
export class AddInvoiceComponent implements OnInit {
  isSubmitting = false;
  customFieldsLoading = false;
  isSavingInvoiceNumberPreference = false;
  isLoadingInvoiceNumberPreference = false;
  isEditMode = false;
  invoiceId: string | number | null = null;
  showInvoiceNumberPopup = false;
  showPaymentTermsPopup = false;
  uploadedInvoiceFiles: File[] = [];
  today = this.normalizeDate(new Date());
  dueDateMin = this.today;
  customerOptions: InvoiceCustomerOption[] = [];
  itemOptions: InvoiceItemOption[] = [];
  paymentTerms: InvoicePaymentTermOption[] = [];
  taxOptions: InvoiceTaxOption[] = [
    { label: 'Non-Taxable', rate: 0, taxName: 'Non-Taxable' }
  ];
  customFields: any[] = [];
  private readonly invoiceModuleId = 54;

  model: any = {
    customer_id: '',
    invoice_no: '',
    order_no: '',
    invoice_date: null,
    term: 'Due on Receipt',
    due_date: null,
    salesperson: '',
    subject: '',
    customer_notes: 'Looking forward for your business.',
    terms_and_conditions: '',
    additional_tax: '',
    adjustment_label: 'Adjustment',
    adjustment_value: 0
  };

  invoiceNumberPreference = {
    mode: 'auto',
    prefix: 'INV',
    currentNumber: '0000',
    nextNumber: '0001',
    suffix: ' ',
    incrementBy: 1,
  };

  itemRows: InvoiceItemRow[] = [];

  constructor(
    private toastrService: NbToastrService,
    private globalService: GlobalService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.fetchCustomers();
    this.fetchItems();
    this.fetchPaymentTerms();
    this.fetchTaxRates();
    this.fetchCustomFields();
    this.fetchInvoiceNumberPreference();
    this.model.invoice_date = this.normalizeDate(new Date());
    this.model.due_date = this.normalizeDate(new Date());
    this.dueDateMin = this.model.invoice_date;
    this.configureEditMode();

    if (this.itemRows.length === 0) {
      this.addRow();
    }
  }

  private configureEditMode(): void {
    const navigationState = window.history.state || {};
    const invoice = navigationState?.invoiceData;

    if (!navigationState?.isEditMode || !invoice) {
      return;
    }

    this.isEditMode = true;
    this.invoiceId = invoice?.invoice_id ?? invoice?.id ?? null;
    this.model = {
      ...this.model,
      ...this.parseCustomFieldValues(invoice?.custom_field),
      customer_id: invoice?.customer_id ?? invoice?.customer?.id ?? '',
      invoice_no: invoice?.invoice_no ?? invoice?.invoice_number ?? '',
      order_no: invoice?.order_no ?? invoice?.order_number ?? '',
      invoice_date: this.normalizeDate(invoice?.invoice_date ?? invoice?.date ?? new Date()),
      term: invoice?.term ?? invoice?.payment_term ?? 'Due on Receipt',
      due_date: this.normalizeDate(invoice?.due_date ?? invoice?.invoice_date ?? new Date()),
      salesperson: invoice?.salesperson ?? invoice?.sales_person ?? '',
      subject: invoice?.subject ?? '',
      customer_notes: invoice?.customer_notes ?? '',
      terms_and_conditions: invoice?.terms_and_conditions ?? invoice?.terms_conditions ?? '',
      adjustment_label: invoice?.adjustment_label ?? 'Adjustment',
      adjustment_value: Number(invoice?.adjustment_value ?? invoice?.adjustment ?? 0),
    };

    this.dueDateMin = this.model.invoice_date;
    this.itemRows = this.getInvoiceItems(invoice).map((item: any) => ({
      item_id: item?.item_id ?? item?.id ?? '',
      item_details: item?.item_name ?? item?.item_details ?? item?.name ?? '',
      item_description: item?.item_description ?? item?.description ?? '',
      hsn_sac: item?.hsn_sac ?? item?.hsn_code ?? item?.sac ?? '',
      quantity: Number(item?.quantity ?? 1),
      rate: this.formatDecimalValue(item?.rate ?? item?.selling_price ?? 0),
      tax: item?.tax ?? item?.tax_name ?? 'Non-Taxable',
      item_unit: item?.unit ?? item?.item_unit ?? '',
      item_type: item?.item_type ?? item?.type ?? '',
      item_list_open: false,
      item_is_manual: !!item?.is_manual,
    }));
  }

  private parseCustomFieldValues(value: any): any {
    if (!value) {
      return {};
    }
    if (typeof value === 'string') {
      try {
        const parsedValue = JSON.parse(value);
        return parsedValue && typeof parsedValue === 'object' ? parsedValue : {};
      } catch {
        return {};
      }
    }
    return typeof value === 'object' ? { ...value } : {};
  }

  fetchCustomFields(): void {
    this.customFieldsLoading = true;
    this.globalService.fetchCustomFieldsByModule(this.invoiceModuleId).subscribe({
      next: (res: any) => {
        const fields = Array.isArray(res?.data)
          ? res.data
          : (Array.isArray(res) ? res : []);
        this.customFields = fields
          .filter((field: any) => Number(field?.show_in_form) === 1 && Number(field?.status) === 1)
          .sort((a: any, b: any) => Number(a?.field_order || 0) - Number(b?.field_order || 0));
        this.applyCustomFieldDefaults();
        this.customFieldsLoading = false;
      },
      error: (error: any) => {
        this.customFields = [];
        this.customFieldsLoading = false;
        this.toastrService.danger(
          error?.error?.message || 'Invoice custom fields could not be loaded.',
          'Custom Fields',
        );
      },
    });
  }

  private applyCustomFieldDefaults(): void {
    this.customFields.forEach((field: any) => {
      const fieldName = `${field?.field_name || ''}`.trim();
      if (!fieldName) {
        return;
      }
      const hasValue = this.model[fieldName] !== undefined && this.model[fieldName] !== null;
      if (this.getFieldType(field) === 'checkbox') {
        this.model[fieldName] = this.parseCheckboxValues(hasValue ? this.model[fieldName] : field?.default_value);
      } else if (!hasValue) {
        this.model[fieldName] = field?.default_value ?? '';
      }
    });
  }

  getFieldType(field: any): string {
    const type = `${field?.field_type || 'text'}`.trim().toLowerCase().replace(/[\s_-]+/g, '');
    if (type === 'radiobutton') {
      return 'radio';
    }
    if (type === 'checkboxes') {
      return 'checkbox';
    }
    if (type === 'datepicker') {
      return 'date';
    }
    const allowedTypes = ['text', 'textarea', 'number', 'email', 'date', 'select', 'radio', 'checkbox'];
    return allowedTypes.includes(type) ? type : 'text';
  }

  getFieldOptions(field: any): string[] {
    const rawOptions = field?.field_options;
    if (!rawOptions) {
      return [];
    }
    if (Array.isArray(rawOptions)) {
      return rawOptions.map((option: any) => this.normalizeFieldOption(option)).filter(Boolean);
    }
    if (typeof rawOptions === 'string') {
      const normalizedOptions = rawOptions.trim();
      if (!normalizedOptions) {
        return [];
      }
      try {
        const parsedOptions = JSON.parse(normalizedOptions);
        if (Array.isArray(parsedOptions)) {
          return parsedOptions.map((option: any) => this.normalizeFieldOption(option)).filter(Boolean);
        }
        if (parsedOptions && typeof parsedOptions === 'object') {
          return Object.values(parsedOptions).map((option: any) => this.normalizeFieldOption(option)).filter(Boolean);
        }
      } catch {
      }
      return normalizedOptions.split(/[\n,|]/).map((option: string) => option.trim()).filter(Boolean);
    }
    return typeof rawOptions === 'object'
      ? Object.values(rawOptions).map((option: any) => this.normalizeFieldOption(option)).filter(Boolean)
      : [];
  }

  private normalizeFieldOption(option: any): string {
    if (option === null || option === undefined) {
      return '';
    }
    if (typeof option === 'object') {
      return `${option?.label ?? option?.name ?? option?.title ?? option?.value ?? ''}`.trim();
    }
    return `${option}`.trim();
  }

  private parseCheckboxValues(value: any): string[] {
    if (!value) {
      return [];
    }
    if (Array.isArray(value)) {
      return value.map((item: any) => `${item}`.trim()).filter(Boolean);
    }
    if (typeof value === 'string') {
      const normalizedValue = value.trim();
      if (!normalizedValue) {
        return [];
      }
      try {
        const parsedValue = JSON.parse(normalizedValue);
        if (Array.isArray(parsedValue)) {
          return parsedValue.map((item: any) => `${item}`.trim()).filter(Boolean);
        }
      } catch {
      }
      return normalizedValue.split(/[\n,|]/).map((item: string) => item.trim()).filter(Boolean);
    }
    return [`${value}`.trim()].filter(Boolean);
  }

  isFieldRequired(field: any): boolean {
    return Number(field?.is_required) === 1;
  }

  isCheckboxChecked(fieldName: string, option: string): boolean {
    return Array.isArray(this.model?.[fieldName]) && this.model[fieldName].includes(option);
  }

  onCheckboxOptionChange(fieldName: string, option: string, checkedValue: any): void {
    const checked = typeof checkedValue === 'boolean' ? checkedValue : !!checkedValue?.checked;
    const selectedOptions = Array.isArray(this.model?.[fieldName]) ? [...this.model[fieldName]] : [];
    if (checked && !selectedOptions.includes(option)) {
      selectedOptions.push(option);
    } else if (!checked) {
      const optionIndex = selectedOptions.indexOf(option);
      if (optionIndex !== -1) {
        selectedOptions.splice(optionIndex, 1);
      }
    }
    this.model[fieldName] = selectedOptions;
  }

  hasFieldError(form: any, field: any): boolean {
    if (!form?.submitted || !this.isFieldRequired(field)) {
      return false;
    }
    const fieldName = field?.field_name;
    if (this.getFieldType(field) === 'checkbox') {
      return !Array.isArray(this.model?.[fieldName]) || this.model[fieldName].length === 0;
    }
    return !!form?.controls?.[fieldName]?.invalid;
  }

  private hasRequiredCustomFieldError(): boolean {
    return this.customFields.some((field: any) => {
      if (!this.isFieldRequired(field)) {
        return false;
      }
      const value = this.model?.[field?.field_name];
      return this.getFieldType(field) === 'checkbox'
        ? !Array.isArray(value) || value.length === 0
        : value === undefined || value === null || `${value}`.trim() === '';
    });
  }

  private getInvoiceItems(invoice: any): any[] {
    const rawItems = invoice?.items ?? invoice?.invoice_items ?? invoice?.details ?? [];

    if (Array.isArray(rawItems)) {
      return rawItems;
    }

    if (typeof rawItems === 'string') {
      try {
        const parsedItems = JSON.parse(rawItems);
        return Array.isArray(parsedItems) ? parsedItems : [];
      } catch {
        return [];
      }
    }

    return [];
  }

  fetchCustomers(): void {
    this.globalService.getCustomerListByTenant(34).subscribe({
      next: (res: any) => {
        const customers = Array.isArray(res?.data) ? res.data : [];
        this.customerOptions = customers
          .map((customer: any) => ({
            id: Number(customer?.id || 0),
            label: this.getCustomerLabel(customer),
            billing_state: `${customer?.billing_state || ''}`.trim(),
            state: `${customer?.state || ''}`.trim(),
            state_name: `${customer?.state_name || ''}`.trim()
          }))
          .filter((customer: InvoiceCustomerOption) => customer.id > 0 && !!customer.label);
      },
      error: () => {
        this.customerOptions = [];
      }
    });
  }

  fetchPaymentTerms(): void {
    this.globalService.getPaymentTerms().subscribe({
      next: (res: any) => {
        this.paymentTerms = Array.isArray(res?.data)
          ? res.data.map((item: any) => ({
              id: item.id,
              termName: item.term_name,
              days: item.no_of_days
            }))
          : [];

        if (!this.model.term && this.paymentTerms.length > 0) {
          const defaultTerm = this.paymentTerms.find((term: InvoicePaymentTermOption) => `${term.termName}`.trim().toLowerCase() === 'due on receipt');
          this.model.term = defaultTerm?.termName || 'Due on Receipt';
        }

        this.updateDueDateFromPaymentTerm();
      },
      error: () => {
        this.paymentTerms = [];
        if (!this.model.term) {
          this.model.term = 'Due on Receipt';
        }

        this.updateDueDateFromPaymentTerm();
      }
    });
  }

  fetchTaxRates(): void {
    this.globalService.getTaxRates().subscribe({
      next: (res: any) => {
        const apiRows = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        const mappedRates = apiRows
          .map((item: any) => {
            const taxName = `${item?.tax_rate_name ?? ''}`.trim();
            const rate = Number(item?.tax_rate_percentage || 0);

            if (!taxName && !rate) {
              return null;
            }

            return {
              id: item?.id,
              taxName,
              rate,
              label: `${taxName} [${rate}%]`
            } as InvoiceTaxOption;
          })
          .filter((item: InvoiceTaxOption | null): item is InvoiceTaxOption => !!item);

        this.taxOptions = [
          { label: 'Non-Taxable', rate: 0, taxName: 'Non-Taxable' },
          ...mappedRates.filter((option: InvoiceTaxOption) => option.rate > 0)
        ];
        this.itemRows = this.itemRows.map((row: InvoiceItemRow) => ({
          ...row,
          tax: this.getTaxFormLabel(row.tax),
        }));
      },
      error: (error: any) => {
        console.error('Failed to fetch tax rates:', error);
        this.taxOptions = [{ label: 'Non-Taxable', rate: 0, taxName: 'Non-Taxable' }];
      }
    });
  }

  onInvoiceDateChange(date: Date): void {
    const normalizedDate = this.normalizeDate(date);
    this.model.invoice_date = normalizedDate;
    this.dueDateMin = normalizedDate;

    if (this.model.due_date && this.normalizeDate(this.model.due_date).getTime() < normalizedDate.getTime()) {
      this.model.due_date = null;
    }

    this.updateDueDateFromPaymentTerm();
  }

  private normalizeDate(value: Date | string | null | undefined): Date {
    const sourceDate = value instanceof Date ? value : new Date(value || new Date());
    return new Date(sourceDate.getFullYear(), sourceDate.getMonth(), sourceDate.getDate());
  }

  fetchItems(): void {
    this.globalService.fetchItems().subscribe({
      next: (res: any) => {
        const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        this.itemOptions = rows
          .map((item: any) => ({
            id: Number(item?.id || 0),
            label: this.getItemLabel(item),
            name: item?.name || '',
            type: item?.type || '',
            selling_price: item?.selling_price,
            hsn_code: item?.hsn_code,
            sac: item?.sac,
            unit: item?.unit,
            tax_preference: item?.tax_preference,
            tax_rate_name: item?.tax_rate_name,
            tax_rate_percentage: item?.tax_rate_percentage,
            sales_account_description: item?.sales_account_description,
            purchase_account_description: item?.purchase_account_description,
            description: item?.description,
            item_description: item?.item_description,
          }))
          .filter((item: InvoiceItemOption) => item.id > 0 && !!item.label);
      },
      error: () => {
        this.itemOptions = [];
      }
    });
  }

  private getCustomerLabel(customer: any): string {
    const fullName = `${customer?.primary_contact_f_name || ''} ${customer?.primary_contact_l_name || ''}`.trim();
    return customer?.display_name || customer?.company_name || fullName || '';
  }

  private getItemLabel(item: any): string {
    return `${item?.name || ''}`.trim();
  }

  private getItemDescription(item: any): string {
    return (
      item?.description ||
      item?.item_description ||
      item?.sales_account_description ||
      item?.purchase_account_description ||
      ''
    ).trim();
  }

  private getItemTaxLabel(item: any): string {
    const rate = Number(item?.tax_rate_percentage);

    if (rate > 0) {
      const match = this.taxOptions.find((option: InvoiceTaxOption) => option.rate === rate);
      if (match) {
        return match.label;
      }

      const taxName = `${item?.tax_rate_name || 'GST'}`.trim();
      return `${taxName} [${rate}%]`;
    }

    return item?.tax_preference || 'Non-Taxable';
  }

  getTaxDisplayLabel(label: string): string {
    return `${label || 'Non-Taxable'}`
      .trim()
      .replace(/\s*\[\s*\d+(?:\.\d+)?%\s*\]\s*$/, '');
  }

  private getSelectedCustomer(): InvoiceCustomerOption | undefined {
    return this.customerOptions.find(
      (customer: InvoiceCustomerOption) => customer.id === Number(this.model.customer_id)
    );
  }

  private getBusinessStateCode(): string {
    const user = this.globalService.currentUser || JSON.parse(localStorage.getItem('user') || '{}');

    const candidates = [
      user?.state,
      user?.company_state,
      user?.billing_state,
      user?.business_state,
      user?.member?.state,
      user?.member?.base_state,
      user?.organization?.state,
      user?.tenant?.state,
      user?.company?.state,
      user?.centerData?.[0]?.state,
      user?.assgin_centers?.[0]?.state
    ];

    const match = candidates.find((value: any) => `${value || ''}`.trim());
    return `${match || ''}`.trim().toUpperCase();
  }

  getCustomerStateCode(): string {
    const selectedCustomer = this.getSelectedCustomer();
    const stateCode = selectedCustomer?.billing_state || selectedCustomer?.state || '';
    return `${stateCode || ''}`.trim().toUpperCase();
  }

  isInterState(): boolean {
    const customerState = this.getCustomerStateCode();
    const businessState = this.getBusinessStateCode();

    if (!customerState || !businessState) {
      return true;
    }

    return customerState !== businessState;
  }

  getItemTaxRate(row: InvoiceItemRow): number {
    return this.getTaxRate(row.tax);
  }

  getRowTaxAmount(row: InvoiceItemRow): number {
    return (this.getRowAmount(row) * this.getItemTaxRate(row)) / 100;
  }

  getTotalItemTaxAmount(): number {
    return this.itemRows.reduce((total: number, row: InvoiceItemRow) => total + this.getRowTaxAmount(row), 0);
  }

  getTaxModeLabel(): string {
    return this.isInterState() ? 'IGST' : 'CGST + SGST';
  }

  getTaxLabel(): string {
    return this.getTaxModeLabel();
  }

  onItemSelected(row: InvoiceItemRow, selectedId: string | number): void {
    const item = this.itemOptions.find((option: InvoiceItemOption) => option.id === Number(selectedId));

    if (!item) {
      return;
    }

    row.item_id = item.id;
    row.item_details = item.label;
    row.item_description = this.getItemDescription(item);
    row.hsn_sac = `${item.hsn_code || item.sac || ''}`.trim();
    row.item_unit = `${item.unit || ''}`.trim();
    row.item_type = `${item.type || ''}`.trim();
    row.quantity = Number(row.quantity || 1) || 1;
    row.rate = this.formatDecimalValue(item.selling_price || 0);
    row.tax = this.getItemTaxLabel(item);
    row.item_is_manual = false;
  }

  onItemInputChange(row: InvoiceItemRow, value: string): void {
    row.item_details = value;
    row.item_id = '';
    row.item_is_manual = false;
    row.item_list_open = true;
  }

  autoGrowTextarea(event: Event): void {
    const target = event.target as HTMLTextAreaElement | null;

    if (!target) {
      return;
    }

    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  }

  allowIntegerOnly(event: KeyboardEvent): void {
    const allowedKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'Enter',
      'Escape',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End'
    ];

    if (allowedKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
      return;
    }

    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }

  allowDecimalOnly(event: KeyboardEvent): void {
    const allowedKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'Enter',
      'Escape',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End'
    ];

    if (allowedKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
      return;
    }

    const target = event.target as HTMLInputElement | null;
    const value = `${target?.value || ''}`;

    if (event.key === '.' && value.includes('.')) {
      event.preventDefault();
      return;
    }

    if (!/^\d$/.test(event.key) && event.key !== '.') {
      event.preventDefault();
    }
  }

  formatRateOnBlur(row: InvoiceItemRow): void {
    row.rate = this.formatDecimalValue(row.rate);
  }

  getRateNumber(value: string | number): number {
    const numericValue = Number(value || 0);
    return Number.isFinite(numericValue) ? numericValue : 0;
  }

  getRowAmount(row: InvoiceItemRow): number {
    return this.getRateNumber(row.rate) * Number(row.quantity || 0);
  }

  private formatDecimalValue(value: string | number): string {
    return this.getRateNumber(value).toFixed(2);
  }

  allowSignedDecimalOnly(event: KeyboardEvent): void {
    const allowedKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'Enter',
      'Escape',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End'
    ];

    if (allowedKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
      return;
    }

    const target = event.target as HTMLInputElement | null;
    const value = `${target?.value || ''}`;
    const selectionStart = target?.selectionStart ?? 0;

    if ((event.key === '+' || event.key === '-') && selectionStart === 0 && !value.includes('+') && !value.includes('-')) {
      return;
    }

    if (event.key === '.' && value.includes('.')) {
      event.preventDefault();
      return;
    }

    if (!/^\d$/.test(event.key) && event.key !== '.') {
      event.preventDefault();
    }
  }

  onItemInputFocus(row: InvoiceItemRow): void {
    row.item_list_open = true;
  }

  onItemInputBlur(row: InvoiceItemRow): void {
    setTimeout(() => {
      row.item_list_open = false;
      this.applyExactItemMatch(row);
    }, 150);
  }

  selectItemFromAutocomplete(row: InvoiceItemRow, item: InvoiceItemOption, rowIndex: number): void {
    row.item_id = item.id;
    row.item_details = item.label;
    row.item_description = this.getItemDescription(item);
    row.hsn_sac = `${item.hsn_code || item.sac || ''}`.trim();
    row.item_unit = `${item.unit || ''}`.trim();
    row.item_type = `${item.type || ''}`.trim();
    row.quantity = Number(row.quantity || 1) || 1;
    row.rate = this.formatDecimalValue(item.selling_price || 0);
    row.tax = this.getItemTaxLabel(item);
    row.item_list_open = false;
    row.item_is_manual = false;

    setTimeout(() => {
      this.resizeRowTextarea(`item-details-${rowIndex}`);
      this.resizeRowTextarea(`item-description-${rowIndex}`);
    }, 0);
  }

  getFilteredItems(query: string): InvoiceItemOption[] {
    const searchValue = `${query || ''}`.trim().toLowerCase();

    if (!searchValue) {
      return this.itemOptions;
    }

    return this.itemOptions.filter(
      (item: InvoiceItemOption) => item.label.toLowerCase().includes(searchValue)
    );
  }

  private applyExactItemMatch(row: InvoiceItemRow): void {
    const rawValue = `${row.item_details || ''}`.trim().toLowerCase();

    if (!rawValue) {
      return;
    }

    const exactMatch = this.itemOptions.find(
      (item: InvoiceItemOption) => item.label.toLowerCase() === rawValue
    );

    if (exactMatch) {
      this.selectItemFromAutocomplete(row, exactMatch, this.itemRows.indexOf(row));
      return;
    }

    this.selectManualItem(row, this.itemRows.indexOf(row));
  }

  private selectManualItem(row: InvoiceItemRow, rowIndex: number): void {
    const itemLabel = `${row.item_details || ''}`.trim();

    if (!itemLabel) {
      return;
    }

    row.item_id = `manual-${rowIndex}-${Date.now()}`;
    row.item_details = itemLabel;
    row.item_description = `${row.item_description || ''}`.trim();
    row.hsn_sac = `${row.hsn_sac || ''}`.trim();
    row.item_unit = `${row.item_unit || ''}`.trim();
    row.item_type = 'Service';
    row.quantity = Number(row.quantity || 1) || 1;
    row.rate = this.formatDecimalValue(row.rate || 0);
    row.tax = row.tax || 'Non-Taxable';
    row.item_list_open = false;
    row.item_is_manual = true;
  }

  clearItemRow(row: InvoiceItemRow): void {
    row.item_id = '';
    row.item_details = '';
    row.item_description = '';
    row.hsn_sac = '';
    row.item_unit = '';
    row.item_type = '';
    row.quantity = 1;
    row.rate = '0.00';
    row.tax = 'Non-Taxable';
    row.item_list_open = false;
    row.item_is_manual = false;
  }

  private resizeRowTextarea(elementId: string): void {
    const element = document.getElementById(elementId) as HTMLTextAreaElement | null;

    if (!element) {
      return;
    }

    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  }

  openPaymentTermsPopup(): void {
    this.showPaymentTermsPopup = true;
  }

  openInvoiceNumberPopup(): void {
    this.showInvoiceNumberPopup = true;
  }

  private fetchInvoiceNumberPreference(): void {
    this.isLoadingInvoiceNumberPreference = true;
    this.globalService.fetchDocumentNumberSettings('Invoice').subscribe({
      next: (res: any) => {
        const settings = this.extractDocumentNumberSettings(res);
        if (settings) {
          const isManualNumbering = `${settings?.type || 'A'}`.trim().toUpperCase() === 'M';
          const currentNumberText = `${settings?.current_number ?? 0}`.trim();
          const currentNumber = Number(currentNumberText.replace(/\D/g, '')) || 0;
          const incrementBy = Math.max(Number(settings?.increment_by) || 1, 1);
          const existingWidth = `${this.invoiceNumberPreference.nextNumber || ''}`.replace(/\D/g, '').length;
          const responseWidth = currentNumberText.replace(/\D/g, '').length;
          const numberWidth = Math.max(existingWidth, responseWidth, 4);
          const formattedCurrentNumber = `${currentNumber}`.padStart(numberWidth, '0');
          this.invoiceNumberPreference = {
            ...this.invoiceNumberPreference,
            mode: isManualNumbering ? 'manual' : 'auto',
            prefix: `${settings?.prefix ?? 'INV'}`,
            currentNumber: formattedCurrentNumber,
            nextNumber: `${currentNumber + incrementBy}`.padStart(numberWidth, '0'),
            suffix: settings?.suffix !== undefined && settings?.suffix !== null
              ? `${settings.suffix}`
              : ' ',
            incrementBy,
          };
          if (!this.isEditMode) {
            this.applyInvoiceNumber();
          }
        }
        this.isLoadingInvoiceNumberPreference = false;
      },
      error: (error: any) => {
        this.isLoadingInvoiceNumberPreference = false;
        this.toastrService.danger(
          error?.error?.message || error?.message || 'Invoice number preferences could not be loaded.',
          'Load Failed',
        );
      },
    });
  }

  private extractDocumentNumberSettings(response: any): any {
    const candidates = [
      response?.data,
      response?.data?.data,
      response?.settings,
      response?.result,
      response,
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate) && candidate.length > 0) {
        return candidate[0];
      }
      if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) {
        if (candidate?.prefix !== undefined || candidate?.current_number !== undefined) {
          return candidate;
        }
      }
    }
    return null;
  }

  closeInvoiceNumberPopup(): void {
    this.showInvoiceNumberPopup = false;
  }

  saveInvoiceNumberPreference(): void {
    const prefix = `${this.invoiceNumberPreference.prefix || ''}`.trim();
    const currentNumberText = `${this.invoiceNumberPreference.nextNumber || ''}`.replace(/\D/g, '');
    const currentNumber = Number(currentNumberText);
    const isAutomaticNumbering = this.invoiceNumberPreference.mode === 'auto';

    if (isAutomaticNumbering && (!prefix || !Number.isFinite(currentNumber) || currentNumber < 0)) {
      this.toastrService.danger('Enter a valid prefix and next number.', 'Invoice Number');
      return;
    }

    const payload = {
      document_type: 'Invoice',
      type: (isAutomaticNumbering ? 'A' : 'M') as 'A' | 'M',
      prefix,
      current_number: this.invoiceNumberPreference.currentNumber,
      suffix: this.invoiceNumberPreference.suffix,
      increment_by: Number(this.invoiceNumberPreference.incrementBy) || 1,
    };

    this.isSavingInvoiceNumberPreference = true;
    this.globalService.saveDocumentNumberSettings(payload).subscribe({
      next: (res: any) => {
        this.isSavingInvoiceNumberPreference = false;
        this.applyInvoiceNumber();
        this.closeInvoiceNumberPopup();
        this.toastrService.success(
          res?.message || 'Invoice number preferences saved successfully.',
          'Saved',
        );
      },
      error: (error: any) => {
        this.isSavingInvoiceNumberPreference = false;
        this.toastrService.danger(
          error?.error?.message || error?.message || 'Invoice number preferences could not be saved.',
          'Save Failed',
        );
      },
    });
  }

  closePaymentTermsPopup(): void {
    this.showPaymentTermsPopup = false;
  }

  onPaymentTermsChanged(terms: InvoicePaymentTermOption[]): void {
    this.paymentTerms = terms;
    this.updateDueDateFromPaymentTerm();
  }

  onPaymentTermSelected(termName: string): void {
    this.model.term = termName;
    this.updateDueDateFromPaymentTerm(termName);
    this.closePaymentTermsPopup();
  }

  generateInvoiceNumber(): string {
    return `${this.invoiceNumberPreference.prefix}${this.invoiceNumberPreference.nextNumber}`;
  }

  private applyInvoiceNumber(): void {
    if (this.invoiceNumberPreference.mode === 'auto') {
      this.model.invoice_no = this.generateInvoiceNumber();
    } else if (!this.isEditMode) {
      this.model.invoice_no = '';
    }
  }

  addRow(): void {
    this.itemRows = [
      ...this.itemRows,
      {
        item_id: '',
        item_details: '',
        item_description: '',
        hsn_sac: '',
        quantity: 1,
        rate: '0.00',
        tax: 'Non-Taxable',
        item_unit: '',
        item_type: '',
        item_list_open: false,
        item_is_manual: false
      }
    ];
  }

  removeRow(index: number): void {
    if (this.itemRows.length === 1) {
      this.itemRows[0] = {
        item_id: '',
        item_details: '',
        item_description: '',
        hsn_sac: '',
        quantity: 1,
        rate: '0.00',
        tax: 'Non-Taxable',
        item_unit: '',
        item_type: '',
        item_list_open: false,
        item_is_manual: false
      };
      return;
    }
    this.itemRows = this.itemRows.filter((_: InvoiceItemRow, rowIndex: number) => rowIndex !== index);
  }

  trackByIndex(index: number): number {
    return index;
  }

  getSubTotal(): number {
    return this.itemRows.reduce((total: number, row: InvoiceItemRow) => total + this.getRowAmount(row), 0);
  }

  getTaxRate(label: string): number {
    const normalizedLabel = this.getTaxDisplayLabel(label).toLowerCase();
    return this.taxOptions.find((option: InvoiceTaxOption) =>
      this.getTaxDisplayLabel(option.label).toLowerCase() === normalizedLabel
    )?.rate || 0;
  }

  private getTaxFormLabel(label: string): string {
    const normalizedLabel = this.getTaxDisplayLabel(label).toLowerCase();
    return this.taxOptions.find((option: InvoiceTaxOption) =>
      this.getTaxDisplayLabel(option.label).toLowerCase() === normalizedLabel
    )?.label || label || 'Non-Taxable';
  }

  getTaxAmount(): number {
    return this.getTotalItemTaxAmount();
  }

  getIGST(): number {
    return this.isInterState() ? this.getTaxAmount() : 0;
  }

  getCGST(): number {
    return this.isInterState() ? 0 : this.getTaxAmount() / 2;
  }

  getSGST(): number {
    return this.isInterState() ? 0 : this.getTaxAmount() / 2;
  }

  getAdjustmentValue(): number {
    return Number(this.model.adjustment_value || 0);
  }

  getTotal(): number {
    return this.getSubTotal() + this.getTaxAmount() + this.getAdjustmentValue();
  }

  private formatApiDate(value: Date | string | null | undefined): string {
    if (!value) {
      return '';
    }

    const date = this.normalizeDate(value);
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private updateDueDateFromPaymentTerm(termName: string = `${this.model.term || ''}`.trim()): void {
    const normalizedTerm = `${termName || ''}`.trim().toLowerCase();
    const invoiceDate = this.normalizeDate(this.model.invoice_date || new Date());

    if (!normalizedTerm) {
      this.dueDateMin = invoiceDate;
      return;
    }

    if (normalizedTerm === 'due on receipt') {
      this.model.due_date = invoiceDate;
      this.dueDateMin = invoiceDate;
      return;
    }

    const dueDays = this.getPaymentTermDays(termName);
    if (dueDays === null) {
      this.dueDateMin = invoiceDate;
      return;
    }

    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + dueDays);
    this.model.due_date = dueDate;
    this.dueDateMin = dueDate;
  }

  private getPaymentTermDays(termName: string): number | null {
    const normalizedTerm = `${termName || ''}`.trim().toLowerCase();
    if (!normalizedTerm) {
      return null;
    }

    const matchedTerm = this.paymentTerms.find((term: InvoicePaymentTermOption) =>
      `${term.termName || ''}`.trim().toLowerCase() === normalizedTerm
    );

    const daysFromApi = Number(matchedTerm?.days);
    if (Number.isFinite(daysFromApi)) {
      return daysFromApi;
    }

    const netMatch = normalizedTerm.match(/^net\s+(\d+)$/i);
    if (netMatch) {
      const netDays = Number(netMatch[1]);
      return Number.isFinite(netDays) ? netDays : null;
    }

    const daysMatch = normalizedTerm.match(/^(\d+)\s*days?$/i);
    if (daysMatch) {
      const explicitDays = Number(daysMatch[1]);
      return Number.isFinite(explicitDays) ? explicitDays : null;
    }

    return null;
  }

  private getSubmitRows(): any[] {
    return this.itemRows
      .filter((row: InvoiceItemRow) => `${row.item_details || ''}`.trim())
      .map((row: InvoiceItemRow) => ({
        item_id: row.item_is_manual ? null : row.item_id,
        item_name: `${row.item_details || ''}`.trim(),
        item_description: `${row.item_description || ''}`.trim(),
        item_type: `${row.item_type || 'Service'}`.trim(),
        hsn_sac: `${row.hsn_sac || ''}`.trim(),
        quantity: Number(row.quantity || 0),
        rate: this.getRateNumber(row.rate),
        tax: this.getTaxDisplayLabel(row.tax),
        unit: `${row.item_unit || ''}`.trim(),
        amount: this.getRowAmount(row),
        is_manual: !!row.item_is_manual,
      }));
  }

  onInvoiceFilesChange(files: File[]): void {
    this.uploadedInvoiceFiles = files;
  }

  private appendFormDataValue(formData: FormData, key: string, value: any): void {
    if (value === undefined || value === null) {
      formData.append(key, '');
      return;
    }

    if (typeof value === 'object') {
      formData.append(key, JSON.stringify(value));
      return;
    }

    formData.append(key, `${value}`);
  }

  private getInvoiceRequestPayload(payload: any): FormData {
    const formData = new FormData();
    Object.keys(payload).forEach((key: string) => {
      this.appendFormDataValue(formData, key, payload[key]);
    });

    const invoiceAttachment = this.uploadedInvoiceFiles[0];
    if (invoiceAttachment) {
      formData.append(
        'invoice_attachment',
        invoiceAttachment,
        invoiceAttachment.name,
      );
    }

    return formData;
  }

  onSubmit(form: any): void {
    if (this.hasRequiredCustomFieldError()) {
      this.toastrService.danger('Complete all required custom fields.', 'Validation Failed');
      return;
    }

    if (!form.valid) {
      return;
    }

    const items = this.getSubmitRows();

    if (items.length === 0) {
      this.toastrService.danger('Add at least one invoice item.', 'Validation Failed');
      return;
    }

    const customFieldData = this.customFields.reduce((values: any, field: any) => {
      const fieldName = `${field?.field_name || ''}`.trim();
      if (fieldName) {
        values[fieldName] = this.model?.[fieldName] ?? '';
      }
      return values;
    }, {});

    const payload = {
      ...(this.isEditMode && this.invoiceId ? { invoice_id: this.invoiceId } : {}),
      ...(!this.isEditMode && this.invoiceNumberPreference.mode === 'auto' ? {
        document_type: 'Invoice',
        current_number: `${this.invoiceNumberPreference.nextNumber || ''}`,
      } : {}),
      module_id: this.invoiceModuleId,
      ...(Object.keys(customFieldData).length ? { custom_field: customFieldData } : {}),
      customer_id: this.model.customer_id,
      invoice_no: `${this.model.invoice_no || ''}`.trim(),
      order_no: `${this.model.order_no || ''}`.trim(),
      invoice_date: this.formatApiDate(this.model.invoice_date),
      term: `${this.model.term || ''}`.trim(),
      due_date: this.formatApiDate(this.model.due_date),
      salesperson: `${this.model.salesperson || ''}`.trim(),
      subject: `${this.model.subject || ''}`.trim(),
      customer_notes: `${this.model.customer_notes || ''}`.trim(),
      terms_and_conditions: `${this.model.terms_and_conditions || ''}`.trim(),
      additional_tax: this.getTaxLabel(),
      additional_tax_rate: 0,
      sub_total: this.getSubTotal(),
      tax_amount: this.getTaxAmount(),
      tax_mode: this.getTaxLabel(),
      customer_state: this.getCustomerStateCode(),
      business_state: this.getBusinessStateCode(),
      adjustment_label: `${this.model.adjustment_label || 'Adjustment'}`.trim(),
      adjustment_value: this.getAdjustmentValue(),
      total: this.getTotal(),
      items,
    };

    this.isSubmitting = true;
    const invoiceRequest$ = this.isEditMode
      ? this.globalService.updateInvoice(this.getInvoiceRequestPayload(payload))
      : this.globalService.insertInvoice(this.getInvoiceRequestPayload(payload));

    invoiceRequest$.subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        this.toastrService.success(
          res?.message || (this.isEditMode ? 'Invoice updated successfully.' : 'Invoice saved successfully.'),
          this.isEditMode ? 'Updated' : 'Saved',
        );
        this.router.navigate(['/pages/sales/invoice-list']);
      },
      error: (error: any) => {
        this.isSubmitting = false;
        this.toastrService.danger(
          error?.error?.message || error?.message || 'Invoice could not be saved.',
          'Save Failed',
        );
      },
    });
  }
}
