import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalService } from '../../../services/global.service';

@Component({
  selector: 'ngx-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.scss']
})
export class ItemListComponent implements OnInit {
  loading = false;
  searchText = '';
  allItems: any[] = [];
  apiData: any[] = [];
  showItemPopup = false;
  selectedItem: any = null;

  constructor(
    private globalService: GlobalService,
    private router: Router,
  ) {}

  get goodsCount(): number {
    return this.allItems.filter((item: any) => this.isGoodsItem(item)).length;
  }

  get servicesCount(): number {
    return this.allItems.filter((item: any) => this.isServiceItem(item)).length;
  }

  ngOnInit(): void {
    this.fetchItems();
  }

  fetchItems(): void {
    this.loading = true;

    this.globalService.fetchItems().subscribe({
      next: (res: any) => {
        console.log('fetch-items response', res);

        this.allItems = res?.data || res || [];
        this.apiData = [...this.allItems];
        this.onSearch(this.searchText);
        this.loading = false;
      },
      error: (err: any) => {
        console.error('fetch-items error', err);
        this.loading = false;
      }
    });
  }

  onSearch(query: string): void {
    this.searchText = query || '';
    const searchValue = this.searchText.trim().toLowerCase();

    if (!searchValue) {
      this.apiData = [...this.allItems];
      return;
    }

    this.apiData = this.allItems.filter((item: any) => {
      return Object.keys(item || {}).some((key: string) => {
        const value = item?.[key];
        return String(value ?? '').toLowerCase().includes(searchValue);
      });
    });
  }

  clearSearch(): void {
    this.onSearch('');
  }

  gotoAddItemPage(): void {
    this.router.navigate(['/pages/sales/add-item']);
  }

  getItemName(item: any): string {
    return item?.name || '-';
  }

  getItemType(item: any): string {
    return this.formatValue(item?.type || item?.item_type || 'Item');
  }

  isServiceItem(item: any): boolean {
    return `${item?.type || item?.item_type || ''}`.trim().toLowerCase().includes('service');
  }

  isGoodsItem(item: any): boolean {
    const type = `${item?.type || item?.item_type || ''}`.trim().toLowerCase();
    return type.includes('good') || type.includes('product');
  }

  getPurchaseRate(item: any): string {
    return this.formatValue(item?.cost_price);
  }

  getRate(item: any): string {
    return this.formatValue(item?.selling_price);
  }

  getHsnSac(item: any): string {
    return this.formatValue(item?.hsn_code || item?.sac);
  }

  getUnit(item: any): string {
    return this.formatValue(item?.unit);
  }

  getTaxRate(item: any): string {
    const percentage = item?.tax_rate_percentage;
    if (percentage !== null && percentage !== undefined && `${percentage}`.trim() !== '') {
      const normalizedPercentage = `${percentage}`.trim();
      return normalizedPercentage.endsWith('%') ? normalizedPercentage : `${normalizedPercentage}%`;
    }

    return this.formatValue(item?.tax_rate_name || item?.tax_preference);
  }

  formatCurrency(value: any): string {
    if (value === null || value === undefined || `${value}`.trim() === '') {
      return '-';
    }

    const numericValue = Number(`${value}`.replace(/,/g, ''));
    if (Number.isNaN(numericValue)) {
      return this.formatValue(value);
    }

    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numericValue);
  }

  trackByItem(index: number, item: any): number | string {
    return item?.id ?? item?.item_id ?? index;
  }

  openItemPopup(item: any): void {
    this.selectedItem = item;
    this.showItemPopup = true;
  }

  closeItemPopup(): void {
    this.showItemPopup = false;
    this.selectedItem = null;
  }

  getVisibleItemFields(item: any): Array<{ key: string; label: string; value: any }> {
    if (!item || typeof item !== 'object') {
      return [];
    }

    return Object.keys(item)
      .filter((key: string) => !key.toLowerCase().includes('_id'))
      .map((key: string) => ({
        key,
        label: this.formatLabel(key),
        value: item[key]
      }));
  }

  getBasicItemFields(item: any): Array<{ label: string; value: any }> {
    return [
      { label: 'Type', value: item?.type || '-' },
      { label: 'Unit', value: item?.unit || '-' },
      { label: 'HSN/SAC', value: item?.hsn_code || item?.sac || '-' },
      { label: 'Tax Preference', value: item?.tax_preference || '-' },
      { label: 'Tax Rate Name', value: item?.tax_rate_name || '-' },
      { label: 'Tax Rate Percentage', value: item?.tax_rate_percentage ?? '-' }
    ];
  }

  getSalesItemFields(item: any): Array<{ label: string; value: any }> {
    return [
      { label: 'Selling Price', value: item?.selling_price || '-' },
      { label: 'Sales Account', value: item?.sales_account_description || '-' },
      { label: 'Sales Chart Item', value: item?.sales_chartofaccounts_item || '-' }
    ];
  }

  getPurchaseItemFields(item: any): Array<{ label: string; value: any }> {
    return [
      { label: 'Cost Price', value: item?.cost_price || '-' },
      { label: 'Purchase Account', value: item?.purchase_account_description || '-' },
      { label: 'Purchase Chart Item', value: item?.purchase_chartofaccounts_item || '-' }
    ];
  }

  getCustomItemFields(item: any): Array<{ label: string; value: any }> {
    let customFields = item?.custom_field;

    if (typeof customFields === 'string') {
      try {
        customFields = JSON.parse(customFields);
      } catch {
        return [];
      }
    }

    if (!customFields || typeof customFields !== 'object' || Array.isArray(customFields)) {
      return [];
    }

    return Object.keys(customFields).map((key: string) => ({
      label: this.formatLabel(key),
      value: this.formatCustomFieldValue(customFields[key])
    }));
  }

  private formatCustomFieldValue(value: any): string {
    if (Array.isArray(value)) {
      return value.length ? value.map((entry: any) => this.formatValue(entry)).join(', ') : '-';
    }

    if (value && typeof value === 'object') {
      return JSON.stringify(value);
    }

    return this.formatValue(value);
  }

  getAuditItemFields(item: any): Array<{ label: string; value: any }> {
    return [
      { label: 'Created At', value: this.formatDateTime(item?.created_at) },
      { label: 'Updated At', value: this.formatDateTime(item?.updated_at) }
    ];
  }

  formatDateTime(value: any): string {
    if (!value) {
      return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours === 0 ? 12 : hours;

    return `${day}/${month}/${year} ${String(hours).padStart(2, '0')}:${minutes} ${period}`;
  }

  formatLabel(key: string): string {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char: string) => char.toUpperCase());
  }

  formatValue(value: any): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    return String(value);
  }

  viewItem(item: any): void {
    console.log('view-item', item);
    this.openItemPopup(item);
  }

  editItem(item: any): void {
    console.log('edit-item', item);
  }

  deleteItem(item: any): void {
    console.log('delete-item', item);
  }
}
