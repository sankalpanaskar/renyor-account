import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';
import { HttpClient } from '@angular/common/http';
import { TdsTermOption } from '../../shared/tds-popup/tds-popup.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'ngx-add-vendors',
  templateUrl: './add-vendors.component.html',
  styleUrls: ['./add-vendors.component.scss']
})
export class AddVendorsComponent implements OnInit {
  model: any = { bank_accounts: [] };
  isSubmitting: boolean = false;
  showAccountNumber: boolean[] = [];
  stateList : any = [];
  customFields: any[] = [];
  showPaymentTermsPopup: boolean = false;
  document1File: File | null = null;
  document2File: File | null = null;
  showTdsPopup: boolean = false;
  paymentTerms: Array<{ termName: string; days: string | number }> = [];
  tdsTerms: TdsTermOption[] = [];
  isEditMode = false;
  vendorId: number | null = null;

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.model.bank_accounts = [this.getEmptyBankAccount()];
    this.showAccountNumber = [false];
    this.getState();
    this.getCustomFields();
    this.fetchTdsTerms();
    this.fetchPaymentTerms();
    this.route.queryParams.subscribe((params: any) => {
      const vendorId = Number(params?.vendor_id);
      this.vendorId = Number.isNaN(vendorId) || !vendorId ? null : vendorId;
      this.isEditMode = !!this.vendorId;

      if (this.isEditMode && this.vendorId) {
        this.loadVendorForEdit(this.vendorId);
      }
    });
  }

  private loadVendorForEdit(vendorId: number): void {
    this.isSubmitting = true;
    this.globalService.getVendorListByTenant(46).subscribe({
      next: (res: any) => {
        const vendors = Array.isArray(res?.data) ? res.data : [];
        const matchedVendor = vendors.find((vendor: any) => Number(vendor?.id) === Number(vendorId));

        if (!matchedVendor) {
          this.toastrService.danger('Vendor not found.', 'Edit Vendor');
          this.isSubmitting = false;
          return;
        }

        const bankAccounts = Array.isArray(matchedVendor?.bank_accounts) && matchedVendor.bank_accounts.length
          ? matchedVendor.bank_accounts.map((bank: any) => ({
              id: bank?.id,
              vendor_master_id: bank?.vendor_master_id,
              account_holder_name: bank?.account_holder_name || '',
              bank_name: bank?.bank_name || '',
              account_number: bank?.account_number || '',
              re_enter_account_number: bank?.account_number || bank?.re_enter_account_number || '',
              ifsc: bank?.ifsc || '',
            }))
          : [this.getEmptyBankAccount()];

        this.model = {
          ...this.model,
          ...matchedVendor,
          bank_accounts: bankAccounts,
          group: matchedVendor?.group_name || matchedVendor?.group || '',
          source_of_supply: matchedVendor?.source_of_supply || '',
          billing_state: matchedVendor?.billing_state || '',
          shipping_state: matchedVendor?.shipping_state || '',
          payment_terms: matchedVendor?.payment_terms || '',
          tds: matchedVendor?.tds || '',
          is_msme_registered: matchedVendor?.is_msme_registered === true
            || matchedVendor?.is_msme_registered === 1
            || matchedVendor?.is_msme_registered === '1',
        };

        if (matchedVendor?.custom_field && typeof matchedVendor.custom_field === 'object') {
          Object.keys(matchedVendor.custom_field).forEach((key: string) => {
            this.model[key] = matchedVendor.custom_field[key];
          });
        }

        if (this.tdsTerms.length > 0 && this.model.tds !== undefined && this.model.tds !== null && `${this.model.tds}`.trim() !== '') {
          this.model.tds = this.resolveTdsSelection(this.model.tds);
        }

        this.showAccountNumber = bankAccounts.map(() => false);
        this.isSubmitting = false;
      },
      error: (err: any) => {
        this.toastrService.danger(err?.error?.message || 'Failed to load vendor.', 'Edit Vendor');
        this.isSubmitting = false;
      }
    });
  }

  fetchTdsTerms(): void {
    this.globalService.getTDS().subscribe({
      next: (res: any) => {
        this.tdsTerms = Array.isArray(res?.data)
          ? res.data.map((item: any) => ({
              id: item.id,
              termName: item.tds_name + ' [' + item.tds_percentage + '%]',
              percentage: item.tds_percentage
            }))
          : [];

        if (this.isEditMode && this.model.tds !== undefined && this.model.tds !== null && `${this.model.tds}`.trim() !== '') {
          this.model.tds = this.resolveTdsSelection(this.model.tds);
        }
      },
      error: () => {
        this.tdsTerms = [];
      }
    });
  }

  fetchPaymentTerms(): void {
    this.globalService.getPaymentTerms().subscribe({
      next: (res: any) => {
        this.paymentTerms = Array.isArray(res?.data)
          ? res.data.map((item: any) => ({
              id: item.id,
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

  private getEmptyBankAccount(): any {
    return {
      account_holder_name: '',
      bank_name: '',
      account_number: '',
      re_enter_account_number: '',
      ifsc: '',
    };
  }

  private getBankAccount(index: number): any | null {
    if (!Array.isArray(this.model?.bank_accounts)) {
      return null;
    }

    return this.model.bank_accounts[index] ?? null;
  }

  addBankAccount(): void {
    if (!Array.isArray(this.model.bank_accounts)) {
      this.model.bank_accounts = [];
    }
    this.model.bank_accounts.push(this.getEmptyBankAccount());
    this.showAccountNumber.push(false);
  }

  removeBankAccount(index: number): void {
    if (!Array.isArray(this.model.bank_accounts) || this.model.bank_accounts.length <= 1) {
      return;
    }

    this.model.bank_accounts.splice(index, 1);
    this.showAccountNumber.splice(index, 1);
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
    this.closePaymentTermsPopup();
  }

  openTdsPopup(): void {
    this.showTdsPopup = true;
  }

  closeTdsPopup(): void {
    this.showTdsPopup = false;
  }

  onTdsTermsChanged(terms: TdsTermOption[]): void {
    this.tdsTerms = terms;
  }

  onTdsTermSelected(term: string | number): void {
    this.model.tds = term;
    this.closeTdsPopup();
  }

  private resolveTdsSelection(rawValue: any): any {
    const normalizedValue = `${rawValue ?? ''}`.trim();
    if (!normalizedValue || !Array.isArray(this.tdsTerms) || this.tdsTerms.length === 0) {
      return rawValue;
    }

    const numericRawValue = Number(normalizedValue);
    const matchedTerm = this.tdsTerms.find((term: any) => {
      const termId = `${term?.id ?? ''}`.trim();
      const termPercentage = `${term?.percentage ?? ''}`.trim();
      const termName = `${term?.termName ?? ''}`.trim();

      return termId === normalizedValue
        || termPercentage === normalizedValue
        || (!Number.isNaN(numericRawValue) && Number(term?.id) === numericRawValue)
        || (!Number.isNaN(numericRawValue) && Number(term?.percentage) === numericRawValue)
        || termName.toLowerCase().includes(normalizedValue.toLowerCase());
    });

    return matchedTerm?.id ?? rawValue;
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
  }

  onPhoneInputChange(field: 'work_phone' | 'mobile_no'): void {
    const digitsOnly = `${this.model?.[field] ?? ''}`.replace(/\D/g, '').slice(0, 10);
    this.model[field] = digitsOnly;
  }

  onAccountNumberInputChange(index: number, field: 'account_number' | 're_enter_account_number'): void {
    const bankAccount = this.getBankAccount(index);

    if (!bankAccount) {
      return;
    }

    const digitsOnly = `${bankAccount[field] ?? ''}`.replace(/\D/g, '');
    bankAccount[field] = digitsOnly;
  }

  allowOnlyDigits(event: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];

    if (allowedKeys.includes(event.key)) {
      return;
    }

    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  onAccountNumberPaste(event: ClipboardEvent, index: number, field: 'account_number' | 're_enter_account_number'): void {
    event.preventDefault();
    const bankAccount = this.getBankAccount(index);

    if (!bankAccount) {
      return;
    }

    const pasted = event.clipboardData?.getData('text') ?? '';
    const digitsOnly = pasted.replace(/\D/g, '');
    bankAccount[field] = `${bankAccount[field] ?? ''}${digitsOnly}`;
  }

  toggleAccountNumberVisibility(index: number): void {
    this.showAccountNumber[index] = !this.showAccountNumber[index];
  }

  hasAccountNumberMismatch(index: number): boolean {
    const accountNumber = `${this.model?.bank_accounts?.[index]?.account_number ?? ''}`;
    const reEnterAccountNumber = `${this.model?.bank_accounts?.[index]?.re_enter_account_number ?? ''}`;

    if (!accountNumber || !reEnterAccountNumber) {
      return false;
    }

    return accountNumber !== reEnterAccountNumber;
  }

  hasAnyAccountNumberMismatch(): boolean {
    return Array.isArray(this.model?.bank_accounts)
      && this.model.bank_accounts.some((_: any, index: number) => this.hasAccountNumberMismatch(index));
  }

  onFileChange(files: File[], field: 'document_1' | 'document_2'): void {
    const selectedFile = files && files.length > 0 ? files[0] : null;
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
    if (this.hasAnyAccountNumberMismatch()) {
      this.toastrService.danger('Re-enter Account Number must match Account Number.', 'Validation Failed');
      return;
    }

    if (!this.isDocumentValid()) {
      this.toastrService.danger('Document 1 and Document 2 name and file are required.', 'Validation Failed');
      return;
    }

    if (fm.valid) {
      this.isSubmitting = true;
      const customFieldNames = this.customFields.map((field: any) => field?.field_name);
      const payload = { ...fm.value };
      const customFieldData: any = {};

      payload.bank_accounts = (this.model.bank_accounts || []).map((bank: any) => ({
        ...(bank?.id ? { id: bank.id } : {}),
        ...(bank?.vendor_master_id ? { vendor_master_id: bank.vendor_master_id } : {}),
        account_holder_name: bank?.account_holder_name ?? '',
        bank_name: bank?.bank_name ?? '',
        account_number: bank?.account_number ?? '',
        re_enter_account_number: bank?.re_enter_account_number ?? '',
        ifsc: bank?.ifsc ?? '',
      }));

      Object.keys(payload).forEach((key: string) => {
        if (/^(account_holder_name|bank_name|account_number|re_enter_account_number|ifsc)_\d+$/.test(key)) {
          delete payload[key];
        }
      });

      payload.module_id = 46;

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

      if (this.isEditMode && this.vendorId) {
        formData.append('vendor_id', `${this.vendorId}`);
      }

      const request$ = this.isEditMode
        ? this.globalService.updateVendor(formData)
        : this.globalService.addVendor(formData);

      request$.subscribe({
        next: (res) => {
          if (this.isEditMode) {
            this.toastrService.success(res.message, 'Updated');
            this.router.navigate(['pages/purchase/vendor-list']);
          } else {
            this.model = { bank_accounts: [this.getEmptyBankAccount()] };
            this.showAccountNumber = [false];
            this.document1File = null;
            this.document2File = null;
            fm.resetForm(this.model);
            this.toastrService.success(res.message, 'Added');
          }
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

  isDocumentValid(): boolean {
    const doc1Name = `${this.model?.document_1_name || ''}`.trim();
    const doc2Name = `${this.model?.document_2_name || ''}`.trim();
    const hasDocument1 = !!this.document1File || !!`${this.model?.document_1 || ''}`.trim();
    const hasDocument2 = !!this.document2File || !!`${this.model?.document_2 || ''}`.trim();

    return !!doc1Name && !!doc2Name && hasDocument1 && hasDocument2;
  }
}
