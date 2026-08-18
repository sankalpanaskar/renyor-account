import { Component, OnInit, ViewChild } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';
import { GstTaxRateOption } from '../../shared/gst-tax-rate-popup/gst-tax-rate-popup.component';
import { UnitOption } from '../../shared/unit-popup/unit-popup.component';
import { environment } from '../../../../environments/environment';
import { FileUploadComponent } from '../../../@theme/components/file-upload/file-upload.component';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.scss']
})
export class AddItemComponent implements OnInit {
  @ViewChild('itemImageUpload') itemImageUpload?: FileUploadComponent;

  private readonly itemModuleId = environment.moduleIds.item;
  private readonly vendorModuleId = environment.moduleIds.vendor;

  isEditMode = false;
  itemId: string | number | null = null;
  pageTitle = 'Add Item';
  submitButtonLabel = 'Save';
  private editItemData: any = null;
  model: any = this.getEmptyModel();
  isSubmitting: boolean = false;
  customFieldsLoading: boolean = false;
  customFields: any[] = [];
  itemImageFile: File | null = null;
  existingItemImageUrl = '';
  existingItemImageName = 'Current item image';
  private existingItemImageCandidates: string[] = [];
  private existingItemImageCandidateIndex = 0;
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
    private toastrService: NbToastrService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.restoreEditState();
    this.getAccountItem();
    this.fetchGstTaxRates();
    this.fetchUnits();
    this.getVendorList();
    this.getCustomFields();
  }

  private restoreEditState(): void {
    const navigationState = history.state || {};
    const itemData = navigationState?.itemData;
    const itemId = itemData?.id ?? itemData?.item_id;
    if (!navigationState?.isEditMode || !itemData || itemId === undefined || itemId === null) {
      return;
    }

    const salesAccount = itemData?.sales_account_id ?? itemData?.sales_account ?? '';
    const purchaseAccount = itemData?.purchase_account_id ?? itemData?.purchase_account ?? '';
    const customFieldValues = this.parseCustomFieldValues(itemData?.custom_field);

    this.isEditMode = true;
    this.itemId = itemId;
    this.editItemData = itemData;
    this.pageTitle = 'Update Item';
    this.submitButtonLabel = 'Update';
    this.existingItemImageCandidates = this.getItemImageUrlCandidates(itemData);
    this.existingItemImageCandidateIndex = 0;
    this.existingItemImageUrl = this.existingItemImageCandidates[0] || '';
    this.existingItemImageName = this.getItemImageName(this.existingItemImageUrl);
    this.model = {
      ...this.getEmptyModel(),
      type: itemData?.type || itemData?.item_type || 'Goods',
      name: itemData?.name || itemData?.item_name || '',
      unit: itemData?.unit || '',
      hsn_code: itemData?.hsn_code || '',
      sac: itemData?.sac || '',
      tax_preference: itemData?.tax_preference || '',
      exemption_reason: itemData?.exemption_reason || '',
      gst_rates: itemData?.gst_rates_id
        ?? itemData?.gst_rate_id
        ?? itemData?.tax_rate_id
        ?? itemData?.gst_rates?.id
        ?? itemData?.gst_rates
        ?? '',
      opening_stock_qty: itemData?.current_quantity ?? itemData?.opening_stock_qty ?? '',
      opening_rate: itemData?.unit_cost ?? itemData?.opening_rate ?? '',
      opening_stock_value: itemData?.current_stock_value ?? itemData?.opening_stock_value ?? '',
      enable_sales_information: this.normalizeToggleValue(
        itemData?.enable_sales_information,
        this.hasAnyValue(itemData?.selling_price, salesAccount, itemData?.sales_account_description),
      ),
      enable_purchase_information: this.normalizeToggleValue(
        itemData?.enable_purchase_information,
        this.hasAnyValue(itemData?.cost_price, purchaseAccount, itemData?.purchase_account_description),
      ),
      selling_price: itemData?.selling_price ?? '',
      sales_account: salesAccount,
      sales_account_description: itemData?.sales_account_description || '',
      cost_price: itemData?.cost_price ?? '',
      purchase_account: purchaseAccount,
      purchase_account_description: itemData?.purchase_account_description || '',
      prefered_vendor_id: itemData?.prefered_vendor_id ?? itemData?.preferred_vendor_id ?? '',
      ...customFieldValues,
    };
  }

  private parseCustomFieldValues(value: any): Record<string, any> {
    if (!value) {
      return {};
    }
    if (typeof value === 'string') {
      try {
        return this.parseCustomFieldValues(JSON.parse(value));
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

  private normalizeToggleValue(value: any, fallback: boolean): boolean {
    if (value === undefined || value === null || value === '') {
      return fallback;
    }
    return value === true || Number(value) === 1 || `${value}`.trim().toLowerCase() === 'true';
  }

  private hasAnyValue(...values: any[]): boolean {
    return values.some((value: any) => value !== undefined && value !== null && `${value}`.trim() !== '');
  }

  private getItemImageUrlCandidates(itemData: any): string[] {
    const directImage = itemData?.item_image_url
      ?? itemData?.image_url
      ?? itemData?.item_image_path
      ?? itemData?.image_path
      ?? itemData?.item_image
      ?? itemData?.image
      ?? itemData?.photo
      ?? itemData?.thumbnail_url
      ?? itemData?.thumbnail;
    const dynamicImageKey = Object.keys(itemData || {}).find((key: string) =>
      /(item.*image|image.*item|image|photo|thumbnail)/i.test(key) && !!itemData?.[key],
    );
    const imagePath = this.extractItemImagePath(directImage ?? itemData?.[dynamicImageKey || '']);

    if (!imagePath) {
      return [];
    }
    if (/^(https?:)?\/\//i.test(imagePath) || /^(data|blob):/i.test(imagePath)) {
      return [imagePath];
    }

    const apiBaseUrl = `${environment.apiBaseUrl || ''}`.replace(/\/+$/, '');
    const cleanPath = imagePath.replace(/^\/+/, '');
    const publicPath = cleanPath.replace(/^public\//i, '');
    const fileName = publicPath.split('/').pop() || publicPath;
    return Array.from(new Set([
      `${apiBaseUrl}/${cleanPath}`,
      `${apiBaseUrl}/${publicPath}`,
      `${apiBaseUrl}/uploads/item_image/${fileName}`,
      `${apiBaseUrl}/uploads/items/${fileName}`,
      `${apiBaseUrl}/storage/${publicPath.replace(/^storage\//i, '')}`,
    ]));
  }

  private extractItemImagePath(value: any): string {
    if (Array.isArray(value)) {
      return this.extractItemImagePath(value[0]);
    }
    if (value && typeof value === 'object') {
      return this.extractItemImagePath(
        value?.url
          ?? value?.path
          ?? value?.src
          ?? value?.file_url
          ?? value?.file_path
          ?? value?.image_url
          ?? value?.image_path
          ?? value?.name,
      );
    }

    const imagePath = `${value || ''}`.trim();
    if (!imagePath) {
      return '';
    }
    if ((imagePath.startsWith('{') && imagePath.endsWith('}'))
      || (imagePath.startsWith('[') && imagePath.endsWith(']'))
      || (imagePath.startsWith('"') && imagePath.endsWith('"'))) {
      try {
        return this.extractItemImagePath(JSON.parse(imagePath));
      } catch {
        return imagePath;
      }
    }
    return imagePath;
  }

  onExistingItemImageError(): void {
    this.existingItemImageCandidateIndex += 1;
    this.existingItemImageUrl = this.existingItemImageCandidates[
      this.existingItemImageCandidateIndex
    ] || '';
  }

  private getItemImageName(imageUrl: string): string {
    if (!imageUrl || imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
      return 'Current item image';
    }
    const fileName = imageUrl.split('?')[0].split('/').pop();
    return fileName || 'Current item image';
  }

  getCustomFields(): void {
    this.customFieldsLoading = true;
    this.globalService.fetchCustomFieldsByModule(this.itemModuleId).subscribe({
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
        this.restoreEditAccountSelections();
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
          ? res.data.map((item: any) => {
              const taxName = `${item?.tax_rate_name || ''}`.trim();
              const rate = Number(item?.tax_rate_percentage || 0);
              return {
                id: item.id,
                taxName,
                rate,
                label: this.formatGstRateLabel(taxName, rate),
              };
            })
          : this.getDefaultGstTaxRates();
        this.restoreEditGstRateSelection();
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
    this.globalService.getVendorListByTenant(this.vendorModuleId).subscribe({
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

  private restoreEditAccountSelections(): void {
    if (!this.isEditMode || !this.editItemData) {
      return;
    }

    if (!this.model.sales_account) {
      const salesAccountName = `${
        this.editItemData?.sales_chartofaccounts_item
          || this.editItemData?.sales_account_name
          || ''
      }`.trim().toLowerCase();
      this.model.sales_account = this.accountItemOptions.find((account: any) =>
        account.account_item.toLowerCase() === salesAccountName,
      )?.id || '';
    }

    if (!this.model.purchase_account) {
      const purchaseAccountName = `${
        this.editItemData?.purchase_chartofaccounts_item
          || this.editItemData?.purchase_account_name
          || ''
      }`.trim().toLowerCase();
      this.model.purchase_account = this.accountItemOptions.find((account: any) =>
        account.account_item.toLowerCase() === purchaseAccountName,
      )?.id || '';
    }
  }

  private restoreEditGstRateSelection(): void {
    if (!this.isEditMode || !this.editItemData || this.model.gst_rates) {
      return;
    }

    const taxName = `${this.editItemData?.tax_rate_name || ''}`.trim().toLowerCase();
    const rawTaxRate = this.editItemData?.tax_rate_percentage;
    const hasTaxRate = rawTaxRate !== undefined && rawTaxRate !== null && `${rawTaxRate}`.trim() !== '';
    const taxRate = Number(rawTaxRate);
    const matchedRate = this.gstTaxRates.find((rate: GstTaxRateOption) => {
      const nameMatches = !taxName || `${rate.taxName || ''}`.trim().toLowerCase() === taxName;
      const rateMatches = !hasTaxRate || Number(rate.rate) === taxRate;
      return nameMatches && rateMatches;
    });
    this.model.gst_rates = matchedRate?.id ?? '';
  }

  private getEmptyModel(): any {
    return {
      type: 'Goods',
      unit: '',
      hsn_code: '',
      sac: '',
      tax_preference: '',
      gst_rates: '',
      opening_stock_qty: '',
      opening_rate: '',
      opening_stock_value: '',
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

  private formatGstRateLabel(taxName: string, rate: string | number): string {
    const rateText = `${Number(rate || 0)}`;
    const nameWithoutRate = `${taxName || ''}`
      .trim()
      .replace(/\s*[\[(]?\s*\d+(?:\.\d+)?\s*%?\s*[\])]?\s*$/, '')
      .trim();
    return `${nameWithoutRate || 'GST'} ${rateText}%`;
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

  updateOpeningStockValue(): void {
    const quantity = Number(this.model.opening_stock_qty || 0);
    const rate = Number(this.model.opening_rate || 0);
    const hasOpeningStockInput = `${this.model.opening_stock_qty ?? ''}`.trim() !== ''
      || `${this.model.opening_rate ?? ''}`.trim() !== '';

    this.model.opening_stock_value = hasOpeningStockInput
      ? Number((quantity * rate).toFixed(2))
      : '';
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

      payload.module_id = this.itemModuleId;
      if (this.isEditMode && this.itemId !== null) {
        payload.item_id = this.itemId;
      }
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

      if (payload.hasOwnProperty('opening_stock_qty')) {
        payload.current_quantity = payload.opening_stock_qty;
        delete payload.opening_stock_qty;
      }

      if (payload.hasOwnProperty('opening_rate')) {
        payload.unit_cost = payload.opening_rate;
        delete payload.opening_rate;
      }

      if (payload.hasOwnProperty('opening_stock_value')) {
        payload.current_stock_value = payload.opening_stock_value;
        delete payload.opening_stock_value;
      }

      const formData = new FormData();
      Object.keys(payload).forEach((key: string) => {
        this.appendFormDataValue(formData, key, payload[key]);
      });

      if (this.itemImageFile) {
        formData.append('item_image', this.itemImageFile, this.itemImageFile.name);
      }

      const itemRequest$ = this.isEditMode
        ? this.globalService.updateItem(formData)
        : this.globalService.addItem(formData);

      itemRequest$.subscribe({
        next: (res: any) => {
          if (this.isEditMode) {
            this.toastrService.success(res?.message || 'Item updated successfully.', 'Updated');
            this.isSubmitting = false;
            this.router.navigate(['/pages/sales/item-list']);
            return;
          }

          this.model = this.getEmptyModel();
          this.applyCustomFieldDefaults();
          this.itemImageFile = null;
          this.itemImageUpload?.reset();
          fm.resetForm(this.model);
          this.toastrService.success(res?.message || 'Item added successfully.', 'Added');
          this.isSubmitting = false;
        },
        error: (err: any) => {
          console.error('Submit error:', err);
          const errorMessage =
            err?.error?.message ||
            err?.message ||
            `${this.isEditMode ? 'Update' : 'Add'} item failed. Please try again.`;

          this.toastrService.danger(
            errorMessage,
            this.isEditMode ? 'Update Item Failed' : 'Add Item Failed',
          );
          this.isSubmitting = false;
        },
      });
    }
  }

}
