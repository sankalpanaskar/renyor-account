import { Component, Inject, OnInit } from '@angular/core';
import { NB_DIALOG_CONFIG, NbDialogRef } from '@nebular/theme';

@Component({
  selector: 'ngx-view-asset-dialog',
  templateUrl: './view-asset-dialog.component.html',
  styleUrls: ['./view-asset-dialog.component.scss']
})
export class ViewAssetDialogComponent implements OnInit {
  assetData: any;

  constructor(
    protected dialogRef: NbDialogRef<ViewAssetDialogComponent>,
    @Inject(NB_DIALOG_CONFIG) public data: any
  ) {
    this.assetData = this.data; // receive data from parent
  }
  ngOnInit(): void {
    console.log("data---",this.assetData);
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
