import { Component, OnInit } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { Router } from '@angular/router';
import { GlobalService } from '../../../services/global.service';

interface QuoteItemRow {
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

interface QuoteCustomerOption {
  id: number;
  label: string;
  billing_address?: string;
  billing_city?: string;
  billing_country?: string;
  billing_pin?: string;
  billing_state?: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_country?: string;
  shipping_pin?: string;
  shipping_state?: string;
  state?: string;
  state_name?: string;
  gst_treatment?: string;
  gstin?: string;
  source_of_supply?: string;
}

interface QuotePaymentTermOption {
  id?: string | number;
  termName: string;
  days: string | number;
}

interface QuoteTaxOption {
  id?: string | number;
  taxName: string;
  rate: number;
  label: string;
}

interface QuoteStateOption {
  code: string;
  name: string;
  label: string;
}

interface QuoteItemOption {
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
  selector: 'ngx-add-quote',
  templateUrl: './add-quote.component.html',
  styleUrls: ['./add-quote.component.scss']
})
export class AddQuoteComponent implements OnInit {
  isSubmitting = false;
  customFieldsLoading = false;
  isEditMode = false;
  quotationId: string | number | null = null;
  isSavingQuoteNumberPreference = false;
  isLoadingQuoteNumberPreference = false;
  showQuoteNumberPopup = false;
  showPaymentTermsPopup = false;
  uploadedQuotationFiles: File[] = [];
  today = this.normalizeDate(new Date());
  dueDateMin = this.today;
  expiryDateMin = this.today;
  customerOptions: QuoteCustomerOption[] = [];
  selectedCustomer: QuoteCustomerOption | null = null;
  stateOptions: QuoteStateOption[] = [];
  itemOptions: QuoteItemOption[] = [];
  paymentTerms: QuotePaymentTermOption[] = [];
  taxOptions: QuoteTaxOption[] = [
    { label: 'Non-Taxable', rate: 0, taxName: 'Non-Taxable' }
  ];
  customFields: any[] = [];
  private readonly quotationModuleId = 52;

  model: any = {
    customer_id: '',
    quote_no: '',
    reference_no: '',
    quote_date: null,
    expiry_date: null,
    salesperson: '',
    project_name: '',
    subject: '',
    customer_notes: 'Looking forward for your business.',
    terms_and_conditions: '',
    additional_tax: '',
    adjustment_label: 'Adjustment',
    adjustment_value: 0
  };

  quoteNumberPreference = {
    mode: 'auto',
    prefix: 'QT-',
    currentNumber: '000000',
    nextNumber: '000001',
    suffix: ' ',
    incrementBy: 1,
  };

  itemRows: QuoteItemRow[] = [];

  constructor(
    private toastrService: NbToastrService,
    private globalService: GlobalService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.fetchCustomers();
    this.fetchStates();
    this.fetchItems();
    this.fetchTaxRates();
    this.fetchCustomFields();
    this.fetchQuoteNumberPreference();
    this.model.quote_date = this.normalizeDate(new Date());
    this.expiryDateMin = this.model.quote_date;
    this.configureEditMode();
    if (this.itemRows.length === 0) {
      this.addRow();
    }
  }

