import { Component } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbDialogRef, NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-add-category-form',
  templateUrl: './add-category-form.component.html',
  styleUrls: ['./add-category-form.component.scss']
})
export class AddCategoryFormComponent {
  public categoryData: any;

  model: any = {
    id: null,
    category_name: '',
  };

  isSubmitting = false;
  isEdit = false;
  dialogTitle = 'Add Category';

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
    private dialogRef: NbDialogRef<AddCategoryFormComponent>,
  ) { }

  ngOnInit(): void {
    console.log("cat data a", this.categoryData);
    if (this.categoryData) {
      console.log("cat data", this.categoryData);
      // ✅ Edit mode
      this.isEdit = true;
      this.dialogTitle = 'Edit Category';
      this.model.id = this.categoryData.id;
      this.model.category_name = this.categoryData.asset_class_name;
    } else {
      // ✅ Add mode
      this.isEdit = false;
      this.dialogTitle = 'Add Category';
    }
  }

  onSubmit(fm: any) {
    if (!fm.valid) {
      return;
    }

    this.isSubmitting = true;

    // 🔹 Common payload fields
    const basePayload: any = {
      asset_class_name: this.model.category_name,
    };

    // 🔹 If editing → call UPDATE API
    if (this.isEdit) {
      const payload = {
        ...basePayload,
        id: this.model.id,
        updated_by: this.globalService.fullName,
      };

      this.globalService.updateCategory(payload).subscribe({
        next: (res: any) => {
          this.isSubmitting = false;
          this.toastrService.success(
            res?.message || 'Category updated successfully.',
            'Updated',
          );
          this.dialogRef.close(true); // notify parent to refresh
        },
        error: (err) => {
          this.isSubmitting = false;
          const errorMessage =
            err?.error?.message ||
            err?.message ||
            'Update Category Failed. Please try again.';
          this.toastrService.danger(errorMessage, 'Update Category Failed');
        },
      });

    } else {
      // 🔹 If adding → call ADD API
      const payload = {
        ...basePayload,
        created_by: this.globalService.fullName,
      };

      this.globalService.submitAddCategory(payload).subscribe({
        next: (res: any) => {
          this.isSubmitting = false;
          this.toastrService.success(
            res?.message || 'Category added successfully.',
            'Added',
          );
          this.dialogRef.close(true); // notify parent to refresh
        },
        error: (err) => {
          this.isSubmitting = false;
          const errorMessage =
            err?.error?.message ||
            err?.message ||
            'Add Category Failed. Please try again.';
          this.toastrService.danger(errorMessage, 'Add Category Failed');
        },
      });
    }
  }
}
