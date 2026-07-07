import { Component, OnInit } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { GlobalService } from '../../../services/global.service';

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
  showInvoiceNumberPopup = false;
  showPaymentTermsPopup = false;
  today = this.normalizeDate(new Date());
  dueDateMin = this.today;
  customerOptions: InvoiceCustomerOption[] = [];
  itemOptions: InvoiceItemOption[] = [];
  paymentTerms: InvoicePaymentTermOption[] = [];
  taxOptions: InvoiceTaxOption[] = [
    { label: 'Non-Taxable', rate: 0, taxName: 'Non-Taxable' }
  ];

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
    additional_tax: '',
    adjustment_label: 'Adjustment',
    adjustment_value: 0
  };

  invoiceNumberPreference = {
    mode: 'auto',
    prefix: 'INV-',
    nextNumber: '00001'
  };

  itemRows: InvoiceItemRow[] = [];

  constructor(
    private toastrService: NbToastrService,
    private globalService: GlobalService
  ) {}

  ngOnInit(): void {
    this.fetchCustomers();
    this.fetchItems();
    this.fetchPaymentTerms();
    this.fetchTaxRates();
    this.applyInvoiceNumber();
    this.model.invoice_date = this.normalizeDate(new Date());
    this.model.due_date = this.normalizeDate(new Date());
    this.dueDateMin = this.model.invoice_date;
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
      return this.itemOptions.slice(0, 8);
    }

    return this.itemOptions
      .filter((item: InvoiceItemOption) => item.label.toLowerCase().includes(searchValue))
      .slice(0, 8);
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

  closeInvoiceNumberPopup(): void {
    this.showInvoiceNumberPopup = false;
  }

  saveInvoiceNumberPreference(): void {
    this.applyInvoiceNumber();
    this.closeInvoiceNumberPopup();
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
    return this.taxOptions.find((option: InvoiceTaxOption) => option.label === label)?.rate || 0;
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
      this.toastrService.danger('Add at least one invoice item.', 'Validation Failed');
      return;
    }

    const payload = {
      customer_id: this.model.customer_id,
      invoice_no: `${this.model.invoice_no || ''}`.trim(),
      order_no: `${this.model.order_no || ''}`.trim(),
      invoice_date: this.formatApiDate(this.model.invoice_date),
      term: `${this.model.term || ''}`.trim(),
      due_date: this.formatApiDate(this.model.due_date),
      salesperson: `${this.model.salesperson || ''}`.trim(),
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
    this.globalService.insertInvoice(payload).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        this.toastrService.success(res?.message || 'Invoice saved successfully.', 'Saved');
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
