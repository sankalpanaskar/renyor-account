import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'ngx-add-customers',
  templateUrl: './add-customers.component.html',
  styleUrls: ['./add-customers.component.scss']
})
export class AddCustomersComponent implements OnInit {
  model: any = [];
  isSubmitting: boolean = false;
  stateList : any = [];

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.getState();
    this.getList();
  }

  getState(){
    this.globalService.getStates().subscribe({
      next: (res: any) => {
        this.stateList = res;
        this.isSubmitting = false;
        console.log(res);
      },
      error: (res: any) => {
        this.isSubmitting = false;
      }
    })
  }

  getList(){
    this.globalService.getCustomerList().subscribe({
      next: (res: any) => {
        // this.stateList = res;
        // this.isSubmitting = false;
        console.log(res);
      },
      error: (res: any) => {
        this.isSubmitting = false;
      }
    })
  }

  copyBillingToShipping() {
    this.model.shipping_address = this.model.billing_address;
    this.model.shipping_country = this.model.billing_country;
    this.model.shipping_city    = this.model.billing_city;
    this.model.shipping_state   = this.model.billing_state;
    this.model.shipping_pin     = this.model.billing_pin;

    // Optional: if you want errors to disappear/appear immediately
    // this.fm?.form?.controls?.['shipping_address']?.markAsTouched();
    // this.fm?.form?.controls?.['shipping_country']?.markAsTouched();
    // this.fm?.form?.controls?.['shipping_city']?.markAsTouched();
    // this.fm?.form?.controls?.['shipping_state']?.markAsTouched();
    // this.fm?.form?.controls?.['shipping_pin']?.markAsTouched();
  }
  

  onSubmit(fm: any) {
    if (fm.valid) {
      this.globalService.submitAssetData(fm.value).subscribe({
        next: (res) => {
          this.model = '';
          fm.resetForm();
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
