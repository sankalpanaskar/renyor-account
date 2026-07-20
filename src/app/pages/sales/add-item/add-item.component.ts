import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';
import { GstTaxRateOption } from '../../shared/gst-tax-rate-popup/gst-tax-rate-popup.component';
import { UnitOption } from '../../shared/unit-popup/unit-popup.component';

@Component({
  selector: 'ngx-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.scss']
})
export class AddItemComponent implements OnInit {
  model: any = this.getEmptyModel();
  isSubmitting: boolean = false;
  customFieldsLoading: boolean = false;
  customFields: any[] = [];
  itemImageFile: File | null = null;
  showGstTaxRatePopup: boolean = false;
  showUnitPopup: boolean = false;
  gstTaxRates: GstTaxRateOption[] = this.getDefaultGstTaxRates();
  unitOptions: UnitOption[] = this.getDefaultUnitOptions();
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
    this.fetchUnits();
    this.getVendorList();
    this.getCustomFields();
  }

  getCustomFields(): void {
    this.customFieldsLoading = true;
    this.globalService.fetchCustomFieldsByModule(37).subscribe({
      next: (res: any) => {
        const fields = Array.isArray(res?.data)
          ? res.data
          : (Array.isArray(res) ? res : []);

        this.customFields = fields
          .filter((field: any) => Number(field?.show_in_form) === 1 && Number(field?.status) === 1)
          .sort((a: any, b: any) => Number(a?.field_order || 0) - Number(b?.field_order || 0));
        this.applyCustomFieldDefaults();
        this.customFieldsLoading = false;
      },
      error: (error: any) => {
        this.customFields = [];
        this.customFieldsLoading = false;
        this.toastrService.danger(
          error?.error?.message || 'Custom fields could not be loaded.',
          'Custom Fields'
        );
      },
    });
  }

  private applyCustomFieldDefaults(): void {
    this.customFields.forEach((field: any) => {
      const fieldName = `${field?.field_name || ''}`.trim();
      if (!fieldName) {
        return;
      }

      const hasValue = this.model[fieldName] !== undefined && this.model[fieldName] !== null;
      if (this.getFieldType(field) === 'checkbox') {
        this.model[fieldName] = this.parseCheckboxDefaultValues(
          hasValue ? this.model[fieldName] : field?.default_value
        );
      } else if (!hasValue) {
        this.model[fieldName] = field?.default_value ?? '';
      }
    });
  }

  getFieldType(field: any): string {
    const rawType = `${field?.field_type || 'text'}`.trim().toLowerCase();
    const type = rawType.replace(/[\s_-]+/g, '');

    if (type === 'radiobutton') {
      return 'radio';
    }
    if (type === 'checkboxes') {
      return 'checkbox';
    }
    if (type === 'datepicker') {
      return 'date';
    }

    const allowedTypes = ['text', 'textarea', 'number', 'email', 'date', 'select', 'radio', 'checkbox'];
    return allowedTypes.includes(type) ? type : 'text';
  }

  getFieldOptions(field: any): string[] {
    const rawOptions = field?.field_options;
    if (!rawOptions) {
      return [];
    }

    if (Array.isArray(rawOptions)) {
      return rawOptions.map((option: any) => this.normalizeFieldOption(option)).filter(Boolean);
    }

    if (typeof rawOptions === 'string') {
      const normalizedOptions = rawOptions.trim();
      if (!normalizedOptions) {
        return [];
      }

      try {
        const parsedOptions = JSON.parse(normalizedOptions);
        if (Array.isArray(parsedOptions)) {
          return parsedOptions.map((option: any) => this.normalizeFieldOption(option)).filter(Boolean);
        }
        if (parsedOptions && typeof parsedOptions === 'object') {
          return Object.values(parsedOptions).map((option: any) => this.normalizeFieldOption(option)).filter(Boolean);
        }
      } catch {
      }

      return normalizedOptions.split(/[\n,|]/).map((option: string) => option.trim()).filter(Boolean);
    }

    if (typeof rawOptions === 'object') {
      return Object.values(rawOptions).map((option: any) => this.normalizeFieldOption(option)).filter(Boolean);
    }

    return [];
  }

  private normalizeFieldOption(option: any): string {
    if (option === null || option === undefined) {
      return '';
    }
    if (typeof option === 'object') {
      return `${option?.label ?? option?.name ?? option?.title ?? option?.value ?? ''}`.trim();
    }
    return `${option}`.trim();
  }

  private parseCheckboxDefaultValues(defaultValue: any): string[] {
    if (!defaultValue) {
      return [];
    }
    if (Array.isArray(defaultValue)) {
      return defaultValue.map((value: any) => `${value}`.trim()).filter(Boolean);
    }
    if (typeof defaultValue === 'string') {
      const normalizedValue = defaultValue.trim();
      if (!normalizedValue) {
        return [];
      }
      try {
        const parsedValue = JSON.parse(normalizedValue);
        if (Array.isArray(parsedValue)) {
          return parsedValue.map((value: any) => `${value}`.trim()).filter(Boolean);
        }
      } catch {
      }
      return normalizedValue.split(/[\n,|]/).map((value: string) => value.trim()).filter(Boolean);
    }
    return [`${defaultValue}`.trim()].filter(Boolean);
  }

  isFieldRequired(field: any): boolean {
    return Number(field?.is_required) === 1;
  }

  isCheckboxChecked(fieldName: string, option: string): boolean {
    const selectedOptions = this.model?.[fieldName];
    return Array.isArray(selectedOptions) && selectedOptions.includes(option);
  }

  onCheckboxOptionChange(fieldName: string, option: string, checkedValue: any): void {
    const checked = typeof checkedValue === 'boolean' ? checkedValue : !!checkedValue?.checked;
    const currentValue = this.model?.[fieldName];
    const selectedOptions = Array.isArray(currentValue) ? [...currentValue] : [];

    if (checked && !selectedOptions.includes(option)) {
      selectedOptions.push(option);
    } else if (!checked) {
      const optionIndex = selectedOptions.indexOf(option);
      if (optionIndex !== -1) {
        selectedOptions.splice(optionIndex, 1);
      }
    }

    this.model[fieldName] = selectedOptions;
  }

  hasFieldError(fm: any, field: any): boolean {
    if (!fm?.submitted || !this.isFieldRequired(field)) {
      return false;
    }

    const fieldName = field?.field_name;
    if (this.getFieldType(field) === 'checkbox') {
      const selectedOptions = this.model?.[fieldName];
      return !Array.isArray(selectedOptions) || selectedOptions.length === 0;
    }

    return !!fm?.controls?.[fieldName]?.invalid;
  }

  private hasRequiredCustomFieldError(): boolean {
    return this.customFields.some((field: any) => {
      if (!this.isFieldRequired(field)) {
        return false;
      }

      const value = this.model?.[field?.field_name];
      if (this.getFieldType(field) === 'checkbox') {
        return !Array.isArray(value) || value.length === 0;
      }
      return value === undefined || value === null || `${value}`.trim() === '';
    });
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
              label: item.tax_rate_name
            }))
          : this.getDefaultGstTaxRates();
      },
      error: (error: any) => {
        console.error('Failed to fetch GST tax rates:', error);
        this.gstTaxRates = this.getDefaultGstTaxRates();
      },
    });
  }

  fetchUnits(): void {
    this.globalService.getUnits().subscribe({
      next: (res: any) => {
        this.unitOptions = Array.isArray(res?.data)
          ? res.data.map((item: any) => this.mapUnitOption(item))
          : this.getDefaultUnitOptions();
      },
      error: (error: any) => {
        console.error('Failed to fetch units:', error);
        this.unitOptions = this.getDefaultUnitOptions();
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
      enable_sales_information: true,
      enable_purchase_information: true,
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

  private getDefaultUnitOptions(): UnitOption[] {
    return [
      { symbol: 'box', unitName: 'Box', label: 'box (Box)' },
      { symbol: 'cm', unitName: 'Centimeter', label: 'cm (Centimeter)' },
      { symbol: 'dz', unitName: 'Dozen', label: 'dz (Dozen)' },
      { symbol: 'ft', unitName: 'Foot', label: 'ft (Foot)' },
      { symbol: 'g', unitName: 'Grams', label: 'g (Grams)' },
      { symbol: 'in', unitName: 'Inch', label: 'in (Inch)' },
      { symbol: 'kg', unitName: 'Kilograms', label: 'kg (Kilograms)' },
      { symbol: 'km', unitName: 'Kilometer', label: 'km (Kilometer)' },
      { symbol: 'lb', unitName: 'Pounds', label: 'lb (Pounds)' },
      { symbol: 'mg', unitName: 'Milligrams', label: 'mg (Milligrams)' },
      { symbol: 'ml', unitName: 'Milliliter', label: 'ml (Milliliter)' },
      { symbol: 'm', unitName: 'Meter', label: 'm (Meter)' },
      { symbol: 'pcs', unitName: 'Pieces', label: 'pcs (Pieces)' },
    ];
  }

  private mapUnitOption(item: any): UnitOption {
    const unitName = `${item?.unit_name ?? item?.name ?? item?.title ?? ''}`.trim();
    const symbol = `${item?.symbol ?? item?.unit_symbol ?? item?.code ?? ''}`.trim();
    return {
      id: item?.id,
      unitName,
      symbol,
      label: `${symbol || unitName}${symbol && unitName ? ' (' + unitName + ')' : ''}`,
    };
  }

  openGstTaxRatePopup(): void {
    this.fetchGstTaxRates();
    this.showGstTaxRatePopup = true;
  }

  closeGstTaxRatePopup(): void {
    this.showGstTaxRatePopup = false;
    this.fetchGstTaxRates();
  }

  onGstTaxRatesChanged(rates: GstTaxRateOption[]): void {
    this.gstTaxRates = rates;
  }

  onGstTaxRateSelected(rateId: string | number): void {
    this.model.gst_rates = rateId;
    this.closeGstTaxRatePopup();
  }

  openUnitPopup(): void {
    this.fetchUnits();
    this.showUnitPopup = true;
  }

  closeUnitPopup(): void {
    this.showUnitPopup = false;
    this.fetchUnits();
  }

  onUnitsChanged(units: UnitOption[]): void {
    this.unitOptions = units;
  }

  onUnitSelected(symbol: string): void {
    this.model.unit = symbol;
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

    if (this.hasRequiredCustomFieldError()) {
      this.toastrService.danger('Complete all required custom fields.', 'Validation Failed');
      return;
    }

    if (fm.valid) {
      this.isSubmitting = true;
      const payload = { ...this.model };
      const customFieldData: any = {};

      this.customFields.forEach((field: any) => {
        const fieldName = `${field?.field_name || ''}`.trim();
        if (!fieldName) {
          return;
        }
        customFieldData[fieldName] = payload[fieldName] ?? '';
        delete payload[fieldName];
      });

      payload.module_id = 37;
      if (Object.keys(customFieldData).length > 0) {
        payload.custom_field = customFieldData;
      }

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
          this.applyCustomFieldDefaults();
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
