import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { environment } from '../../../../environments/environment';
import { GlobalService } from '../../../services/global.service';
import { AddInvoiceComponent } from '../../sales/add-invoice/add-invoice.component';

interface PurchaseAccountOption {
  id: number;
  account_item: string;
  account_name: string;
}

@Component({
  selector: 'ngx-add-purchase-invoice',
  templateUrl: './add-purchase-invoice.component.html',
  styleUrls: ['./add-purchase-invoice.component.scss'],
})
export class AddPurchaseInvoiceComponent extends AddInvoiceComponent implements OnInit {
  private readonly purchaseInvoiceModuleId = environment.moduleIds.purchaseInvoice;
  private readonly vendorModuleId = environment.moduleIds.vendor;
  private readonly itemModuleId = environment.moduleIds.item;

  accountOptions: PurchaseAccountOption[] = [];
  pageTitle = 'Add Purchase Invoice';
  submitButtonLabel = 'Save Purchase Invoice';

  constructor(
    toastrService: NbToastrService,
    private readonly purchaseInvoiceService: GlobalService,
    private readonly purchaseInvoiceRouter: Router,
  ) {
    super(toastrService, purchaseInvoiceService, purchaseInvoiceRouter);
    this.purchaseInvoiceToastr = toastrService;
  }

  private readonly purchaseInvoiceToastr: NbToastrService;

  override ngOnInit(): void {
    const currentDate = this.normalizePurchaseDate(new Date());

    this.isEditMode = false;
    this.customFields = [];
    this.model = this.getEmptyPurchaseInvoiceModel(currentDate);
    this.today = currentDate;
    this.dueDateMin = currentDate;
    this.itemRows = [];
    this.configurePurchaseInvoiceEditMode();

    this.fetchCustomers();
    this.fetchStates();
    this.fetchItems();
    this.fetchPaymentTerms();
    this.fetchTaxRates();
    this.fetchCustomFields();
    this.fetchAccounts();
    if (!this.itemRows.length) {
      this.addRow();
    }
  }

  private configurePurchaseInvoiceEditMode(): void {
    const navigationState = history.state || {};
    const invoice = navigationState?.purchaseInvoiceData;
    if (!navigationState?.isEditMode || !invoice) {
      return;
    }

    this.isEditMode = true;
    this.invoiceId = invoice?.purchase_invoice_id ?? invoice?.invoice_id ?? invoice?.id ?? null;
    this.pageTitle = 'Update Purchase Invoice';
    this.submitButtonLabel = 'Update Purchase Invoice';
    this.model = {
      ...this.model,
      ...this.parsePurchaseInvoiceCustomFieldValues(
        invoice?.custom_field ?? invoice?.custom_fields ?? invoice?.customField,
      ),
      customer_id: invoice?.vendor_id ?? invoice?.vendor?.id ?? '',
      invoice_no: invoice?.invoice_no ?? invoice?.invoice_number ?? '',
      invoice_date: this.normalizePurchaseDate(invoice?.invoice_date ?? invoice?.date ?? new Date()),
      due_date: this.normalizePurchaseDate(invoice?.due_date ?? invoice?.invoice_date ?? new Date()),
      term: invoice?.payment_term ?? invoice?.term ?? 'Due on Receipt',
      order_no: invoice?.order_no ?? '',
      reverse_charge: this.normalizeBooleanValue(invoice?.is_reverse_charge ?? invoice?.reverse_charge),
      subject: invoice?.subject ?? '',
      customer_notes: invoice?.vendor_notes ?? invoice?.customer_notes ?? '',
      terms_and_conditions: invoice?.terms_and_conditions ?? invoice?.terms_conditions ?? '',
      adjustment_label: invoice?.adjustment_label ?? 'Adjustment',
      adjustment_value: Number(invoice?.adjustment_value ?? invoice?.adjustment ?? 0),
    };
    this.dueDateMin = this.model.invoice_date;

    this.itemRows = this.parsePurchaseInvoiceItems(invoice).map((item: any) => ({
      item_id: item?.item_id ?? '',
      item_details: item?.item_name ?? item?.item_details ?? item?.name ?? '',
      item_description: item?.item_description ?? item?.description ?? '',
      hsn_sac: item?.hsn_sac ?? item?.hsn_code ?? item?.sac ?? '',
      account_id: item?.account_id ?? item?.account?.id ?? '',
      account_name: item?.account_item
        ?? item?.account_name
        ?? item?.purchase_chartofaccounts_item
        ?? item?.account?.account_item
        ?? item?.account?.account_name
        ?? '',
      quantity: Number(item?.quantity ?? 1),
      rate: `${item?.rate ?? item?.cost_price ?? 0}`,
      tax: this.normalizePurchaseItemTax(item?.tax ?? item?.tax_name),
      tax_rate: this.getPurchaseTaxRateFromValue(item?.tax ?? item?.tax_name),
      item_unit: item?.unit ?? item?.item_unit ?? '',
      item_type: item?.item_type ?? item?.type ?? '',
      item_list_open: false,
      item_is_manual: this.normalizeBooleanValue(item?.is_manual),
    }));
  }

