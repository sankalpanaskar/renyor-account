import { Component } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-add-buyer-form',
  templateUrl: './add-buyer-form.component.html',
  styleUrls: ['./add-buyer-form.component.scss']
})
export class AddBuyerFormComponent {
  model: any = [];
  isSubmitting: boolean = false;
  stateList: any = [];

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService
  ) { }

  ngOnInit(): void {
  this.loadState();
  }

  loadState(){
    this.isSubmitting = true;
    this.globalService.getState().subscribe({
      next:(res:any) => {
        this.stateList = res.data.states;
        this.isSubmitting = false;
        
      },
      error:(res:any) => {
      this.isSubmitting = false;

      }
    })
  }


onSubmit(fm: any) {
  // 🔸 Step 1: Validate form fields
  if (!fm.valid) {
    this.toastrService.warning('Please fill all required fields correctly.', 'Validation');
    return;
  }
  fm.value.member_id = this.globalService.member_id;

  // 🔸 Step 4: Call API
  this.isSubmitting = true;
  this.globalService.addBuyer(fm.value).subscribe({
    next: (res: any) => {
      this.isSubmitting = false;

      if (res.status) {
        this.toastrService.success('Buyer Added successfully!', 'Success');
        fm.resetForm(); // ✅ reset form
        this.model = {}; // clear model
      } else {
        this.toastrService.warning(res.message || 'Add Buyer submission failed.', 'Warning');
      }
    },
    error: (err) => {
      this.isSubmitting = false;
      console.error('Submit error:', err);
      this.toastrService.danger(err?.error?.message || 'Something went wrong. Please try again.', 'Error');
    },
  });
}


}

