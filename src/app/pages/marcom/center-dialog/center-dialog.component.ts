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
  isSubmitting: boolean = false;

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
      
    this.globalService.getCenterMarcon(this.globalService.user_id).subscribe({
      next: (res) => {
        this.centerList = res.data.centers;
        // console.log('Center Data:', this.centerList);
      },
      error: (err) => {
        console.error('Center error:', err);
        this.toastrService.danger(err.message, 'Error');
      },
    });
  }

  //   centerSelect(centerID: any) {

  // }

  cancel() {
    // closes without returning anything
    this.dialogRef.close();
  }

onSubmit(fm:any){

  if(fm.valid){
       
    fm.value.selected_leads = this.rows;
      this.isSubmitting = true;
      this.globalService.alignMarcomLeads(fm.value).subscribe({
        next: (res) => {
          this.model = '';
          fm.resetForm();
          this.toastrService.success(res.message, 'Added');
              this.dialogRef.close();
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('distric error:', err);
          this.toastrService.danger(err.message, 'Error');
          this.isSubmitting = false;
        },
      });

  
    
  }
}
}
