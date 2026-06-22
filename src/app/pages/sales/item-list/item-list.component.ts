import { Component, OnInit } from '@angular/core';
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

  constructor(private globalService: GlobalService) {}

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

  getItemName(item: any): string {
    return item?.name || '-';
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
