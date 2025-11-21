import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService, NbDialogRef } from '@nebular/theme';

@Component({
  selector: 'ngx-add-brand',
  templateUrl: './add-brand.component.html',
  styleUrls: ['./add-brand.component.scss'],
})
export class AddBrandComponent implements OnInit {
  // Filled from dialog context: { brandData }
  public brandData: any;

  model: any = {
    id: null,
    brand_name: '',
  };

  isSubmitting = false;
  isEdit = false;
  dialogTitle = 'Add Brand';

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
    private dialogRef: NbDialogRef<AddBrandComponent>,
  ) {}

  ngOnInit(): void {
    if (this.brandData) {
      // ✅ Edit mode
      this.isEdit = true;
      this.dialogTitle = 'Edit Brand';
      this.model.id = this.brandData.id;
      this.model.brand_name = this.brandData.brand_name;
    } else {
      // ✅ Add mode
      this.isEdit = false;
      this.dialogTitle = 'Add Brand';
    }
  }

  onSubmit(fm: any) {
    if (!fm.valid) {
      return;
    }

    this.isSubmitting = true;

    // 🔹 Common payload fields
    const basePayload: any = {
      brand_name: this.model.brand_name,
    };

    // 🔹 If editing → call UPDATE API
    if (this.isEdit) {
      const payload = {
        ...basePayload,
        id: this.model.id,
        updated_by: this.globalService.fullName,
      };

      this.globalService.updateBrand(payload).subscribe({
        next: (res: any) => {
          this.isSubmitting = false;
          this.toastrService.success(
            res?.message || 'Brand updated successfully.',
            'Updated',
          );
          this.dialogRef.close(true); // notify parent to refresh
        },
        error: (err) => {
          this.isSubmitting = false;
          const errorMessage =
            err?.error?.message ||
            err?.message ||
            'Update Brand Failed. Please try again.';
          this.toastrService.danger(errorMessage, 'Update Brand Failed');
        },
      });

    } else {
      // 🔹 If adding → call ADD API
      const payload = {
        ...basePayload,
        created_by: this.globalService.fullName,
      };

      this.globalService.submitAddBrand(payload).subscribe({
        next: (res: any) => {
          this.isSubmitting = false;
          this.toastrService.success(
            res?.message || 'Brand added successfully.',
            'Added',
          );
          this.dialogRef.close(true); // notify parent to refresh
        },
        error: (err) => {
          this.isSubmitting = false;
          const errorMessage =
            err?.error?.message ||
            err?.message ||
            'Add Brand Failed. Please try again.';
          this.toastrService.danger(errorMessage, 'Add Brand Failed');
        },
      });
    }
  }
}
