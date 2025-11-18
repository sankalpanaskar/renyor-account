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
  model: any = {
    gst_amount: null,
    tcs_amount: null,
    buyer_name: null,
    invoice_no: null,
    invoice_date: null,
  };

  isSubmitting = false;

  assetList: AssetItem[] = [];
  filteredAssetList: AssetItem[] = [];

  masterSelected = false;
  searchTextStudent = '';

  // Pricing summary
  priceRows: PriceRow[] = [];
  baseTotal = 0;   // subtotal of all sub-class totals
  grandTotal = 0;  // baseTotal + GST + TCS (rounded)

  // Buyer dropdown
  buyerList: any[] = [];
  filterBuyerList: any[] = [];
  dropdownOpen = false;
  openAbove = false;
  searchText = '';

  today: Date = new Date(); // 🔹 for max invoice date

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
  ) {}

  ngOnInit(): void {
    this.loadAsset();
    this.loadBuyer();
  }

  // 🔹 Load assets for sale
  loadAsset(): void {
    const data = {
      member_id: this.globalService.member_id,
      role_id: this.globalService.role_id,
    };

    this.isSubmitting = true;
    this.globalService.getScrapAssetForSale(data).subscribe({
      next: (res) => {
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
        this.toastrService.danger(
          err?.message || 'Error loading assets.',
          'Error',
        );
        this.isSubmitting = false;
      },
    });
  }

  // 🔎 Filter assets
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

  // ✅ Select / deselect all
  selectAll(): void {
    this.assetList.forEach((asset) => (asset.isSelected = this.masterSelected));
    this.updatePriceRows();
  }

  // ✅ When a single checkbox changes
  checkIfAllSelected(): void {
    this.masterSelected = this.assetList.every((asset) => asset.isSelected);
    this.updatePriceRows();
  }

  // ✅ Selected count
  get selectedCount(): number {
    return this.assetList.filter((asset) => asset.isSelected).length;
  }

  // 🔹 Load Buyer list
  loadBuyer(): void {
    this.isSubmitting = true;
    this.globalService.getBuyerList().subscribe({
      next: (res: any) => {
        this.buyerList = res.data || [];
        this.filterBuyerList = this.buyerList;
        this.isSubmitting = false;
      },
      error: () => {
        this.isSubmitting = false;
      },
    });
  }

  // 🔹 Select Buyer from dropdown
  selectFunder(buyerName: string): void {
    this.model.buyer_name = buyerName;
    this.dropdownOpen = false;
    this.searchText = '';
    this.filterOptions();
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  // 🔹 Filter Buyer dropdown
  filterOptions(): void {
    const text = (this.searchText || '').toLowerCase();
    this.filterBuyerList = this.buyerList.filter((c) =>
      (c.name || '').toLowerCase().includes(text),
    );
  }

  // 🧮 Build/refresh grouped price rows based on selection
  private updatePriceRows(): void {
    const selected = this.assetList.filter((a) => a.isSelected);
    const map = new Map<string, PriceRow>();

    // Keep previously entered unitPrice for the same subClass
    const previous = new Map(
      this.priceRows.map((r) => [r.subClass, r.unitPrice]),
    );

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

  // 💰 Recalculate row totals, subtotal, and grand total (with GST/TCS)
  recalcTotals(): void {
    // Row totals
    for (const row of this.priceRows) {
      const price = Number(row.unitPrice) || 0;
      row.total = price * row.count;
    }

    // Subtotal
    this.baseTotal = this.priceRows.reduce(
      (sum, r) => sum + (r.total || 0),
      0,
    );

    // GST & TCS
    const gst = Number(this.model.gst_amount) || 0;
    const tcs = Number(this.model.tcs_amount) || 0;

    // 🔹 Round off grand total (to nearest rupee)
    const rawGrand = this.baseTotal + gst + tcs;
    this.grandTotal = Math.round(rawGrand);
  }

 // 🚀 Submit
onSubmit(fm: any): void {
  if (!fm.valid) {
    this.toastrService.warning(
      'Please fill all required fields correctly.',
      'Validation',
    );
    return;
  }

  const selectedAssets = this.assetList.filter((a) => a.isSelected);
  if (selectedAssets.length === 0) {
    this.toastrService.danger(
      'Please select at least one asset before submitting.',
      'No Asset Selected',
    );
    return;
  }

  // 🔹 NEW: Check that every price row has a valid (>0) unit price
  if (!this.priceRows.length) {
    this.toastrService.warning(
      'Please select at least one asset so that pricing rows are generated.',
      'Validation',
    );
    return;
  }

  const invalidRow = this.priceRows.find(
    (r) => r.unitPrice == null || Number(r.unitPrice) <= 0
  );

  if (invalidRow) {
    this.toastrService.warning(
      `Please enter unit price for "${invalidRow.subClass}".`,
      'Validation',
    );
    return;
  }

  const gst = Number(this.model.gst_amount) || 0;
  const tcs = Number(this.model.tcs_amount) || 0;

  const payload = {
    role_id: this.globalService.role_id,
    member_id: this.globalService.member_id,
    user_id: this.globalService.user_id,

    // 🔹 Buyer & invoice details
    buyer_name: this.model.buyer_name,
    invoice_no: this.model.invoice_no,
    invoice_date: this.model.invoice_date,

    // 🔹 Selected assets
    selected_assets: selectedAssets.map((a) => ({
      id: a.id,
      assets_sub_class: a.assets_sub_class,
      brand_name: a.brand_name,
      model_no: a.model_no,
      serial_no: a.serial_no,
      purchase_date: a.purchase_date,
      anudip_identification_no: a.anudip_identification_no,
    })),

    // 🔹 Table summary
    pricing: this.priceRows.map((r) => ({
      sub_class: r.subClass,
      quantity: r.count,
      unit_price: Number(r.unitPrice) || 0,
      line_total: r.total,
    })),

    // 🔹 Amounts
    subtotal: this.baseTotal,
    gst_amount: gst,
    tcs_amount: tcs,
    grand_total: this.grandTotal, // already rounded
  };

  console.log('🔹 Payload to submit:', payload);

  this.isSubmitting = true;
  this.globalService.submitSale(payload).subscribe({
    next: (res: any) => {
      this.isSubmitting = false;

      if (res?.status) {
        this.toastrService.success('Request sent successfully!', 'Success');
        this.loadAsset(); // refresh list

        // Optional reset
        this.model.gst_amount = null;
        this.model.tcs_amount = null;
        this.model.buyer_name = null;
        this.model.invoice_no = null;
        this.model.invoice_date = null;
        this.priceRows = [];
        this.baseTotal = 0;
        this.grandTotal = 0;
        this.masterSelected = false;
        this.assetList.forEach(a => a.isSelected = false);
      } else {
        this.toastrService.warning(
          res?.message || 'Request failed.',
          'Warning',
        );
      }
    },
    error: (err) => {
      this.isSubmitting = false;
      console.error('Submit error:', err);
      this.toastrService.danger(
        err?.error?.message || 'Something went wrong. Please try again.',
        'Error',
      );
    },
  });
}

}
