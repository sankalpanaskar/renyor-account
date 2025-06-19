import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-budget-allotment-upload',
  templateUrl: './budget-allotment-upload.component.html',
  styleUrls: ['./budget-allotment-upload.component.scss']
})
export class BudgetAllotmentUploadComponent implements OnInit{
  model:any = [];
  isSubmitting: boolean = false;
  isDownload : boolean = false;
  donoAccountList : any = [];
  loading: boolean = false;

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService
  ) {}

  ngOnInit(): void {
    this.getDonorAccountList();
  }

  getDonorAccountList() {
    this.globalService.getDonorAccount().subscribe({
      next: (data) => {
        this.donoAccountList = data?.donor || []; 
        this.loading = false;
      },
      error: (err) => {
        console.error('Center error:', err);
        this.toastrService.danger(err.message, 'Error');
        this.loading = false;
      },
    });
  }

  donorSelect(value:any){
    // this.donor = value.name;
    // this.donor_id = value.id;
  }




  onDownload(fm:any){
    console.log(fm.value);
    if (fm.valid) {
      this.globalService.saveDonorAccount(fm.value).subscribe({
        next: (res) => {
          fm.resetForm();
          this.toastrService.success(res.message, 'Donor Account Created Successfully!');
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

  onUpload(fm1:any){

  }

}
