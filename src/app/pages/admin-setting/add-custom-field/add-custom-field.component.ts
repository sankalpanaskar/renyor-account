import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'ngx-add-custom-field',
  templateUrl: './add-custom-field.component.html',
  styleUrls: ['./add-custom-field.component.scss']
})
export class AddCustomFieldComponent implements OnInit {
  model: any = [];
  isSubmitting: boolean = false;
  stateList : any = [];
  selectedFile: File | null = null;
  isEditMode = false;
  customFieldId: number | null = null;


  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.getState();
    this.route.queryParams.subscribe((params: any) => {
      const fieldId = Number(params?.field_id);
      this.customFieldId = Number.isNaN(fieldId) || !fieldId ? null : fieldId;
      this.isEditMode = !!this.customFieldId;

      if (this.isEditMode && this.customFieldId) {
        this.loadCustomFieldForEdit(this.customFieldId);
      }
    });
  }

  private normalizeFieldType(fieldType: any = this.model?.field_type): string {
    return `${fieldType || ''}`.trim().toLowerCase().replace(/[\s_-]+/g, '');
  }

  supportsFieldOptions(fieldType: any = this.model?.field_type): boolean {
    return ['checkbox', 'select', 'radio', 'radiobutton'].includes(this.normalizeFieldType(fieldType));
  }

  supportsPlaceholder(fieldType: any = this.model?.field_type): boolean {
    const type = this.normalizeFieldType(fieldType);
    return !!type && !['checkbox', 'radio', 'radiobutton'].includes(type);
  }

  supportsLengthValidation(fieldType: any = this.model?.field_type): boolean {
    return ['text', 'textarea'].includes(this.normalizeFieldType(fieldType));
  }

  onFieldTypeChange(fieldType: any): void {
    this.model.field_type = fieldType;

    if (!this.supportsFieldOptions(fieldType)) {
      this.model.field_options = '';
    }
    if (!this.supportsPlaceholder(fieldType)) {
      this.model.placeholder = '';
    }
    if (!this.supportsLengthValidation(fieldType)) {
      this.model.min_length = '';
      this.model.max_length = '';
    }
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

  onFileChange(event: any) {
  if (event.target.files && event.target.files.length > 0) {
    this.selectedFile = event.target.files[0];
  }
}

  private loadCustomFieldForEdit(fieldId: number): void {
    this.isSubmitting = true;
    this.globalService.fetchCustomFieldsByModule().subscribe({
      next: (res: any) => {
        const fields = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];

        const matchedField = fields.find((field: any) => Number(field?.id) === Number(fieldId));
        if (!matchedField) {
          this.toastrService.danger('Custom field not found.', 'Edit Custom Field');
          this.isSubmitting = false;
          return;
        }

        this.model = {
          field_name: matchedField?.field_name || '',
          field_label: matchedField?.field_label || '',
          field_type: matchedField?.field_type || '',
          field_options: matchedField?.field_options || '',
          placeholder: matchedField?.placeholder || '',
          default_value: matchedField?.default_value || '',
          is_required: matchedField?.is_required != null ? String(matchedField.is_required) : '',
          min_length: matchedField?.min_length,
          max_length: matchedField?.max_length,
          show_in_form: matchedField?.show_in_form != null ? String(matchedField.show_in_form) : '',
          show_in_list: matchedField?.show_in_list != null ? String(matchedField.show_in_list) : '',
        };
        this.isSubmitting = false;
      },
      error: (err: any) => {
        this.toastrService.danger(err?.error?.message || 'Failed to load custom field.', 'Edit Custom Field');
        this.isSubmitting = false;
      }
    });
  }


  onSubmit(fm: any) {
  if (fm.invalid) return;

  const payload = {
    ...fm.value,
    field_options: this.supportsFieldOptions() ? (this.model.field_options || '') : '',
    placeholder: this.supportsPlaceholder() ? (this.model.placeholder || '') : '',
    min_length: this.supportsLengthValidation() ? (this.model.min_length ?? '') : '',
    max_length: this.supportsLengthValidation() ? (this.model.max_length ?? '') : '',
  };
  delete payload.module_id;
  if (this.isEditMode && this.customFieldId) {
    payload.custom_field_id = this.customFieldId;
  }

  this.isSubmitting = true;
  const request$ = this.isEditMode
    ? this.globalService.updateCustomField(payload)
    : this.globalService.addCustomField(payload);

  request$.subscribe({
    next: (res) => { 
      this.toastrService.success(res.message, 'Success!');
      if (this.isEditMode) {
        this.router.navigate(['pages/admin-setting/custom-field-list']);
      } else {
        fm.resetForm();
      }
      this.isSubmitting = false; 
    },
    error: (err) => { 
      if (err.status === 409) {
        // 🔴 Duplicate entry
        this.toastrService.danger(
          err.error?.message || 'Duplicate record already exists',
          'Duplicate (409)'
        );
      } else {
        // 🔵 Other errors
        this.toastrService.danger(
          err.error?.message || 'Something went wrong',
          `Error ${err.status}`
        );
      }
      this.isSubmitting = false; 
    }
  });
}


}
