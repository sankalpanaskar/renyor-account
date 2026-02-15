import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'ngx-add-package',
  templateUrl: './add-package.component.html',
  styleUrls: ['./add-package.component.scss']
})
export class AddPackageComponent implements OnInit {
  model: any = [];
  isSubmitting: boolean = false;
  stateList : any = [];

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
  }

  typeChange(value:any){
    if (value === 'Free') {
      this.model.base_price = 0;
      this.model.offer_price = 0;
      this.model.final_price = 0;
    }else{
      this.model.base_price = '';
      this.model.offer_price = '';
      this.model.final_price = '';
    }
  }
  

  onSubmit(fm: any) {
    if (fm.valid) {
      this.globalService.addPackage(fm.value).subscribe({
        next: (res) => {
          fm.resetForm();
          this.toastrService.success(res.message, 'Package added successfully!');
          this.isSubmitting = false;
        },
        error: (err) => {
          this.toastrService.danger(err.message, 'Error!');
          this.isSubmitting = false;
        },
      });


    }

  }

}

