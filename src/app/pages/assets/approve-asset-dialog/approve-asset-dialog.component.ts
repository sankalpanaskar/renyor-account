import { Component, Inject } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NB_DIALOG_CONFIG, NbDialogRef, NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-approve-asset-dialog',
  templateUrl: './approve-asset-dialog.component.html',
  styleUrls: ['./approve-asset-dialog.component.scss']
})
export class ApproveAssetDialogComponent {
  model: any = [];
  isSubmitting = false;
  assetData: any;

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
    protected dialogRef: NbDialogRef<ApproveAssetDialogComponent>,
    @Inject(NB_DIALOG_CONFIG) public data: any
  ) {
    this.assetData = this.data; // receive data from parent
  }


  closeDialog() {
    this.dialogRef.close();
  }


  onSubmit(fm: any) {
    if (fm.valid) {
      fm.value.role_id = this.globalService.role_id;
      fm.value.id = this.assetData.id;
      this.isSubmitting = true;
      this.globalService.submitApproveAsset(fm.value).subscribe({
        next: (res) => {
          this.model = '';
          fm.resetForm();
          // ✅ Close dialog and send updated data back to parent
          this.dialogRef.close(fm.value);
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
