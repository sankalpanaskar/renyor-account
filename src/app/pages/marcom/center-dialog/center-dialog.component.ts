import { Component, Inject, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NB_DIALOG_CONFIG, NbDialogRef, NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-center-dialog',
  templateUrl: './center-dialog.component.html',
  styleUrls: ['./center-dialog.component.scss']
})
export class CenterDialogComponent implements OnInit {
  rows: any[] = [];
  model:any = [];
  centerList: any = [];

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
    @Inject(NB_DIALOG_CONFIG) public data: any,
    protected dialogRef: NbDialogRef<CenterDialogComponent>
  ) {}

  ngOnInit(): void {
    // NB_DIALOG_CONFIG gives you an object with { context: { data: [...] } }
    this.rows = this.data;
    console.log("Dialog received rows:", this.rows);
    this.loadCenters();
  }

    loadCenters(): void {
    this.globalService.getCenterBulk().subscribe({
      next: (data) => {
        this.centerList = data.data?.centers || [];
        // console.log('Center Data:', this.centerList);
      },
      error: (err) => {
        console.error('Center error:', err);
        this.toastrService.danger(err.message, 'Error');
      },
    });
  }

    centerSelect(centerID: any) {

  }

  cancel() {
    // closes without returning anything
    this.dialogRef.close();
  }

onSubmit(fm:any){
  if(fm.valid){
    console.log("data values",fm.value);
  }
}
}
