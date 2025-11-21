import { Component } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbDialogRef, NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-add-item-form',
  templateUrl: './add-item-form.component.html',
  styleUrls: ['./add-item-form.component.scss']
})
export class AddItemFormComponent {
// filled by Nebular dialog context: { brandData: ... }
  public itemData: any;

  model: any = [];

  isSubmitting = false;
  isEdit = false;       // 🔹 Add vs Edit flag
  dialogTitle = 'Add Item';
  classList: any = [];

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
    private dialogRef: NbDialogRef<AddItemFormComponent>,  // 👈 to close dialog
  ) {}

  ngOnInit(): void {
    console.log("item date",this.itemData);
    this.loadClass();
    // If brandData is passed from BrandListComponent → EDIT mode
    if (this.itemData) {
      this.isEdit = true;
      this.dialogTitle = 'Edit Item';
      this.model.asset_class = this.itemData.class_id;
      this.model.item_name = this.itemData.sub_class_name;
    } else {
      this.isEdit = false;
      this.dialogTitle = 'Add Item';
    }
  }

  loadClass(){
    this.isSubmitting = true;
    this.globalService.getClass().subscribe({
      next:(res:any) => {
        this.classList = res.data.class_name;
        this.isSubmitting = false;
        
      },
      error:(res:any) => {
      this.isSubmitting = false;

      }
    })
  }

  onSubmit(fm: any) {
    if (!fm.valid) {
      return;
    }

    this.isSubmitting = true;

    // 🔹 Common payload fields
    const basePayload: any = {
      class_id: this.model.asset_class,
      sub_class_name : this.model.item_name,
      created_by: this.globalService.fullName
      };

    // 🔹 If editing → call UPDATE API
    if (this.isEdit) {
      const payload = {
        ...basePayload,
        sub_class_id : this.itemData.sub_class_id,
        updated_by: this.globalService.fullName,
      };

      this.globalService.updateItem(payload).subscribe({
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

      this.globalService.submitAddItem(payload).subscribe({
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

