import { Component, OnInit } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
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
  showQuoteNumberPopup = false;
  showPaymentTermsPopup = false;
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

  model: any = {
    customer_id: '',
    quote_no: '',
    reference_no: '',
    quote_date: null,
    expiry_date: null,
    salesperson: '',
    project_name: '',
    place_of_supply: '',
    subject: '',
    customer_notes: 'Looking forward for your business.',
    additional_tax: '',
    adjustment_label: 'Adjustment',
    adjustment_value: 0
  };

  quoteNumberPreference = {
    mode: 'auto',
    prefix: 'QT-',
    nextNumber: '000001'
  };

  itemRows: QuoteItemRow[] = [];

  constructor(
    private toastrService: NbToastrService,
    private globalService: GlobalService
  ) {}

  ngOnInit(): void {
    this.fetchCustomers();
    this.fetchStates();
    this.fetchItems();
    this.fetchTaxRates();
    this.applyQuoteNumber();
    this.model.quote_date = this.normalizeDate(new Date());
    this.expiryDateMin = this.model.quote_date;
    this.addRow();
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

    this.model.place_of_supply = this.selectedCustomer?.source_of_supply
      || this.selectedCustomer?.billing_state
      || this.selectedCustomer?.state
      || '';
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

  closeQuoteNumberPopup(): void {
    this.showQuoteNumberPopup = false;
  }

  saveQuoteNumberPreference(): void {
    this.applyQuoteNumber();
    this.closeQuoteNumberPopup();
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
    return this.taxOptions.find((option: QuoteTaxOption) => option.label === label)?.rate || 0;
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
        tax: row.tax || '',
        unit: `${row.item_unit || ''}`.trim(),
        amount: this.getRowAmount(row),
        is_manual: !!row.item_is_manual,
      }));
  }

  onSubmit(form: any): void {
    if (!form.valid) {
      return;
    }

    const items = this.getSubmitRows();

    if (items.length === 0) {
      this.toastrService.danger('Add at least one quote item.', 'Validation Failed');
      return;
    }

    const payload = {
      customer_id: this.model.customer_id,
      quote_no: `${this.model.quote_no || ''}`.trim(),
      reference_no: `${this.model.reference_no || ''}`.trim(),
      quote_date: this.formatApiDate(this.model.quote_date),
      expiry_date: this.formatApiDate(this.model.expiry_date),
      salesperson: `${this.model.salesperson || ''}`.trim(),
      project_name: `${this.model.project_name || ''}`.trim(),
      place_of_supply: `${this.model.place_of_supply || ''}`.trim(),
      subject: `${this.model.subject || ''}`.trim(),
      customer_notes: `${this.model.customer_notes || ''}`.trim(),
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
    this.globalService.insertQuote(payload).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        this.toastrService.success(res?.message || 'Quote saved successfully.', 'Saved');
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
