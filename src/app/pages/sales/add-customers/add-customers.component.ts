import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'ngx-add-customers',
  templateUrl: './add-customers.component.html',
  styleUrls: ['./add-customers.component.scss']
})
export class AddCustomersComponent implements OnInit {
  model: any = [];
  isSubmitting: boolean = false;
  stateList : any = [];
  customFields: any[] = [];
  showPaymentTermsPopup: boolean = false;
  document1File: File | null = null;
  document2File: File | null = null;
  paymentTerms: Array<{ termName: string; days: string | number }> = [
    { termName: 'Due end of next month', days: 'N/A' },
    { termName: 'Due end of the month', days: 'N/A' },
    { termName: 'Due on Receipt', days: 0 },
    { termName: 'Net 15', days: 15 },
    { termName: 'Net 30', days: 30 },
    { termName: 'Net 45', days: 45 },
    { termName: 'Net 60', days: 60 },
  ];

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.getState();
    this.getCustomFields();
  }

  getState(){
    this.globalService.getStates().subscribe({
      next: (res: any) => {
        this.stateList = res;
        this.isSubmitting = false;
        console.log(res);
      },
      error: (res: any) => {
        this.isSubmitting = false;
      }
    })
  }

  getCustomFields(){
    this.globalService.fetchCustomFieldsByModule(34).subscribe({
      next: (res: any) => {
        const fields = Array.isArray(res?.data) ? res.data : [];
        this.customFields = fields
          .filter((field: any) => Number(field?.show_in_form) === 1 && Number(field?.status) === 1)
          .sort((a: any, b: any) => Number(a?.field_order || 0) - Number(b?.field_order || 0));

        this.customFields.forEach((field: any) => {
          const key = field?.field_name;
          if (!key) {
            return;
          }

          if (this.model[key] === undefined || this.model[key] === null) {
            if (this.getFieldType(field) === 'checkbox') {
              this.model[key] = this.parseCheckboxDefaultValues(field?.default_value);
            } else {
              this.model[key] = field?.default_value ?? '';
            }
          }
        });

        this.isSubmitting = false;
      },
      error: (res: any) => {
        this.isSubmitting = false;
      }
    })
  }

  getFieldType(field: any): string {
    const rawType = (field?.field_type || 'text').toString().trim().toLowerCase();
    const type = rawType.replace(/[\s_-]+/g, '');

    if (type === 'radiobutton') {
      return 'radio';
    }

    if (type === 'checkboxes') {
      return 'checkbox';
    }

    const allowed = ['text', 'textarea', 'number', 'email', 'date', 'select', 'radio', 'checkbox'];
    return allowed.includes(type) ? type : 'text';
  }

  getFieldOptions(field: any): string[] {
    const rawOptions = field?.field_options;
    if (!rawOptions) {
      return [];
    }

    if (Array.isArray(rawOptions)) {
      return rawOptions
        .map((option: any) => this.normalizeOption(option))
        .filter((option: string) => !!option);
    }

    if (typeof rawOptions === 'string') {
      const normalized = rawOptions.trim();

      if (!normalized) {
        return [];
      }

      try {
        const parsed = JSON.parse(normalized);
        if (Array.isArray(parsed)) {
          return parsed
            .map((option: any) => this.normalizeOption(option))
            .filter((option: string) => !!option);
        }
        if (parsed && typeof parsed === 'object') {
          return Object.values(parsed)
            .map((option: any) => this.normalizeOption(option))
            .filter((option: string) => !!option);
        }
      } catch {
      }

      return normalized
        .split(/[\n,|]/)
        .map((option: string) => option.trim())
        .filter((option: string) => !!option);
    }

    if (typeof rawOptions === 'object') {
      return Object.values(rawOptions)
        .map((option: any) => this.normalizeOption(option))
        .filter((option: string) => !!option);
    }

    return [];
  }

  private normalizeOption(option: any): string {
    if (option === null || option === undefined) {
      return '';
    }

    if (typeof option === 'object') {
      const label = option?.label ?? option?.name ?? option?.title ?? option?.value;
      return `${label ?? ''}`.trim();
    }

    return `${option}`.trim();
  }

  private parseCheckboxDefaultValues(defaultValue: any): string[] {
    if (!defaultValue) {
      return [];
    }

    if (Array.isArray(defaultValue)) {
      return defaultValue
        .map((value: any) => `${value}`.trim())
        .filter((value: string) => !!value);
    }

    if (typeof defaultValue === 'string') {
      const normalized = defaultValue.trim();
      if (!normalized) {
        return [];
      }

      try {
        const parsed = JSON.parse(normalized);
        if (Array.isArray(parsed)) {
          return parsed
            .map((value: any) => `${value}`.trim())
            .filter((value: string) => !!value);
        }
      } catch {
      }

      return normalized
        .split(/[\n,|]/)
        .map((value: string) => value.trim())
        .filter((value: string) => !!value);
    }

    return [`${defaultValue}`.trim()].filter((value: string) => !!value);
  }

  isFieldRequired(field: any): boolean {
    return Number(field?.is_required) === 1;
  }

  isCheckboxChecked(fieldName: string, option: string): boolean {
    const selected = this.model?.[fieldName];
    return Array.isArray(selected) && selected.includes(option);
  }

  onCheckboxOptionChange(fieldName: string, option: string, checkedValue: any): void {
    const checked = typeof checkedValue === 'boolean' ? checkedValue : !!checkedValue?.checked;
    const currentValue = this.model?.[fieldName];
    const selectedOptions = Array.isArray(currentValue) ? [...currentValue] : [];

    if (checked) {
      if (!selectedOptions.includes(option)) {
        selectedOptions.push(option);
      }
    } else {
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
    const fieldType = this.getFieldType(field);

    if (fieldType === 'checkbox') {
      const selected = this.model?.[fieldName];
      return !Array.isArray(selected) || selected.length === 0;
    }

    return !!fm?.controls?.[fieldName]?.invalid;
  }

  copyBillingToShipping() {
    this.model.shipping_address = this.model.billing_address;
    this.model.shipping_country = this.model.billing_country;
    this.model.shipping_city    = this.model.billing_city;
    this.model.shipping_state   = this.model.billing_state;
    this.model.shipping_pin     = this.model.billing_pin;

    // Optional: if you want errors to disappear/appear immediately
    // this.fm?.form?.controls?.['shipping_address']?.markAsTouched();
    // this.fm?.form?.controls?.['shipping_country']?.markAsTouched();
    // this.fm?.form?.controls?.['shipping_city']?.markAsTouched();
    // this.fm?.form?.controls?.['shipping_state']?.markAsTouched();
    // this.fm?.form?.controls?.['shipping_pin']?.markAsTouched();
  }

  onTaxPreferenceChange(value: string): void {
    if (value !== 'Tax Exempt') {
      this.model.exemption_reason = '';
    }
  }

  openPaymentTermsPopup(): void {
    this.showPaymentTermsPopup = true;
  }

  closePaymentTermsPopup(): void {
    this.showPaymentTermsPopup = false;
  }

  onPaymentTermsChanged(terms: Array<{ termName: string; days: string | number }>): void {
    this.paymentTerms = terms;
  }

  onPaymentTermSelected(termName: string): void {
    this.model.payment_terms = termName;
    this.showPaymentTermsPopup = false;
  }

  onPhoneInputChange(field: 'work_phone' | 'mobile_no'): void {
    const digitsOnly = `${this.model?.[field] ?? ''}`.replace(/\D/g, '').slice(0, 10);
    this.model[field] = digitsOnly;
  }

  onDocumentChange(event: Event, field: 'document_1' | 'document_2'): void {
    const input = event.target as HTMLInputElement;
    const selectedFile = input?.files && input.files.length > 0 ? input.files[0] : null;

    if (field === 'document_1') {
      this.document1File = selectedFile;
      if (!this.model.document_1_name || !`${this.model.document_1_name}`.trim()) {
        this.model.document_1_name = selectedFile ? selectedFile.name : '';
      }
      return;
    }

    this.document2File = selectedFile;
    if (!this.model.document_2_name || !`${this.model.document_2_name}`.trim()) {
      this.model.document_2_name = selectedFile ? selectedFile.name : '';
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
    if (fm.valid) {
      this.isSubmitting = true;
      const customFieldNames = this.customFields.map((field: any) => field?.field_name);
      const payload = { ...fm.value };
      const customFieldData: any = {};

      payload.module_id = 34;

      // Extract custom fields from payload
      customFieldNames.forEach((fieldName: string) => {
        if (payload.hasOwnProperty(fieldName)) {
          customFieldData[fieldName] = payload[fieldName];
          delete payload[fieldName];
        }
      });

      // Add custom_field JSON object if there are any custom fields
      if (Object.keys(customFieldData).length > 0) {
        payload.custom_field = customFieldData;
      }

      const formData = new FormData();
      Object.keys(payload).forEach((key: string) => {
        this.appendFormDataValue(formData, key, payload[key]);
      });

      if (this.document1File) {
        formData.append('document_1', this.document1File, this.document1File.name);
      }

      if (this.document2File) {
        formData.append('document_2', this.document2File, this.document2File.name);
      }

      this.globalService.addCustomer(formData).subscribe({
        next: (res) => {
          this.model = '';
          this.document1File = null;
          this.document2File = null;
          fm.resetForm();
          this.toastrService.success(res.message, 'Added');
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('Submit error:', err);
          const errorMessage =
            err?.error?.message ||
            err?.message ||
            'Add Lead Failed. Please try again.';

          this.toastrService.danger(errorMessage, 'Add Asset Failed');
          this.isSubmitting = false;
        },
      });


    }

  }
}