  private parsePurchaseInvoiceItems(invoice: any): any[] {
    const items = invoice?.items
      ?? invoice?.purchase_invoice_items
      ?? invoice?.invoice_items
      ?? invoice?.details
      ?? [];
    if (Array.isArray(items)) {
      return items;
    }
    if (typeof items === 'string') {
      try {
        const parsedItems = JSON.parse(items);
        return Array.isArray(parsedItems) ? parsedItems : [];
      } catch {
        return [];
      }
    }
    return [];
  }

  private parsePurchaseInvoiceCustomFieldValues(value: any): Record<string, any> {
    if (!value) {
      return {};
    }
    if (typeof value === 'string') {
      try {
        return this.parsePurchaseInvoiceCustomFieldValues(JSON.parse(value));
      } catch {
        return {};
      }
    }
    if (Array.isArray(value)) {
      return value.reduce((values: Record<string, any>, field: any) => {
        const fieldName = field?.field_name ?? field?.name ?? field?.key;
        if (fieldName) {
          values[fieldName] = field?.field_value ?? field?.value ?? '';
        }
        return values;
      }, {});
    }
    return typeof value === 'object' ? { ...value } : {};
  }

  private normalizeBooleanValue(value: any): boolean {
    return value === true
      || Number(value) === 1
      || `${value || ''}`.trim().toLowerCase() === 'yes'
      || `${value || ''}`.trim().toLowerCase() === 'true';
  }

  private normalizePurchaseItemTax(value: any): string {
    const taxLabel = `${value || 'Non-Taxable'}`.trim();
    if (!/^gst\s+/i.test(taxLabel) || taxLabel.includes('%')) {
      return taxLabel;
    }
    const rateMatch = taxLabel.match(/^gst\s+(\d+(?:\.\d+)?)/i);
    return rateMatch ? `GST ${Number(rateMatch[1])}%` : taxLabel;
  }

  override fetchCustomFields(): void {
    this.customFieldsLoading = true;
    this.purchaseInvoiceService.fetchCustomFieldsByModule(this.purchaseInvoiceModuleId).subscribe({
      next: (response: any) => {
        this.customFields = this.extractRows(response)
          .filter((field: any) => Number(field?.show_in_form) === 1 && Number(field?.status) === 1)
          .sort((first: any, second: any) =>
            Number(first?.field_order || 0) - Number(second?.field_order || 0),
          );
        this.applyPurchaseInvoiceCustomFieldDefaults();
        this.customFieldsLoading = false;
      },
      error: (error: any) => {
        this.customFields = [];
        this.customFieldsLoading = false;
        this.purchaseInvoiceToastr.danger(
          error?.error?.message || 'Purchase invoice custom fields could not be loaded.',
          'Custom Fields',
        );
      },
    });
  }

