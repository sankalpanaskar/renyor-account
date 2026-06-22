import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';
import { GstTaxRateOption } from '../../shared/gst-tax-rate-popup/gst-tax-rate-popup.component';

@Component({
  selector: 'ngx-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.scss']
})
export class AddItemComponent implements OnInit {
  model: any = this.getEmptyModel();
  isSubmitting: boolean = false;
  itemImageFile: File | null = null;
  showGstTaxRatePopup: boolean = false;
  gstTaxRates: GstTaxRateOption[] = this.getDefaultGstTaxRates();
  vendorOptions: Array<{
    id: number;
    vendorName: string;
  }> = [];
  accountItemOptions: Array<{
    id: number;
    account_name: string;
    account_item: string;
  }> = [];

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService
  ) { }

  ngOnInit(): void {
    this.getAccountItem();
    this.fetchGstTaxRates();
    this.getVendorList();
  }

  getAccountItem(): void {
    this.globalService.getAccountItem().subscribe({
      next: (res: any) => {
        const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        this.accountItemOptions = rows
          .map((item: any) => {
            const accountName = `${item?.account_name ?? ''}`.trim();
            const accountItem = `${item?.account_item ?? ''}`.trim();

            return {
              id: Number(item?.id || 0),
              account_name: accountName,
              account_item: accountItem
            };
          })
          .filter((item: any) => item.id > 0 && !!item.account_item);
      },
      error: (error: any) => {
        console.error('Failed to fetch account items:', error);
        this.accountItemOptions = [];
      },
    });
  }

  fetchGstTaxRates(): void {
    this.globalService.getTaxRates().subscribe({
      next: (res: any) => {
        this.gstTaxRates = Array.isArray(res?.data)
          ? res.data.map((item: any) => ({
              id: item.id,
              taxName: item.tax_rate_name,
              rate: item.tax_rate_percentage,
              label: item.tax_rate_name + ' [' + item.tax_rate_percentage + '%]'
            }))
          : this.getDefaultGstTaxRates();
      },
      error: (error: any) => {
        console.error('Failed to fetch GST tax rates:', error);
        this.gstTaxRates = this.getDefaultGstTaxRates();
      },
    });
  }

  getVendorList(): void {
    this.globalService.getVendorListByTenant(46).subscribe({
      next: (res: any) => {
        this.vendorOptions = Array.isArray(res?.data)
          ? res.data.map((item: any) => ({
              id: item.id,
              vendorName:
                item.company_name ||
                item.display_name ||
                `${item.primary_contact_f_name || ''} ${item.primary_contact_l_name || ''}`.trim()
            }))
          : [];
      },
      error: (error: any) => {
        console.error('Failed to fetch vendors:', error);
        this.vendorOptions = [];
      },
    });
  }

  private getEmptyModel(): any {
    return {
      type: 'Goods',
      unit: '',
      hsn_code: '',
      sac: '',
      tax_preference: '',
      gst_rates: '',
      enable_sales_information: false,
      enable_purchase_information: false,
      selling_price: '',
      sales_account: '',
      sales_account_description: '',
      cost_price: '',
      purchase_account: '',
      purchase_account_description: '',
      prefered_vendor_id: ''
    };
  }

  private getDefaultGstTaxRates(): GstTaxRateOption[] {
    return [];
  }

  openGstTaxRatePopup(): void {
    this.showGstTaxRatePopup = true;
  }

  closeGstTaxRatePopup(): void {
    this.showGstTaxRatePopup = false;
  }

  onGstTaxRatesChanged(rates: GstTaxRateOption[]): void {
    this.gstTaxRates = rates;
  }

  onGstTaxRateSelected(rateId: string | number): void {
    this.model.gst_rates = rateId;
    this.closeGstTaxRatePopup();
  }
  
  typeChange(value: string) {
    console.log('Type selected:', value);
    // Reset unit when type changes
    this.model.unit = '';
    // Reset HSN code and SAC when type changes
    this.model.hsn_code = '';
    this.model.sac = '';
    this.model.tax_preference = '';
  }

  onSalesInformationToggle(checked: boolean): void {
    this.model.enable_sales_information = checked;
    if (!checked) {
      this.model.selling_price = '';
      this.model.sales_account = '';
      this.model.sales_account_description = '';
    }
  }

  onPurchaseInformationToggle(checked: boolean): void {
    this.model.enable_purchase_information = checked;
    if (!checked) {
      this.model.cost_price = '';
      this.model.purchase_account = '';
      this.model.purchase_account_description = '';
      this.model.prefered_vendor_id = '';
    }
  }

  hasSalesOrPurchaseInformationSelected(): boolean {
    return !!this.model.enable_sales_information || !!this.model.enable_purchase_information;
  }

  onFileChange(files: File[], field: 'item_image'): void {
    if (field === 'item_image') {
      this.itemImageFile = files && files.length > 0 ? files[0] : null;
    }
  }

  private appendFormDataValue(formData: FormData, key: string, value: any): void {
    if (value === undefined || value === null) {
      formData.append(key, '');
      return;
    }

    if (value instanceof File) {
      formData.append(key, value);
      return;
    }

    if (typeof value === 'object') {
      formData.append(key, JSON.stringify(value));
      return;
    }

    formData.append(key, `${value}`);
  }

  onSubmit(fm: any) {
    if (!this.hasSalesOrPurchaseInformationSelected()) {
      this.toastrService.danger(
        'Select at least one option from Sales Information, Purchase Information.',
        'Validation Failed'
      );
      return;
    }

    if (fm.valid) {
      this.isSubmitting = true;
      const payload = { ...this.model };

      if (payload.type === 'Goods') {
        delete payload.sac;
      }

      if (payload.type === 'Service') {
        delete payload.hsn_code;
      }

      if (payload.tax_preference !== 'Non-taxable') {
        delete payload.exemption_reason;
      }

      // Map form field keys to backend-expected keys
      if (payload.hasOwnProperty('gst_rates')) {
        payload.gst_rates_id = payload.gst_rates;
        delete payload.gst_rates;
      }

      if (payload.hasOwnProperty('sales_account')) {
        payload.sales_account_id = payload.sales_account;
        delete payload.sales_account;
      }

      if (payload.hasOwnProperty('purchase_account')) {
        payload.purchase_account_id = payload.purchase_account;
        delete payload.purchase_account;
      }

      const formData = new FormData();
      Object.keys(payload).forEach((key: string) => {
        this.appendFormDataValue(formData, key, payload[key]);
      });

      if (this.itemImageFile) {
        formData.append('item_image', this.itemImageFile, this.itemImageFile.name);
      }

      this.globalService.addItem(formData).subscribe({
        next: (res: any) => {
          this.model = this.getEmptyModel();
          this.itemImageFile = null;
          fm.resetForm(this.model);
          this.toastrService.success(res?.message || 'Item added successfully.', 'Added');
          this.isSubmitting = false;
        },
        error: (err: any) => {
          console.error('Submit error:', err);
          const errorMessage =
            err?.error?.message ||
            err?.message ||
            'Add item failed. Please try again.';

          this.toastrService.danger(errorMessage, 'Add Item Failed');
          this.isSubmitting = false;
        },
      });
    }
  }

}
