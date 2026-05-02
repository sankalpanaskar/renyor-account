import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.scss']
})
export class AddItemComponent implements OnInit {
  model: any = this.getEmptyModel();
  isSubmitting: boolean = false;
  itemImageFile: File | null = null;
  accountItemOptions: Array<{
    id: number;
    account_name: string;
    account_item: string;
    label: string;
  }> = [];

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService
  ) { }

  ngOnInit(): void {
    this.getAccountItem();
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
              account_item: accountItem,
              label: accountName && accountItem ? `${accountName} - ${accountItem}` : accountName || accountItem,
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

  private getEmptyModel(): any {
    return {
      customer_type: 'Goods',
      unit: '',
      hsn_code: '',
      sac: '',
      tax_preference: '',
      enable_sales_information: false,
      enable_purchase_information: false,
      selling_price: '',
      sales_account: '',
      sales_account_description: '',
      cost_price: '',
      purchase_account: '',
      purchase_account_description: '',
      prefered_vendor: ''
    };
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
      this.model.prefered_vendor = '';
    }
  }

  hasSalesOrPurchaseInformationSelected(): boolean {
    return !!this.model.enable_sales_information || !!this.model.enable_purchase_information;
  }

  private normalizeSalesPurchaseModel(): void {
    this.model.selling_price = this.model.enable_sales_information ? (this.model.selling_price ?? '') : '';
    this.model.sales_account = this.model.enable_sales_information ? (this.model.sales_account ?? '') : '';
    this.model.sales_account_description = this.model.enable_sales_information ? (this.model.sales_account_description ?? '') : '';

    this.model.cost_price = this.model.enable_purchase_information ? (this.model.cost_price ?? '') : '';
    this.model.purchase_account = this.model.enable_purchase_information ? (this.model.purchase_account ?? '') : '';
    this.model.purchase_account_description = this.model.enable_purchase_information ? (this.model.purchase_account_description ?? '') : '';
    this.model.prefered_vendor = this.model.enable_purchase_information ? (this.model.prefered_vendor ?? '') : '';
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
      this.normalizeSalesPurchaseModel();
      const payload = { ...this.model };

      if (payload.customer_type === 'Goods') {
        delete payload.sac;
      }

      if (payload.customer_type === 'Service') {
        delete payload.hsn_code;
      }

      if (payload.tax_preference !== 'Non-taxable') {
        delete payload.exemption_reason;
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
