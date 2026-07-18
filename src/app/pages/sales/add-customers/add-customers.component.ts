// ...existing code up to the end of the first AddCustomersComponent class...
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';

type CustomerDocumentField = 'document_1' | 'document_2';
type DocumentPreviewType = 'image' | 'pdf' | 'file';

@Component({
  selector: 'ngx-add-customers',
  templateUrl: './add-customers.component.html',
  styleUrls: ['./add-customers.component.scss']
})
export class AddCustomersComponent implements OnInit, OnDestroy {
  isEditMode = false;
  pageTitle = 'Add Customer';
  submitButtonLabel = 'Save';
  model: any = {
    customer_type: 'Individual'
  };
  isSubmitting: boolean = false;
  stateList : Array<{ name: string; code: string }> = [];
  customFields: any[] = [];
  showPaymentTermsPopup: boolean = false;
  document1File: File | null = null;
  document2File: File | null = null;
  documentObjectUrls: Partial<Record<CustomerDocumentField, string>> = {};
  showDocumentPreview = false;
  selectedDocumentUrl = '';
  selectedDocumentViewerUrl: SafeResourceUrl | string = '';
  selectedDocumentName = '';
  selectedDocumentType: DocumentPreviewType = 'file';
  paymentTerms: any[] = [];
  tdsTerms: any[] = [];

