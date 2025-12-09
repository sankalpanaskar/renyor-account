import { Component, Inject } from '@angular/core';
import { NbDialogRef, NB_DIALOG_CONFIG } from '@nebular/theme';

@Component({
  selector: 'ngx-excel-error-dialog',
  templateUrl: './excel-error-dialog.component.html',
  styleUrls: ['./excel-error-dialog.component.scss']
})
export class ExcelErrorDialogComponent {

  errors: string[] = [];   // ✅ ADD THIS PROPERTY

  constructor(
    @Inject(NbDialogRef) public dialogRef: any,
    @Inject(NB_DIALOG_CONFIG) public config: any   // ✅ Inject full config
  ) {
    // Extract errors from context
    this.errors = config.context?.errors || [];
  }

  close() {
    this.dialogRef.close();
  }
}
