import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService, NbDialogRef } from '@nebular/theme';

@Component({
  selector: 'ngx-add-brand',
  templateUrl: './add-brand.component.html',
  styleUrls: ['./add-brand.component.scss'],
})
export class AddBrandComponent implements OnInit {
  // filled by Nebular dialog context: { brandData: ... }
  public brandData: any;

  model: any = {
    brand_name: '',
  };

  isSubmitting = false;
  isEdit = false;       // 🔹 Add vs Edit flag
  dialogTitle = 'Add Brand';

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
    private dialogRef: NbDialogRef<AddBrandComponent>,  // 👈 to close dialog
  ) {}

  ngOnInit(): void {
    // If brandData is passed from BrandListComponent → EDIT mode
    if (this.brandData) {
      this.isEdit = true;
      this.dialogTitle = 'Edit Brand';

      // Prefill fields from brandData
      this.model.brand_name = this.brandData.brand_name;
      // If you need id for update:
      this.model.id = this.brandData.id;
    } else {
      this.isEdit = false;
      this.dialogTitle = 'Add Brand';
    }
  }

  onSubmit(fm: any) {
    if (!fm.valid) {
      return;
    }

    this.isSubmitting = true;

    const payload: any = {
      brand_name: this.model.brand_name,
      created_by: this.globalService.fullName,
    };

    // If editing, include id (backend can treat this as update)
    if (this.isEdit && this.model.id) {
      payload.id = this.model.id;
    }

    this.globalService.submitAddBrand(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.toastrService.success(
          res?.message || (this.isEdit ? 'Brand updated successfully.' : 'Brand added successfully.'),
          this.isEdit ? 'Updated' : 'Added'
        );

        // Reset local form (optional)
        fm.resetForm();
        this.model = { brand_name: '' };

        // ✅ Close dialog and notify parent to refresh
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Submit error:', err);
        const errorMessage =
          err?.error?.message ||
          err?.message ||
          (this.isEdit ? 'Update Brand Failed. Please try again.' : 'Add Brand Failed. Please try again.');

        this.toastrService.danger(errorMessage, this.isEdit ? 'Update Brand Failed' : 'Add Brand Failed');
      },
    });
  }
}
