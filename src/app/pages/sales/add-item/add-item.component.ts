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

  // getState(){
  //   this.globalService.getStates().subscribe({
  //     next: (res: any) => {
  //       this.stateList = res;
  //       this.isSubmitting = false;
  //       console.log(res);
  //     },
  //     error: (res: any) => {
  //       this.isSubmitting = false;
  //     }
  //   })
  // }
  
  typeChange(value:string){
    
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
