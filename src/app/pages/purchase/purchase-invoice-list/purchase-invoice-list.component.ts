import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { Subscription } from 'rxjs';
import { GlobalService } from '../../../services/global.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'ngx-purchase-invoice-list',
  templateUrl: './purchase-invoice-list.component.html',
  styleUrls: ['./purchase-invoice-list.component.scss'],
})
export class PurchaseInvoiceListComponent implements OnInit, OnDestroy {
  private readonly purchaseInvoiceModuleId = environment.moduleIds.purchaseInvoice;

  allInvoices: any[] = [];
  searchText = '';
  loadError = '';
  loading = false;
  showInvoicePopup = false;
  selectedInvoice: any = null;
  canView = false;
  canCreate = false;
  canEdit = false;
  canDelete = false;
  deleting = false;
  pendingDeleteInvoice: any = null;
  private purchaseInvoiceCustomFields: any[] = [];

  private permissionSubscription?: Subscription;

  constructor(
    private readonly globalService: GlobalService,
    private readonly toastrService: NbToastrService,
    private readonly router: Router,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.permissionSubscription = this.globalService.menuPermissions$.subscribe(() => {
      const permissions = this.globalService.getMenuPermissions('/pages/purchase/purchase-invoice-list');
      this.canView = Number(permissions?.can_view) === 1;
      this.canCreate = Number(permissions?.can_create) === 1;
      this.canEdit = Number(permissions?.can_edit) === 1;
      this.canDelete = Number(permissions?.can_delete) === 1;
    });
    this.fetchInvoices();
    this.fetchPurchaseInvoiceCustomFields();
  }

  ngOnDestroy(): void {
    this.permissionSubscription?.unsubscribe();
  }

  get reverseChargeCount(): number {
    return this.allInvoices.filter((invoice: any) => this.isReverseCharge(invoice)).length;
  }

  get totalPayable(): number {
    return this.allInvoices.reduce(
      (total: number, invoice: any) => total + this.getInvoiceTotal(invoice),
      0,
    );
  }

  get displayedInvoices(): any[] {
    const searchValue = `${this.searchText || ''}`.trim().toLowerCase();
    if (!searchValue) {
      return this.allInvoices;
    }

    return this.allInvoices.filter((invoice: any) => [
      this.getInvoiceNumber(invoice),
      this.getVendorName(invoice),
      invoice?.order_no,
      invoice?.subject,
      invoice?.payment_term,
      invoice?.term,
      this.getInvoiceTotal(invoice),
    ].some((value: any) => `${value ?? ''}`.toLowerCase().includes(searchValue)));
  }

