import { Component, OnInit } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { GlobalService } from '../../../services/global.service';

interface AssetItem {
  id: number;
  assets_sub_class: string;
  brand_name: string;
  model_no: string;
  serial_no: string;
  purchase_date: string;
  anudip_identification_no: string;
  isSelected?: boolean;
  [k: string]: any;
}

interface PriceRow {
  subClass: string;
  count: number;
  unitPrice: number | null; // user input
  total: number;            // unitPrice * count
}

@Component({
  selector: 'ngx-scrap-sale-form',
  templateUrl: './scrap-sale-form.component.html',
  styleUrls: ['./scrap-sale-form.component.scss'],
})
export class ScrapSaleFormComponent implements OnInit {
  model: any = {};
  isSubmitting = false;

  assetList: AssetItem[] = [];
  filteredAssetList: AssetItem[] = [];

  masterSelected = false;
  searchTextStudent = '';

  // Pricing summary
  priceRows: PriceRow[] = [];
  grandTotal = 0;

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
  ) {}

  ngOnInit(): void {
    this.loadAsset();
  }

  loadAsset(): void {
    const data = {
      member_id: this.globalService.member_id,
      role_id: this.globalService.role_id,
    };

    this.isSubmitting = true;
    this.globalService.getScrapAssetForSale(data).subscribe({
      next: (res) => {
        // Expecting res.data.assets[]
        this.assetList = (res?.data?.assets || []).map((asset: any) => ({
          ...asset,
          isSelected: false,
        }));
        this.filteredAssetList = [...this.assetList];
        this.masterSelected = false;
        this.isSubmitting = false;

        // Reset summary
        this.updatePriceRows();
      },
      error: (err) => {
        console.error('Load error:', err);
        this.toastrService.danger(err?.message || 'Error loading assets.', 'Error');
        this.isSubmitting = false;
      },
    });
  }

  // 🔎 Filter rows by search
  filterAsset(): void {
    const text = this.searchTextStudent?.toLowerCase().trim();
    if (text) {
      this.filteredAssetList = this.assetList.filter((asset) =>
        (asset.brand_name || '').toLowerCase().includes(text) ||
        (asset.model_no || '').toLowerCase().includes(text) ||
        (asset.serial_no || '').toLowerCase().includes(text) ||
        (asset.purchase_date || '').toLowerCase().includes(text) ||
        (asset.anudip_identification_no || '').toLowerCase().includes(text) ||
        (asset.assets_sub_class || '').toLowerCase().includes(text)
      );
    } else {
      this.filteredAssetList = [...this.assetList];
    }
  }

  // ✅ Bulk select
  selectAll(): void {
    this.assetList.forEach((asset) => (asset.isSelected = this.masterSelected));
    this.updatePriceRows();
  }

  // ✅ Toggle master checkbox state + recompute grouping
  checkIfAllSelected(): void {
    this.masterSelected = this.assetList.every((asset) => asset.isSelected);
    this.updatePriceRows();
  }

  // ✅ Selected count
  get selectedCount(): number {
    return this.assetList.filter((asset) => asset.isSelected).length;
  }

  // 🧮 Build/refresh grouped price rows based on selection
  private updatePriceRows(): void {
    const selected = this.assetList.filter((a) => a.isSelected);
    const map = new Map<string, PriceRow>();

    // Keep previously entered unitPrice for the same subClass
    const previous = new Map(this.priceRows.map((r) => [r.subClass, r.unitPrice]));

    for (const a of selected) {
      const key = a.assets_sub_class || 'Unknown';
      if (!map.has(key)) {
        map.set(key, {
          subClass: key,
          count: 0,
          unitPrice: previous.get(key) ?? null,
          total: 0,
        });
      }
      map.get(key)!.count += 1;
    }

    this.priceRows = Array.from(map.values());
    this.recalcTotals();
  }

  // 💰 Recalculate totals
  recalcTotals(): void {
    for (const row of this.priceRows) {
      const price = Number(row.unitPrice) || 0;
      row.total = price * row.count;
    }
    this.grandTotal = this.priceRows.reduce((sum, r) => sum + r.total, 0);
  }

  // 🚀 Submit
  onSubmit(fm: any): void {
    if (!fm.valid) {
      this.toastrService.warning('Please fill all required fields correctly.', 'Validation');
      return;
    }

    const selectedAssets = this.assetList.filter((a) => a.isSelected);
    if (selectedAssets.length === 0) {
      this.toastrService.danger('Please select at least one asset before submitting.', 'No Asset Selected');
      return;
    }

    const payload = {
      role_id: this.globalService.role_id,
      member_id: this.globalService.member_id,
      user_id: this.globalService.user_id,

      selected_assets: selectedAssets.map((a) => ({
        id: a.id,
        assets_sub_class: a.assets_sub_class,
        brand_name: a.brand_name,
        model_no: a.model_no,
        serial_no: a.serial_no,
        purchase_date: a.purchase_date,
        anudip_identification_no: a.anudip_identification_no,
      })),

      pricing: this.priceRows.map((r) => ({
        assets_sub_class: r.subClass,
        count: r.count,
        unit_price: Number(r.unitPrice) || 0,
        total: r.total,
      })),
      grand_total: this.grandTotal,
    };

    console.log('🔹 Payload to submit:', payload);

    this.isSubmitting = true;
    this.globalService.submitScrapRequest(payload).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;

        if (res?.status) {
          this.toastrService.success('Request sent successfully!', 'Success');
          this.loadAsset(); // refresh list
        } else {
          this.toastrService.warning(res?.message || 'Request failed.', 'Warning');
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Submit error:', err);
        this.toastrService.danger(err?.error?.message || 'Something went wrong. Please try again.', 'Error');
      },
    });
  }
}