  override fetchCustomers(): void {
    this.purchaseInvoiceService.getVendorListByTenant(this.vendorModuleId).subscribe({
      next: (res: any) => {
        const vendors = this.extractRows(res);
        this.customerOptions = vendors
          .map((vendor: any) => ({
            id: Number(vendor?.id || 0),
            label: this.getVendorLabel(vendor),
            billing_state: `${vendor?.billing_state || ''}`.trim(),
            state: `${vendor?.state || ''}`.trim(),
            state_name: `${vendor?.state_name || ''}`.trim(),
          }))
          .filter((vendor: any) => vendor.id > 0 && !!vendor.label) as any;
      },
      error: () => {
        this.customerOptions = [];
      },
    });
  }

  override fetchItems(): void {
    this.purchaseInvoiceService.fetchItems(this.itemModuleId).subscribe({
      next: (res: any) => {
        this.itemOptions = this.extractRows(res)
          .map((item: any) => ({
            id: Number(item?.id || 0),
            label: `${item?.name || ''}`.trim(),
            name: item?.name || '',
            type: item?.type || '',
            selling_price: item?.cost_price ?? 0,
            cost_price: item?.cost_price,
            hsn_code: item?.hsn_code,
            sac: item?.sac,
            unit: item?.unit,
            tax_preference: item?.tax_preference,
            tax_rate_name: item?.tax_rate_name,
            tax_rate_percentage: item?.tax_rate_percentage,
            purchase_account_id: item?.purchase_account_id ?? item?.purchase_account,
            purchase_chartofaccounts_item: item?.purchase_chartofaccounts_item,
            purchase_account_description: item?.purchase_account_description,
            description: item?.description,
            item_description: item?.item_description,
          }))
          .filter((item: any) => item.id > 0 && !!item.label) as any;
        this.restoreEditItemAccounts();
      },
      error: () => {
        this.itemOptions = [];
      },
    });
  }

  override fetchTaxRates(): void {
    this.purchaseInvoiceService.getTaxRates().subscribe({
      next: (response: any) => {
        const taxRates = this.extractRows(response)
          .map((tax: any) => {
            const taxName = `${tax?.tax_rate_name || ''}`.trim();
            const rate = Number(tax?.tax_rate_percentage || 0);
            if (!taxName && !rate) {
              return null;
            }
            return {
              id: tax?.id,
              taxName,
              rate,
              label: this.getPurchaseTaxOptionLabel(taxName, rate),
            };
          })
          .filter((tax: any) => !!tax && tax.rate > 0);

        this.taxOptions = [
          { label: 'Non-Taxable', rate: 0, taxName: 'Non-Taxable' },
          ...taxRates,
        ];
        this.restoreEditItemTaxes();
      },
      error: () => {
        this.taxOptions = [{ label: 'Non-Taxable', rate: 0, taxName: 'Non-Taxable' }];
        this.restoreEditItemTaxes();
      },
    });
  }

  fetchAccounts(): void {
    this.purchaseInvoiceService.getAccountItem().subscribe({
      next: (res: any) => {
        this.accountOptions = this.extractRows(res)
          .map((account: any) => ({
            id: Number(account?.id || 0),
            account_item: `${account?.account_item || ''}`.trim(),
            account_name: `${account?.account_name || ''}`.trim(),
          }))
          .filter((account: PurchaseAccountOption) => account.id > 0 && !!account.account_item);
        this.restoreEditItemAccounts();
      },
      error: () => {
        this.accountOptions = [];
      },
    });
  }

  override addRow(): void {
    super.addRow();
    const newRow = this.itemRows[this.itemRows.length - 1];
    if (newRow) {
      newRow.account_id = '';
      (newRow as any).tax_rate = 0;
    }
  }

  override clearItemRow(row: any): void {
    super.clearItemRow(row);
    row.account_id = '';
    row.tax_rate = 0;
  }

