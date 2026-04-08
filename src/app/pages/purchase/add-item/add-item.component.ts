import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'ngx-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.scss']
})
export class AddItemComponent implements OnInit {
  model: any = {
    customer_type: 'Goods',
    unit: '',
    hsn_code: '',
    sac: '',
    tax_preference: ''
  };
  isSubmitting: boolean = false;
  stateList : any = [];
  

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
  }
  
  typeChange(value: string) {
    console.log('Type selected:', value);
    // Reset unit when type changes
    this.model.unit = '';
    // Reset HSN code and SAC when type changes
    this.model.hsn_code = '';
    this.model.sac = '';
    this.model.tax_preference = '';
  }

  onSubmit(fm: any) {
    if (fm.valid) {
      // this.globalService.submitAssetData(fm.value).subscribe({
      //   next: (res) => {
      //     this.model = '';
      //     fm.resetForm();
      //     this.toastrService.success(res.message, 'Added');
      //     this.isSubmitting = false;
      //   },
      //   error: (err) => {
      //     console.error('Submit error:', err);
      //     const errorMessage =
      //       err?.error?.message ||
      //       err?.message ||
      //       'Add Lead Failed. Please try again.';

      //     this.toastrService.danger(errorMessage, 'Add Asset Failed');
      //     this.isSubmitting = false;
      //   },
      // });


    }

  }

}
