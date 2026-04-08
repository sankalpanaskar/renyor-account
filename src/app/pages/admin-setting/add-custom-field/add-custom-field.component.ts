import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-add-custom-field',
  templateUrl: './add-custom-field.component.html',
  styleUrls: ['./add-custom-field.component.scss']
})
export class AddCustomFieldComponent implements OnInit {
  model: any = [];
  isSubmitting: boolean = false;
  moduleList : any = [];
  stateList : any = [];
  selectedFile: File | null = null;


  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService
  ) { }

  ngOnInit(): void {
    this.getState();
    this.getAllModule();
  }

  getAllModule() {
      this.isSubmitting = true;
      this.globalService.getAllModule().subscribe({
        next: (res:any) => {
          console.log(res);
          const modules = Array.isArray(res?.data) ? res.data : [];
          this.moduleList = modules.filter((item: any) => {
            const menuName = (item?.menu_name || '').toString().trim().toLowerCase();
            return menuName.startsWith('add');
          });
          this.isSubmitting = false;
        },
        error: (err) => {
          this.toastrService.danger(err, 'Failed');
          this.isSubmitting = false;
        },
      });
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

  onFileChange(event: any) {
  if (event.target.files && event.target.files.length > 0) {
    this.selectedFile = event.target.files[0];
  }
}


  onSubmit(fm: any) {
  if (fm.invalid) return;

  this.isSubmitting = true;
console.log(fm.value);
  this.globalService.addCustomField(fm.value).subscribe({
    next: (res) => { 
      this.toastrService.success(res.message, 'Success!');
      fm.resetForm(); 
      this.isSubmitting = false; 
    },
    error: (err) => { 
      if (err.status === 409) {
        // 🔴 Duplicate entry
        this.toastrService.danger(
          err.error?.message || 'Duplicate record already exists',
          'Duplicate (409)'
        );
      } else {
        // 🔵 Other errors
        this.toastrService.danger(
          err.error?.message || 'Something went wrong',
          `Error ${err.status}`
        );
      }
      this.isSubmitting = false; 
    }
  });
}


}