  override onItemSelected(row: any, selectedId: string | number): void {
    super.onItemSelected(row, selectedId);
    row.account_id = this.getItemAccountId(selectedId);
    this.syncRowTaxRate(row);
  }

  override selectItemFromAutocomplete(row: any, item: any, rowIndex: number): void {
    super.selectItemFromAutocomplete(row, item, rowIndex);
    row.account_id = this.getItemAccountId(item?.id);
    this.syncRowTaxRate(row);
  }

  onRowTaxRateChange(row: any, selectedRate: any): void {
    const normalizedRate = Number(selectedRate || 0);
    const selectedTax = this.taxOptions.find((tax: any) => Number(tax?.rate || 0) === normalizedRate);
    row.tax_rate = normalizedRate;
    row.tax = selectedTax?.label || 'Non-Taxable';
  }

  override onSubmit(form: any): void {
    if (this.hasRequiredPurchaseInvoiceCustomFieldError()) {
      this.purchaseInvoiceToastr.danger(
        'Complete all required custom fields.',
        'Validation Failed',
      );
      return;
    }

    if (!form.valid) {
      return;
    }

    const items = this.itemRows
      .filter((row: any) => `${row.item_details || ''}`.trim())
      .map((row: any) => ({
        item_id: row.item_is_manual ? null : row.item_id,
        item_name: `${row.item_details || ''}`.trim(),
        item_description: `${row.item_description || ''}`.trim(),
        item_type: `${row.item_type || 'Service'}`.trim(),
        hsn_sac: `${row.hsn_sac || ''}`.trim(),
        account_id: Number(row.account_id || 0),
        quantity: Number(row.quantity || 0),
        rate: this.getRateNumber(row.rate),
        tax: this.getTaxDisplayLabel(row.tax),
        unit: `${row.item_unit || ''}`.trim(),
        amount: this.getRowAmount(row),
        is_manual: !!row.item_is_manual,
      }));

    if (!items.length) {
      this.purchaseInvoiceToastr.danger('Add at least one purchase invoice item.', 'Validation Failed');
      return;
    }

    if (items.some((item: any) => !item.account_id)) {
      this.purchaseInvoiceToastr.danger('Select an account for every invoice item.', 'Validation Failed');
      return;
    }

    const reverseCharge = this.model.reverse_charge ? 1 : 0;
    const taxMode = this.getTaxLabel();
    const customFieldData = this.customFields.reduce((values: any, field: any) => {
      const fieldName = `${field?.field_name || ''}`.trim();
      if (fieldName) {
        values[fieldName] = this.model?.[fieldName] ?? '';
      }
      return values;
    }, {});
    const payload = {
      ...(this.isEditMode && this.invoiceId ? { purchase_invoice_id: this.invoiceId } : {}),
      module_id: this.purchaseInvoiceModuleId,
      ...(Object.keys(customFieldData).length ? { custom_field: customFieldData } : {}),
      vendor_id: this.model.customer_id,
      invoice_no: `${this.model.invoice_no || ''}`.trim(),
      invoice_date: this.formatPurchaseDate(this.model.invoice_date),
      due_date: this.formatPurchaseDate(this.model.due_date),
      payment_term: `${this.model.term || ''}`.trim(),
      term: `${this.model.term || ''}`.trim(),
      order_no: `${this.model.order_no || ''}`.trim(),
      reverse_charge: reverseCharge,
      is_reverse_charge: reverseCharge,
      subject: `${this.model.subject || ''}`.trim(),
      vendor_notes: `${this.model.customer_notes || ''}`.trim(),
      terms_and_conditions: `${this.model.terms_and_conditions || ''}`.trim(),
      additional_tax: taxMode,
      additional_tax_rate: 0,
      sub_total: this.getSubTotal(),
      tax_amount: this.getTaxAmount(),
      cgst_amount: this.getCGST(),
      sgst_amount: this.getSGST(),
      igst_amount: this.getIGST(),
      tax_mode: taxMode,
      vendor_state: this.getCustomerStateCode(),
      adjustment_label: `${this.model.adjustment_label || 'Adjustment'}`.trim(),
      adjustment_value: this.getAdjustmentValue(),
      total: this.getTotal(),
      items,
    };

    const requestData = this.getPurchaseInvoiceRequestData(payload);
    this.isSubmitting = true;
    const purchaseInvoiceRequest$ = this.isEditMode
      ? this.purchaseInvoiceService.updatePurchaseInvoice(requestData)
      : this.purchaseInvoiceService.createPurchaseInvoice(requestData);
    purchaseInvoiceRequest$.subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        this.purchaseInvoiceToastr.success(
          res?.message || `Purchase invoice ${this.isEditMode ? 'updated' : 'saved'} successfully.`,
          this.isEditMode ? 'Updated' : 'Saved',
        );
        this.purchaseInvoiceRouter.navigate(['/pages/purchase/purchase-invoice-list']);
      },
      error: (error: any) => {
        this.isSubmitting = false;
        this.purchaseInvoiceToastr.danger(
          error?.error?.message
            || error?.message
            || `Purchase invoice could not be ${this.isEditMode ? 'updated' : 'saved'}.`,
          this.isEditMode ? 'Update Failed' : 'Save Failed',
        );
      },
    });
  }

  private getEmptyPurchaseInvoiceModel(date: Date): any {
    return {
      customer_id: '',
      invoice_no: '',
      invoice_date: date,
      due_date: date,
      term: 'Due on Receipt',
      order_no: '',
      reverse_charge: false,
      subject: '',
      customer_notes: 'Looking forward for your business.',
      terms_and_conditions: '',
      adjustment_label: 'Adjustment',
      adjustment_value: 0,
    };
  }

  private applyPurchaseInvoiceCustomFieldDefaults(): void {
    this.customFields.forEach((field: any) => {
      const fieldName = `${field?.field_name || ''}`.trim();
      if (!fieldName) {
        return;
      }

      const hasValue = this.model[fieldName] !== undefined && this.model[fieldName] !== null;
      if (this.getFieldType(field) === 'checkbox') {
        this.model[fieldName] = this.parsePurchaseInvoiceCheckboxValues(
          hasValue ? this.model[fieldName] : field?.default_value,
        );
      } else if (!hasValue) {
        this.model[fieldName] = field?.default_value ?? '';
      }
    });
  }

  private parsePurchaseInvoiceCheckboxValues(value: any): string[] {
    if (value === undefined || value === null || value === '') {
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
        // Non-JSON values can still be stored as comma, pipe, or line separated options.
      }
      return normalizedValue.split(/[\n,|]/).map((item: string) => item.trim()).filter(Boolean);
    }
    return [`${value}`.trim()].filter(Boolean);
  }

  private hasRequiredPurchaseInvoiceCustomFieldError(): boolean {
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

  private getVendorLabel(vendor: any): string {
    const fullName = `${vendor?.primary_contact_f_name || ''} ${vendor?.primary_contact_l_name || ''}`.trim();
    return `${vendor?.display_name || vendor?.company_name || fullName || vendor?.name || ''}`.trim();
  }

  private getItemAccountId(itemId: string | number): string | number {
    const item: any = (this.itemOptions as any[]).find((option: any) => option.id === Number(itemId));
    const directAccountId = Number(item?.purchase_account_id || 0);
    if (directAccountId > 0) {
      return directAccountId;
    }

    const itemAccountName = `${item?.purchase_chartofaccounts_item || ''}`.trim().toLowerCase();
    return this.accountOptions.find(
      (account: PurchaseAccountOption) => account.account_item.toLowerCase() === itemAccountName,
    )?.id || '';
  }

  private restoreEditItemAccounts(): void {
    if (!this.isEditMode) {
      return;
    }

    this.itemRows.forEach((row: any) => {
      if (Number(row?.account_id || 0) > 0) {
        return;
      }

      const itemAccountId = this.getItemAccountId(row?.item_id);
      if (Number(itemAccountId || 0) > 0) {
        row.account_id = itemAccountId;
        return;
      }

      const accountName = `${row?.account_name || ''}`.trim().toLowerCase();
      if (accountName) {
        row.account_id = this.accountOptions.find((account: PurchaseAccountOption) =>
          account.account_item.toLowerCase() === accountName
            || account.account_name.toLowerCase() === accountName,
        )?.id || '';
      }
    });
  }

  private restoreEditItemTaxes(): void {
    if (!this.isEditMode) {
      return;
    }

    const restoredTaxOptions = [...this.taxOptions];
    this.itemRows = this.itemRows.map((row: any) => {
      const currentTax = `${row?.tax || 'Non-Taxable'}`.trim();
      if (!currentTax || /non[\s-]?tax/i.test(currentTax)) {
        return {
          ...row,
          tax: 'Non-Taxable',
          tax_rate: 0,
        };
      }

      const rateMatch = currentTax.match(/(\d+(?:\.\d+)?)\s*%?/);
      const rate = rateMatch ? Number(rateMatch[1]) : 0;
      let matchedTax = restoredTaxOptions.find((tax: any) => Number(tax?.rate || 0) === rate);
      if (!matchedTax && rate > 0) {
        matchedTax = {
          label: this.normalizePurchaseItemTax(currentTax),
          rate,
          taxName: currentTax,
        };
        restoredTaxOptions.push(matchedTax);
      }
      return {
        ...row,
        tax_rate: Number(matchedTax?.rate ?? rate),
        tax: matchedTax?.label || currentTax,
      };
    });
    this.taxOptions = restoredTaxOptions;
  }

  private syncRowTaxRate(row: any): void {
    const rate = this.getTaxRate(row?.tax);
    row.tax_rate = rate || this.getPurchaseTaxRateFromValue(row?.tax);
    this.onRowTaxRateChange(row, row.tax_rate);
  }

  private getPurchaseTaxRateFromValue(value: any): number {
    const rateMatch = `${value || ''}`.match(/(\d+(?:\.\d+)?)\s*%?/);
    return rateMatch ? Number(rateMatch[1]) : 0;
  }

  private getPurchaseTaxOptionLabel(taxName: string, rate: number): string {
    const nameWithoutRate = `${taxName || ''}`
      .trim()
      .replace(/\s*[\[(]?\s*\d+(?:\.\d+)?\s*%?\s*[\])]?\s*$/, '')
      .trim();
    return `${nameWithoutRate || 'GST'} ${Number(rate || 0)}%`;
  }

  private extractRows(response: any): any[] {
    if (Array.isArray(response?.data?.data)) {
      return response.data.data;
    }
    if (Array.isArray(response?.data)) {
      return response.data;
    }
    return Array.isArray(response) ? response : [];
  }

  private normalizePurchaseDate(value: Date | string | null | undefined): Date {
    const sourceDate = value instanceof Date ? value : new Date(value || new Date());
    return new Date(sourceDate.getFullYear(), sourceDate.getMonth(), sourceDate.getDate());
  }

  private formatPurchaseDate(value: Date | string | null | undefined): string {
    if (!value) {
      return '';
    }
    const date = this.normalizePurchaseDate(value);
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }

  private getPurchaseInvoiceRequestData(payload: any): FormData {
    const formData = new FormData();
    Object.keys(payload).forEach((key: string) => {
      const value = payload[key];
      formData.append(key, typeof value === 'object' ? JSON.stringify(value) : `${value ?? ''}`);
    });

    const attachment = this.uploadedInvoiceFiles[0];
    if (attachment) {
      formData.append('invoice_attachment', attachment, attachment.name);
    }
    return formData;
  }

}
