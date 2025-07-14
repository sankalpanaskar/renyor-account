import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-add-donor',
  templateUrl: './add-donor.component.html',
  styleUrls: ['./add-donor.component.scss']
})
export class AddDonorComponent implements OnInit{
  model:any = [];
  isSubmitting: boolean = false;

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService
  ) {}

  ngOnInit(): void {
    
  }

  onSubmit(fm:any){
    //console.log(fm.value);
    if (fm.valid) {
      this.globalService.insertDonor(fm.value).subscribe({
        next: (res) => {
          fm.resetForm();
          this.toastrService.success(res.message, 'Donor Created Successfully!');
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