  gstTreatmentOptions: string[] = [
    'Registered Business - Regular Business that is registered under GST',
    'Registered Business - Composition Business that is registered under the composition scheme in GST',
    'Unregistered Business - Business that has not been registered under GST',
    'Consumer - A customer who is a regular consumer',
    'Overseas - Persons with whom you do import or export of supplies outside India',
    'Special Economic Zone - Business (Unit) that is located in a Special Economic Zone (SEZ) of India or a SEZ Developer',
    'Deemed Export - Supply of goods to an Export Oriented Unit or against Advanced Authorization/Export Promotion Capital Goods',
    'Tax Deductor - Departments of the State/Central government, governmental agencies or local authorities',
    'SEZ Developer - A person/organisation who owns at least 26% of the equity in creating business units in a Special Economic Zone (SEZ)',
    'Input Service Distributor - Input Service Distributor (ISD) is an office that receives tax invoices for services used by the company in different states under the same PAN',
  ];

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.restoreEditState();
    this.setDefaultCustomerValues();
    this.configureModeLabels();
    this.getState();
    this.getCustomFields();
    this.fetchPaymentTerms();
  }

  ngOnDestroy(): void {
    this.revokeAllDocumentObjectUrls();
  }

  private restoreEditState(): void {
    const navigationState = history.state || {};
    const customerData = navigationState?.customerData;

    if (navigationState?.isEditMode && customerData) {
      const customFieldValues = this.parseCustomFieldValues(customerData?.custom_field);
      this.isEditMode = true;
      this.model = {
        ...this.model,
        ...customerData,
        ...customFieldValues,
        customer_id: customerData?.id,
        customer_group: customerData?.customer_group || customerData?.group || '',
        customer_type: customerData?.customer_type || this.model.customer_type,
        dob_doi: customerData?.dob_doi || customerData?.dob || customerData?.doi || '',
      };
    }
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
      return value.reduce((values: Record<string, any>, item: any) => {
        if (!item || typeof item !== 'object') {
          return values;
        }

        const key = item?.field_name ?? item?.name ?? item?.key;
        if (key) {
          values[key] = item?.field_value ?? item?.value ?? '';
        }
        return values;
      }, {});
    }

    return typeof value === 'object' ? { ...value } : {};
  }

  private setDefaultCustomerValues(): void {
    this.model = {
      customer_type: 'Individual',
      ...this.model,
    };
  }

  private configureModeLabels(): void {
    if (this.isEditMode) {
      this.pageTitle = 'Update Customer';
      this.submitButtonLabel = 'Update';
      return;
    }

    this.pageTitle = 'Add Customer';
    this.submitButtonLabel = 'Save';
  }

  fetchPaymentTerms(): void {
    this.globalService.getPaymentTerms().subscribe({
      next: (res: any) => {
        this.paymentTerms = Array.isArray(res?.data)
          ? res.data.map((item: any) => ({
              termName: item.term_name,
              days: item.no_of_days
            }))
          : [];
      },
      error: () => {
        this.paymentTerms = [];
      }
    });
  }

  onGstTreatmentChange(value: string) {
    this.model.gst_treatment = value;
  }

  onSourceOfSupplyChange(value: string) {
    this.model.source_of_supply = value;
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

          const hasSavedValue = this.model[key] !== undefined && this.model[key] !== null;
          if (this.getFieldType(field) === 'checkbox') {
            this.model[key] = this.parseCheckboxDefaultValues(
              hasSavedValue ? this.model[key] : field?.default_value
            );
          } else if (!hasSavedValue) {
            this.model[key] = field?.default_value ?? '';
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

    if (type === 'datepicker') {
      return 'date';
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

  private formatDateForPayload(value: any): string {
    if (!value) {
      return '';
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) {
        return '';
      }

      const ddMMyyyyMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (ddMMyyyyMatch) {
        return trimmed;
      }

      const parsedFromString = new Date(trimmed);
      if (!Number.isNaN(parsedFromString.getTime())) {
        const day = `${parsedFromString.getDate()}`.padStart(2, '0');
        const month = `${parsedFromString.getMonth() + 1}`.padStart(2, '0');
        const year = parsedFromString.getFullYear();
        return `${day}/${month}/${year}`;
      }

      return trimmed;
    }

    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      const day = `${value.getDate()}`.padStart(2, '0');
      const month = `${value.getMonth() + 1}`.padStart(2, '0');
      const year = value.getFullYear();
      return `${day}/${month}/${year}`;
    }

    return `${value}`;
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

  onFileChange(files: File[], field: CustomerDocumentField): void {
    const selectedFile = files && files.length > 0 ? files[0] : null;
    this.setDocumentObjectUrl(field, selectedFile);

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

  hasSelectedDocument(field: CustomerDocumentField): boolean {
    if (field === 'document_1') {
      return !!(this.document1File || `${this.model?.document_1 || ''}`.trim());
    }

    return !!(this.document2File || `${this.model?.document_2 || ''}`.trim());
  }

  isDocumentInvalid(field: CustomerDocumentField, fm: any): boolean {
    return !!fm?.submitted && !this.hasSelectedDocument(field);
  }

  getDocumentPreviewUrl(field: CustomerDocumentField): string {
    const objectUrl = this.documentObjectUrls[field];
    if (objectUrl) {
      return objectUrl;
    }

    return this.getDocumentUrl(`${this.model?.[field] || ''}`);
  }

  getDocumentPreviewType(field: CustomerDocumentField): DocumentPreviewType {
    const selectedFile = field === 'document_1' ? this.document1File : this.document2File;
    return this.resolveDocumentType(selectedFile?.name || `${this.model?.[field] || ''}`, selectedFile?.type);
  }

  getDocumentDisplayName(field: CustomerDocumentField): string {
    const selectedFile = field === 'document_1' ? this.document1File : this.document2File;
    const nameField = `${field}_name`;
    return `${this.model?.[nameField] || selectedFile?.name || (field === 'document_1' ? 'Document 1' : 'Document 2')}`;
  }

  openDocumentPreview(field: CustomerDocumentField): void {
    const previewUrl = this.getDocumentPreviewUrl(field);
    if (!previewUrl) {
      return;
    }

    this.selectedDocumentUrl = previewUrl;
    this.selectedDocumentName = this.getDocumentDisplayName(field);
    this.selectedDocumentType = this.getDocumentPreviewType(field);
    this.selectedDocumentViewerUrl = this.selectedDocumentType === 'pdf'
      ? this.sanitizer.bypassSecurityTrustResourceUrl(previewUrl)
      : previewUrl;
    this.showDocumentPreview = true;
  }

  closeDocumentPreview(): void {
    this.showDocumentPreview = false;
    this.selectedDocumentUrl = '';
    this.selectedDocumentViewerUrl = '';
    this.selectedDocumentName = '';
    this.selectedDocumentType = 'file';
  }

  openDocumentInNewTab(): void {
    if (this.selectedDocumentUrl) {
      window.open(this.selectedDocumentUrl, '_blank', 'noopener,noreferrer');
    }
  }

  private setDocumentObjectUrl(field: CustomerDocumentField, file: File | null): void {
    this.revokeDocumentObjectUrl(field);
    if (file) {
      this.documentObjectUrls[field] = URL.createObjectURL(file);
    }
  }

  private revokeDocumentObjectUrl(field: CustomerDocumentField): void {
    const objectUrl = this.documentObjectUrls[field];
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      delete this.documentObjectUrls[field];
    }
  }

  private revokeAllDocumentObjectUrls(): void {
    this.revokeDocumentObjectUrl('document_1');
    this.revokeDocumentObjectUrl('document_2');
  }

  private getDocumentUrl(path: string): string {
    if (!path) {
      return '';
    }

    if (/^(https?:|blob:|data:)/i.test(path)) {
      return path;
    }

    const baseUrl = (environment as any)?.apiBaseUrl || '';
    return `${baseUrl}${path}`.replace(/([^:]\/)\/+/g, '$1');
  }

  private resolveDocumentType(pathOrName: string, mimeType = ''): DocumentPreviewType {
    const normalizedMimeType = `${mimeType || ''}`.toLowerCase();
    if (normalizedMimeType.startsWith('image/')) {
      return 'image';
    }
    if (normalizedMimeType === 'application/pdf') {
      return 'pdf';
    }

    const normalizedPath = `${pathOrName || ''}`.split(/[?#]/)[0].toLowerCase();
    if (/\.(png|jpg|jpeg|gif|webp|bmp|svg)$/.test(normalizedPath)) {
      return 'image';
    }
    if (normalizedPath.endsWith('.pdf')) {
      return 'pdf';
    }

    return 'file';
  }

  onDocumentFileSelected(file: File, docField: 'document_1' | 'document_2') {
    if (docField === 'document_1') {
      this.document1File = file;
    } else if (docField === 'document_2') {
      this.document2File = file;
    }
    // Optionally, you can also store in the model:
    // this.model[docField + '_file'] = file;
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
      if (!this.hasSelectedDocument('document_1') || !this.hasSelectedDocument('document_2')) {
        this.toastrService.danger('Please upload both documents before submitting.', 'Validation');
        return;
      }

      this.isSubmitting = true;
      const customFieldNames = this.customFields.map((field: any) => field?.field_name);
      const payload = { ...fm.value };
      const customFieldData: any = {};
      const customerType = `${payload.customer_type || ''}`.trim();
      const dateKey = customerType === 'Business' ? 'doi' : 'dob';
      const formattedDate = this.formatDateForPayload(payload.dob_doi);

      payload.module_id = 34;
      if (this.isEditMode && this.model.customer_id) {
        payload.customer_id = this.model.customer_id;
      }
      delete payload.dob_doi;
      if (formattedDate) {
        payload[dateKey] = formattedDate;
      }

      // Extract custom fields from payload
      customFieldNames.forEach((fieldName: string) => {
        if (payload.hasOwnProperty(fieldName)) {
          customFieldData[fieldName] = payload[fieldName];
          delete payload[fieldName];
        } else if (this.model.hasOwnProperty(fieldName)) {
          customFieldData[fieldName] = this.model[fieldName];
        }
      });

      // Add custom_field JSON object if there are any custom fields
      if (Object.keys(customFieldData).length > 0) {
        payload.custom_field = customFieldData;
      }

      // Existing document paths must never be sent as replacement files.
      // Binary fields are appended below only when the user selects a new File.
      delete payload.document_1;
      delete payload.document_2;

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

      if (this.isEditMode && payload.customer_id) {
        formData.append('customer_id', `${payload.customer_id}`);
      }

      const customerRequest$ = this.isEditMode
        ? this.globalService.updateCustomer(formData)
        : this.globalService.addCustomer(formData);

      customerRequest$.subscribe({
        next: (res) => {
          const wasEditMode = this.isEditMode;
          const toastTitle = wasEditMode ? 'Updated' : 'Added';
          this.model = {
            customer_type: 'Individual'
          };
          this.document1File = null;
          this.document2File = null;
          this.closeDocumentPreview();
          this.revokeAllDocumentObjectUrls();
          this.isEditMode = false;
          this.configureModeLabels();
          fm.resetForm();
          this.setDefaultCustomerValues();
          this.toastrService.success(res.message, toastTitle);
          this.isSubmitting = false;
          if (wasEditMode) {
            this.router.navigate(['/pages/sales/customer-list']);
          }
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