  fetchInvoices(): void {
    this.loading = true;
    this.loadError = '';
    this.globalService.fetchPurchaseInvoices(this.purchaseInvoiceModuleId).subscribe({
      next: (response: any) => {
        this.allInvoices = this.extractInvoices(response).map((invoice: any) =>
          this.normalizePurchaseInvoice(invoice),
        );
        this.loading = false;
        this.changeDetectorRef.detectChanges();
      },
      error: (error: any) => {
        this.loading = false;
        this.allInvoices = [];
        this.loadError = error?.error?.message || error?.message || 'Purchase invoice list could not be loaded.';
        this.toastrService.danger(this.loadError, 'Purchase Invoice List Failed');
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  onSearch(query: any = ''): void {
    this.searchText = typeof query === 'string' ? query : '';
  }

  clearSearch(): void {
    this.searchText = '';
  }

  gotoAddInvoice(): void {
    if (!this.canCreate) {
      return;
    }
    this.router.navigate(['/pages/purchase/add-purchase-invoice']);
  }

  openInvoicePopup(invoice: any): void {
    if (!this.canView) {
      return;
    }
    this.selectedInvoice = invoice;
    this.showInvoicePopup = true;
  }

  closeInvoicePopup(): void {
    this.showInvoicePopup = false;
    this.selectedInvoice = null;
  }

  editInvoice(invoice: any): void {
    if (!this.canEdit) {
      return;
    }
    this.closeInvoicePopup();
    this.router.navigate(['/pages/purchase/update-purchase-invoice'], {
      state: {
        isEditMode: true,
        purchaseInvoiceData: invoice,
      },
    });
  }

  requestDeleteInvoice(invoice: any): void {
    if (!this.canDelete) {
      return;
    }
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
      this.toastrService.danger('Purchase invoice id is missing.', 'Delete Failed');
      return;
    }

    this.deleting = true;
    this.globalService.deletePurchaseInvoice(invoiceId).subscribe({
      next: (response: any) => {
        this.allInvoices = this.allInvoices.filter((invoice: any) =>
          this.getInvoiceId(invoice) !== invoiceId,
        );
        this.pendingDeleteInvoice = null;
        this.deleting = false;
        this.toastrService.success(
          response?.message || 'Purchase invoice deleted successfully.',
          'Deleted',
        );
      },
      error: (error: any) => {
        this.deleting = false;
        this.toastrService.danger(
          error?.error?.message || error?.message || 'Purchase invoice could not be deleted.',
          'Delete Failed',
        );
      },
    });
  }

  getInvoiceId(invoice: any): string | number | null {
    return invoice?.purchase_invoice_id ?? invoice?.invoice_id ?? invoice?.id ?? null;
  }

  getInvoiceNumber(invoice: any): string {
    return `${invoice?.invoice_no ?? invoice?.invoice_number ?? invoice?.number ?? '-'}`;
  }

  getVendorName(invoice: any): string {
    const vendor = invoice?.vendor || {};
    const contactName = this.getVendorContactName(invoice);
    const invoiceContactName = `${invoice?.vendor_first_name || ''} ${invoice?.vendor_last_name || ''}`.trim();

    return invoice?.vendor_display_name
      || invoice?.vendor_company_name
      || invoice?.vendor_name
      || invoice?.display_name
      || vendor?.display_name
      || vendor?.company_name
      || invoiceContactName
      || contactName
      || '-';
  }

  getVendorContactName(invoice: any): string {
    const vendor = invoice?.vendor || {};
    return `${vendor?.first_name || vendor?.primary_contact_f_name || ''} ${
      vendor?.last_name || vendor?.primary_contact_l_name || ''
    }`.trim() || '-';
  }

  getVendorAddress(invoice: any, addressType: 'billing' | 'shipping'): string {
    const vendor = invoice?.vendor || {};
    const values = [
      vendor?.[`${addressType}_address`],
      vendor?.[`${addressType}_city`],
      vendor?.[`${addressType}_state`],
      vendor?.[`${addressType}_country`],
      vendor?.[`${addressType}_pin`],
    ]
      .map((value: any) => `${value || ''}`.trim())
      .filter(Boolean)
      .filter((value: string, index: number, addresses: string[]) =>
        addresses.findIndex((address: string) => address.toLowerCase() === value.toLowerCase()) === index,
      );
    return values.join(', ') || '-';
  }

  getStatusLabel(invoice: any): string {
    const status = invoice?.status;
    if (status === undefined || status === null || status === '') {
      return '-';
    }
    if (Number(status) === 1) {
      return 'Active';
    }
    if (Number(status) === 0) {
      return 'Inactive';
    }
    return this.toTitleCase(`${status}`);
  }

  isActive(invoice: any): boolean {
    return Number(invoice?.status) === 1;
  }

  getInvoiceTotal(invoice: any): number {
    return Number(invoice?.total ?? invoice?.grand_total ?? invoice?.amount ?? 0) || 0;
  }

  isReverseCharge(invoice: any): boolean {
    const value = invoice?.is_reverse_charge ?? invoice?.reverse_charge;
    return value === true || Number(value) === 1 || `${value || ''}`.trim().toLowerCase() === 'yes';
  }

  getInvoiceItems(invoice: any): any[] {
    const rawItems = invoice?.items ?? invoice?.purchase_invoice_items ?? invoice?.invoice_items ?? invoice?.details ?? [];
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

  getCustomFieldEntries(invoice: any): Array<{ label: string; value: string }> {
    const rawCustomFields = this.parseJsonValue(
      invoice?.custom_field ?? invoice?.custom_fields ?? invoice?.customField,
    );
    if (!rawCustomFields || typeof rawCustomFields !== 'object') {
      return [];
    }

    if (Array.isArray(rawCustomFields)) {
      return rawCustomFields.reduce(
        (fields: Array<{ label: string; value: string }>, field: any) => {
          const fieldName = `${field?.field_name ?? field?.name ?? field?.key ?? ''}`.trim();
          if (fieldName) {
            fields.push({
              label: `${field?.field_label || field?.label || this.getCustomFieldLabel(fieldName)}`,
              value: this.formatCustomFieldValue(field?.field_value ?? field?.value),
            });
          }
          return fields;
        },
        [],
      );
    }

    return Object.keys(rawCustomFields).map((fieldName: string) => ({
      label: this.getCustomFieldLabel(fieldName),
      value: this.formatCustomFieldValue(rawCustomFields[fieldName]),
    }));
  }

  getItemName(item: any): string {
    return item?.item_name || item?.item_details || item?.name || '-';
  }

  getAccountName(item: any): string {
    return item?.account_item
      || item?.account_name
      || item?.purchase_chartofaccounts_item
      || item?.account?.account_item
      || item?.account?.account_name
      || '-';
  }

  getItemAmount(item: any): number {
    const explicitAmount = item?.amount;
    return Number(explicitAmount ?? (Number(item?.quantity || 0) * Number(item?.rate || 0))) || 0;
  }

  formatTaxLabel(value: any): string {
    const label = `${value || 'Non-Taxable'}`.trim();
    if (!/^gst\s+/i.test(label) || label.includes('%')) {
      return label;
    }
    const match = label.match(/^gst\s+(\d+(?:\.\d+)?)/i);
    return match ? `GST ${Number(match[1])}%` : label;
  }

  formatPercentage(value: any): string {
    const rate = Number(value || 0);
    return `${Number.isFinite(rate) ? rate : 0}%`;
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
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }

  formatDateTime(value: any): string {
    if (!value) {
      return '-';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return `${value}`;
    }
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  trackByInvoice(index: number, invoice: any): string | number {
    return invoice?.purchase_invoice_id ?? invoice?.invoice_id ?? invoice?.id ?? index;
  }

  trackByItem(index: number, item: any): string | number {
    return item?.id ?? item?.item_id ?? index;
  }

  private fetchPurchaseInvoiceCustomFields(): void {
    this.globalService.fetchCustomFieldsByModule(this.purchaseInvoiceModuleId).subscribe({
      next: (response: any) => {
        const fields = Array.isArray(response?.data?.data)
          ? response.data.data
          : (Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []));
        this.purchaseInvoiceCustomFields = fields
          .filter((field: any) => Number(field?.status) === 1)
          .sort((first: any, second: any) =>
            Number(first?.field_order || 0) - Number(second?.field_order || 0),
          );
      },
      error: () => {
        this.purchaseInvoiceCustomFields = [];
      },
    });
  }

  private getCustomFieldLabel(fieldName: string): string {
    const configuredField = this.purchaseInvoiceCustomFields.find(
      (field: any) => `${field?.field_name || ''}`.trim() === fieldName,
    );
    return `${configuredField?.field_label || this.toTitleCase(fieldName)}`;
  }

  private formatCustomFieldValue(value: any): string {
    if (value === undefined || value === null || value === '') {
      return '-';
    }
    if (Array.isArray(value)) {
      return value.map((item: any) => this.formatCustomFieldValue(item)).join(', ') || '-';
    }
    if (typeof value === 'object') {
      const displayValue = value?.field_value ?? value?.value ?? value?.label ?? value?.name;
      if (displayValue !== undefined) {
        return this.formatCustomFieldValue(displayValue);
      }
      return Object.values(value)
        .map((item: any) => this.formatCustomFieldValue(item))
        .filter((item: string) => item !== '-')
        .join(', ') || '-';
    }
    return `${value}`.trim() || '-';
  }

  private toTitleCase(value: string): string {
    return value
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, (character: string) => character.toUpperCase());
  }

  private extractInvoices(response: any): any[] {
    const normalizedResponse = this.parseJsonValue(response);
    const candidates = [
      normalizedResponse?.data,
      normalizedResponse?.data?.data,
      normalizedResponse?.body?.data,
      normalizedResponse?.body,
      normalizedResponse?.purchase_invoices,
      normalizedResponse?.invoices,
      normalizedResponse?.result,
      normalizedResponse?.result?.data,
      normalizedResponse?.records,
      normalizedResponse?.rows,
      normalizedResponse,
    ];

    for (const candidate of candidates) {
      const normalizedCandidate = this.parseJsonValue(candidate);
      if (Array.isArray(normalizedCandidate)) {
        return normalizedCandidate;
      }
      const numericObjectRows = this.getNumericObjectRows(normalizedCandidate);
      if (numericObjectRows.length) {
        return numericObjectRows;
      }
    }
    return [];
  }

  private normalizePurchaseInvoice(invoice: any): any {
    const normalizedInvoice = this.parseJsonValue(invoice);
    if (!normalizedInvoice || typeof normalizedInvoice !== 'object') {
      return {};
    }

    return {
      ...normalizedInvoice,
      vendor: this.parseObjectValue(normalizedInvoice?.vendor),
      items: this.parseArrayValue(
        normalizedInvoice?.items
          ?? normalizedInvoice?.purchase_invoice_items
          ?? normalizedInvoice?.invoice_items,
      ),
      custom_field: this.parseObjectOrArrayValue(
        normalizedInvoice?.custom_field
          ?? normalizedInvoice?.custom_fields
          ?? normalizedInvoice?.customField,
      ),
    };
  }

  private parseObjectValue(value: any): any {
    const parsedValue = this.parseJsonValue(value);
    return parsedValue && typeof parsedValue === 'object' && !Array.isArray(parsedValue)
      ? parsedValue
      : {};
  }

  private parseArrayValue(value: any): any[] {
    const parsedValue = this.parseJsonValue(value);
    if (Array.isArray(parsedValue)) {
      return parsedValue;
    }
    return this.getNumericObjectRows(parsedValue);
  }

  private parseObjectOrArrayValue(value: any): any {
    const parsedValue = this.parseJsonValue(value);
    return parsedValue && typeof parsedValue === 'object' ? parsedValue : {};
  }

  private getNumericObjectRows(value: any): any[] {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return [];
    }
    const keys = Object.keys(value);
    return keys.length && keys.every((key: string) => /^\d+$/.test(key))
      ? Object.values(value)
      : [];
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
}