  private configureEditMode(): void {
    const navigationState = window.history.state || {};
    const quotation = navigationState?.quotationData;
    if (!navigationState?.isEditMode || !quotation) {
      return;
    }

    this.isEditMode = true;
    this.quotationId = quotation?.quotation_id ?? quotation?.id ?? null;
    this.model = {
      ...this.model,
      ...this.parseCustomFieldValues(quotation?.custom_field ?? quotation?.custom_fields),
      customer_id: quotation?.customer_id ?? quotation?.customer?.id ?? '',
      quote_no: quotation?.quotation_no ?? quotation?.quote_no ?? quotation?.quotation_number ?? '',
      reference_no: quotation?.ref_no ?? quotation?.reference_no ?? '',
      quote_date: this.normalizeDate(quotation?.quotation_date ?? quotation?.quote_date ?? quotation?.date ?? new Date()),
      expiry_date: quotation?.expiry_date ? this.normalizeDate(quotation.expiry_date) : null,
      salesperson: quotation?.salesperson ?? quotation?.sales_person ?? '',
      project_name: quotation?.project_name ?? quotation?.project ?? '',
      subject: quotation?.subject ?? '',
      customer_notes: quotation?.customer_notes ?? '',
      terms_and_conditions: quotation?.terms_and_conditions ?? quotation?.terms_conditions ?? '',
      adjustment_label: quotation?.adjustment_label ?? 'Adjustment',
      adjustment_value: Number(quotation?.adjustment_value ?? quotation?.adjustment ?? 0),
    };
    this.expiryDateMin = this.model.quote_date;
    this.itemRows = this.getQuotationItems(quotation).map((item: any) => ({
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

  private getQuotationItems(quotation: any): any[] {
    const rawItems = quotation?.items ?? quotation?.quotation_items ?? quotation?.quote_items ?? quotation?.details ?? [];
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

  fetchCustomFields(): void {
    this.customFieldsLoading = true;
    this.globalService.fetchCustomFieldsByModule(this.quotationModuleId).subscribe({
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
          error?.error?.message || 'Quotation custom fields could not be loaded.',
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

  fetchCustomers(): void {
    this.globalService.getCustomerListByTenant(34).subscribe({
      next: (res: any) => {
        const customers = Array.isArray(res?.data) ? res.data : [];
        this.customerOptions = customers
          .map((customer: any) => ({
            id: Number(customer?.id || 0),
            label: this.getCustomerLabel(customer),
            billing_address: `${customer?.billing_address || ''}`.trim(),
            billing_city: `${customer?.billing_city || ''}`.trim(),
            billing_country: `${customer?.billing_country || ''}`.trim(),
            billing_pin: `${customer?.billing_pin || ''}`.trim(),
            billing_state: `${customer?.billing_state || ''}`.trim(),
            shipping_address: `${customer?.shipping_address || ''}`.trim(),
            shipping_city: `${customer?.shipping_city || ''}`.trim(),
            shipping_country: `${customer?.shipping_country || ''}`.trim(),
            shipping_pin: `${customer?.shipping_pin || ''}`.trim(),
            shipping_state: `${customer?.shipping_state || ''}`.trim(),
            state: `${customer?.state || ''}`.trim(),
            state_name: `${customer?.state_name || ''}`.trim(),
            gst_treatment: `${customer?.gst_treatment || ''}`.trim(),
            gstin: `${customer?.gstin || customer?.gst_no || customer?.custom_field?.gst_no || ''}`.trim(),
            source_of_supply: `${customer?.source_of_supply || ''}`.trim()
          }))
          .filter((customer: QuoteCustomerOption) => customer.id > 0 && !!customer.label);
        if (this.model.customer_id) {
          this.onCustomerSelected(this.model.customer_id);
        }
      },
      error: () => {
        this.customerOptions = [];
      }
    });
  }

  fetchStates(): void {
    this.globalService.getStates().subscribe({
      next: (res: any) => {
        const states = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        this.stateOptions = states
          .map((state: any) => {
            const code = `${state?.code || ''}`.trim();
            const name = `${state?.name || ''}`.trim();
            return { code, name, label: code ? `[${code}] - ${name}` : name };
          })
          .filter((state: QuoteStateOption) => !!state.code && !!state.name);
      },
      error: () => {
        this.stateOptions = [];
      }
    });
  }

  onCustomerSelected(customerId: number | string): void {
    this.selectedCustomer = this.customerOptions.find(
      (customer: QuoteCustomerOption) => customer.id === Number(customerId)
    ) || null;
  }

  getCustomerAddress(type: 'billing' | 'shipping'): string[] {
    const customer = this.selectedCustomer;
    if (!customer) {
      return [];
    }

    const address = type === 'billing' ? customer.billing_address : customer.shipping_address;
    const city = type === 'billing' ? customer.billing_city : customer.shipping_city;
    const stateCode = type === 'billing' ? customer.billing_state : customer.shipping_state;
    const pin = type === 'billing' ? customer.billing_pin : customer.shipping_pin;
    const country = type === 'billing' ? customer.billing_country : customer.shipping_country;
    const state = this.getStateName(stateCode);

    return [address, city, [state, pin].filter(Boolean).join(' '), country]
      .map((line: string | undefined) => `${line || ''}`.trim())
      .filter((line: string) => !!line);
  }

  private getStateName(code: string | undefined): string {
    const normalizedCode = `${code || ''}`.trim().toUpperCase();
    return this.stateOptions.find(
      (state: QuoteStateOption) => state.code.toUpperCase() === normalizedCode
    )?.name || `${code || ''}`.trim();
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
          const defaultTerm = this.paymentTerms.find((term: QuotePaymentTermOption) => `${term.termName}`.trim().toLowerCase() === 'due on receipt');
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
            } as QuoteTaxOption;
          })
          .filter((item: QuoteTaxOption | null): item is QuoteTaxOption => !!item);

        this.taxOptions = [
          { label: 'Non-Taxable', rate: 0, taxName: 'Non-Taxable' },
          ...mappedRates.filter((option: QuoteTaxOption) => option.rate > 0)
        ];
      },
      error: (error: any) => {
        console.error('Failed to fetch tax rates:', error);
        this.taxOptions = [{ label: 'Non-Taxable', rate: 0, taxName: 'Non-Taxable' }];
      }
    });
  }

  onQuoteDateChange(date: Date): void {
    const normalizedDate = this.normalizeDate(date);
    this.model.quote_date = normalizedDate;
    this.expiryDateMin = normalizedDate;

    if (this.model.expiry_date && this.normalizeDate(this.model.expiry_date).getTime() < normalizedDate.getTime()) {
      this.model.expiry_date = null;
    }
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
          .filter((item: QuoteItemOption) => item.id > 0 && !!item.label);
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
      const match = this.taxOptions.find((option: QuoteTaxOption) => option.rate === rate);
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

  private getSelectedCustomer(): QuoteCustomerOption | undefined {
    return this.customerOptions.find(
      (customer: QuoteCustomerOption) => customer.id === Number(this.model.customer_id)
    );
  }

  private getBusinessStateCode(): string {
    const tenantDetails = this.globalService.tenantDetails
      || JSON.parse(localStorage.getItem('tenant_details') || '{}');
    const user = this.globalService.currentUser || JSON.parse(localStorage.getItem('user') || '{}');

    const candidates = [
      tenantDetails?.state,
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
    return this.normalizeStateCode(`${match || ''}`);
  }

  getCustomerStateCode(): string {
    const selectedCustomer = this.getSelectedCustomer();
    const customerState = selectedCustomer?.billing_state
      || selectedCustomer?.state
      || selectedCustomer?.state_name
      || selectedCustomer?.source_of_supply
      || '';
    return this.normalizeStateCode(customerState);
  }

  isInterState(): boolean {
    const customerState = this.getCustomerStateCode();
    const businessState = this.getBusinessStateCode();

    if (!customerState || !businessState) {
      return true;
    }

    return customerState !== businessState;
  }

  private normalizeStateCode(value: string): string {
    const normalizedValue = `${value || ''}`.trim().toUpperCase();
    if (!normalizedValue) {
      return '';
    }

    const matchedState = this.stateOptions.find((state: QuoteStateOption) =>
      state.code.toUpperCase() === normalizedValue || state.name.toUpperCase() === normalizedValue
    );
    return matchedState?.code.toUpperCase() || normalizedValue;
  }

  getItemTaxRate(row: QuoteItemRow): number {
    return this.getTaxRate(row.tax);
  }

  getRowTaxAmount(row: QuoteItemRow): number {
    return (this.getRowAmount(row) * this.getItemTaxRate(row)) / 100;
  }

  getTotalItemTaxAmount(): number {
    return this.itemRows.reduce((total: number, row: QuoteItemRow) => total + this.getRowTaxAmount(row), 0);
  }

  getTaxModeLabel(): string {
    return this.isInterState() ? 'IGST' : 'CGST + SGST';
  }

  getTaxMode(): 'IGST' | 'CGST_SGST' {
    return this.isInterState() ? 'IGST' : 'CGST_SGST';
  }

  getTaxLabel(): string {
    return this.getTaxModeLabel();
  }

  onItemSelected(row: QuoteItemRow, selectedId: string | number): void {
    const item = this.itemOptions.find((option: QuoteItemOption) => option.id === Number(selectedId));

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

  onItemInputChange(row: QuoteItemRow, value: string): void {
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

  formatRateOnBlur(row: QuoteItemRow): void {
    row.rate = this.formatDecimalValue(row.rate);
  }

  getRateNumber(value: string | number): number {
    const numericValue = Number(value || 0);
    return Number.isFinite(numericValue) ? numericValue : 0;
  }

  getRowAmount(row: QuoteItemRow): number {
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

  onItemInputFocus(row: QuoteItemRow): void {
    row.item_list_open = true;
  }

  onItemInputBlur(row: QuoteItemRow): void {
    setTimeout(() => {
      row.item_list_open = false;
      this.applyExactItemMatch(row);
    }, 150);
  }

  selectItemFromAutocomplete(row: QuoteItemRow, item: QuoteItemOption, rowIndex: number): void {
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

  getFilteredItems(query: string): QuoteItemOption[] {
    const searchValue = `${query || ''}`.trim().toLowerCase();

    if (!searchValue) {
      return this.itemOptions;
    }

    return this.itemOptions.filter(
      (item: QuoteItemOption) => item.label.toLowerCase().includes(searchValue)
    );
  }

  private applyExactItemMatch(row: QuoteItemRow): void {
    const rawValue = `${row.item_details || ''}`.trim().toLowerCase();

    if (!rawValue) {
      return;
    }

    const exactMatch = this.itemOptions.find(
      (item: QuoteItemOption) => item.label.toLowerCase() === rawValue
    );

    if (exactMatch) {
      this.selectItemFromAutocomplete(row, exactMatch, this.itemRows.indexOf(row));
      return;
    }

    this.selectManualItem(row, this.itemRows.indexOf(row));
  }

  private selectManualItem(row: QuoteItemRow, rowIndex: number): void {
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

  clearItemRow(row: QuoteItemRow): void {
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

  openQuoteNumberPopup(): void {
    this.showQuoteNumberPopup = true;
  }

  private fetchQuoteNumberPreference(): void {
    this.isLoadingQuoteNumberPreference = true;
    this.globalService.fetchDocumentNumberSettings('Quotation').subscribe({
      next: (res: any) => {
        const settings = this.extractDocumentNumberSettings(res);
        if (settings) {
          const isManualNumbering = `${settings?.type || 'A'}`.trim().toUpperCase() === 'M';
          const currentNumberText = `${settings?.current_number ?? 0}`.trim();
          const currentNumber = Number(currentNumberText.replace(/\D/g, '')) || 0;
          const incrementBy = Math.max(Number(settings?.increment_by) || 1, 1);
          const existingWidth = `${this.quoteNumberPreference.nextNumber || ''}`.replace(/\D/g, '').length;
          const responseWidth = currentNumberText.replace(/\D/g, '').length;
          const numberWidth = Math.max(existingWidth, responseWidth, 4);
          const formattedCurrentNumber = `${currentNumber}`.padStart(numberWidth, '0');
          this.quoteNumberPreference = {
            ...this.quoteNumberPreference,
            mode: isManualNumbering ? 'manual' : 'auto',
            prefix: `${settings?.prefix ?? 'QT-'}`,
            currentNumber: formattedCurrentNumber,
            nextNumber: `${currentNumber + incrementBy}`.padStart(numberWidth, '0'),
            suffix: settings?.suffix !== undefined && settings?.suffix !== null
              ? `${settings.suffix}`
              : ' ',
            incrementBy,
          };
          if (!this.isEditMode) {
            this.applyQuoteNumber();
          }
        }
        this.isLoadingQuoteNumberPreference = false;
      },
      error: (error: any) => {
        this.isLoadingQuoteNumberPreference = false;
        this.toastrService.danger(
          error?.error?.message || error?.message || 'Quotation number preferences could not be loaded.',
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

  closeQuoteNumberPopup(): void {
    this.showQuoteNumberPopup = false;
  }

  saveQuoteNumberPreference(): void {
    const prefix = `${this.quoteNumberPreference.prefix || ''}`.trim();
    const currentNumberText = `${this.quoteNumberPreference.nextNumber || ''}`.replace(/\D/g, '');
    const currentNumber = Number(currentNumberText);
    const isAutomaticNumbering = this.quoteNumberPreference.mode === 'auto';

    if (isAutomaticNumbering && (!prefix || !Number.isFinite(currentNumber) || currentNumber < 0)) {
      this.toastrService.danger('Enter a valid prefix and next number.', 'Quotation Number');
      return;
    }

    const payload = {
      document_type: 'Quotation',
      type: (isAutomaticNumbering ? 'A' : 'M') as 'A' | 'M',
      prefix,
      current_number: this.quoteNumberPreference.currentNumber,
      suffix: this.quoteNumberPreference.suffix,
      increment_by: Number(this.quoteNumberPreference.incrementBy) || 1,
    };

    this.isSavingQuoteNumberPreference = true;
    this.globalService.saveDocumentNumberSettings(payload).subscribe({
      next: (res: any) => {
        this.isSavingQuoteNumberPreference = false;
        this.applyQuoteNumber();
        this.closeQuoteNumberPopup();
        this.toastrService.success(
          res?.message || 'Quotation number preferences saved successfully.',
          'Saved',
        );
      },
      error: (error: any) => {
        this.isSavingQuoteNumberPreference = false;
        this.toastrService.danger(
          error?.error?.message || error?.message || 'Quotation number preferences could not be saved.',
          'Save Failed',
        );
      },
    });
  }

  closePaymentTermsPopup(): void {
    this.showPaymentTermsPopup = false;
  }

  onPaymentTermsChanged(terms: QuotePaymentTermOption[]): void {
    this.paymentTerms = terms;
    this.updateDueDateFromPaymentTerm();
  }

  onPaymentTermSelected(termName: string): void {
    this.model.term = termName;
    this.updateDueDateFromPaymentTerm(termName);
    this.closePaymentTermsPopup();
  }

  generateQuoteNumber(): string {
    return `${this.quoteNumberPreference.prefix}${this.quoteNumberPreference.nextNumber}`;
  }

  private applyQuoteNumber(): void {
    if (this.quoteNumberPreference.mode === 'auto') {
      this.model.quote_no = this.generateQuoteNumber();
    } else if (!this.isEditMode) {
      this.model.quote_no = '';
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
    this.itemRows = this.itemRows.filter((_: QuoteItemRow, rowIndex: number) => rowIndex !== index);
  }

  trackByIndex(index: number): number {
    return index;
  }

  getSubTotal(): number {
    return this.itemRows.reduce((total: number, row: QuoteItemRow) => total + this.getRowAmount(row), 0);
  }

  getTaxRate(label: string): number {
    const normalizedLabel = this.getTaxDisplayLabel(label).toLowerCase();
    return this.taxOptions.find((option: QuoteTaxOption) =>
      this.getTaxDisplayLabel(option.label).toLowerCase() === normalizedLabel
    )?.rate || 0;
  }

  getTaxAmount(): number {
    return this.roundCurrency(this.getTotalItemTaxAmount());
  }

  getIGST(): number {
    return this.isInterState() ? this.getTaxAmount() : 0;
  }

  getCGST(): number {
    return this.isInterState() ? 0 : this.roundCurrency(this.getTaxAmount() / 2);
  }

  getSGST(): number {
    return this.isInterState() ? 0 : this.roundCurrency(this.getTaxAmount() - this.getCGST());
  }

  private roundCurrency(value: number): number {
    return Number((Number(value) || 0).toFixed(2));
  }

  getAdjustmentValue(): number {
    return Number(this.model.adjustment_value || 0);
  }

  getTotal(): number {
    return this.roundCurrency(this.getSubTotal() + this.getTaxAmount() + this.getAdjustmentValue());
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
    const quoteDate = this.normalizeDate(this.model.quote_date || new Date());

    if (!normalizedTerm) {
      this.dueDateMin = quoteDate;
      return;
    }

    if (normalizedTerm === 'due on receipt') {
      this.model.due_date = quoteDate;
      this.dueDateMin = quoteDate;
      return;
    }

    const dueDays = this.getPaymentTermDays(termName);
    if (dueDays === null) {
      this.dueDateMin = quoteDate;
      return;
    }

    const dueDate = new Date(quoteDate);
    dueDate.setDate(dueDate.getDate() + dueDays);
    this.model.due_date = dueDate;
    this.dueDateMin = dueDate;
  }

  private getPaymentTermDays(termName: string): number | null {
    const normalizedTerm = `${termName || ''}`.trim().toLowerCase();
    if (!normalizedTerm) {
      return null;
    }

    const matchedTerm = this.paymentTerms.find((term: QuotePaymentTermOption) =>
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
      .filter((row: QuoteItemRow) => `${row.item_details || ''}`.trim())
      .map((row: QuoteItemRow) => ({
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

  onQuotationFilesChange(files: File[]): void {
    this.uploadedQuotationFiles = files;
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

  private getQuotationRequestPayload(payload: any): FormData {
    const formData = new FormData();
    Object.keys(payload).forEach((key: string) => {
      this.appendFormDataValue(formData, key, payload[key]);
    });

    const quotationAttachment = this.uploadedQuotationFiles[0];
    if (quotationAttachment) {
      formData.append(
        'quotation_attachment',
        quotationAttachment,
        quotationAttachment.name,
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
      this.toastrService.danger('Add at least one quote item.', 'Validation Failed');
      return;
    }

    const customFieldData = this.customFields.reduce((values: any, field: any) => {
      const fieldName = `${field?.field_name || ''}`.trim();
      if (fieldName) {
        values[fieldName] = this.model?.[fieldName] ?? '';
      }
      return values;
    }, {});
    const additionalTax = this.getTaxLabel();

    const payload = {
      ...(this.isEditMode && this.quotationId ? { quotation_id: this.quotationId } : {}),
      ...(!this.isEditMode && this.quoteNumberPreference.mode === 'auto' ? {
        document_type: 'Quotation',
        current_number: `${this.quoteNumberPreference.nextNumber || ''}`,
      } : {}),
      module_id: this.quotationModuleId,
      ...(Object.keys(customFieldData).length ? { custom_field: customFieldData } : {}),
      customer_id: this.model.customer_id,
      quotation_no: `${this.model.quote_no || ''}`.trim(),
      ref_no: `${this.model.reference_no || ''}`.trim(),
      quotation_date: this.formatApiDate(this.model.quote_date),
      expiry_date: this.formatApiDate(this.model.expiry_date),
      salesperson: `${this.model.salesperson || ''}`.trim(),
      project_name: `${this.model.project_name || ''}`.trim(),
      subject: `${this.model.subject || ''}`.trim(),
      customer_notes: `${this.model.customer_notes || ''}`.trim(),
      terms_and_conditions: `${this.model.terms_and_conditions || ''}`.trim(),
      additional_tax: additionalTax,
      additional_tax_rate: 0,
      sub_total: this.getSubTotal(),
      tax_amount: this.getTaxAmount(),
      cgst_amount: this.getCGST(),
      sgst_amount: this.getSGST(),
      igst_amount: this.getIGST(),
      tax_mode: additionalTax,
      customer_state: this.getCustomerStateCode(),
      business_state: this.getBusinessStateCode(),
      adjustment_label: `${this.model.adjustment_label || 'Adjustment'}`.trim(),
      adjustment_value: this.getAdjustmentValue(),
      total: this.getTotal(),
      items,
    };

    this.isSubmitting = true;
    const quotationRequest$ = this.isEditMode
      ? this.globalService.updateQuotation(this.getQuotationRequestPayload(payload))
      : this.globalService.insertQuote(this.getQuotationRequestPayload(payload));

    quotationRequest$.subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        this.toastrService.success(
          res?.message || (this.isEditMode ? 'Quotation updated successfully.' : 'Quotation saved successfully.'),
          this.isEditMode ? 'Updated' : 'Saved',
        );
        this.router.navigate(['/pages/sales/quotation-list']);
      },
      error: (error: any) => {
        this.isSubmitting = false;
        this.toastrService.danger(
          error?.error?.message || error?.message || 'Quote could not be saved.',
          'Save Failed',
        );
      },
    });
  }
}
