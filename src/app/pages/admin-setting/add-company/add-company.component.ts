import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-add-company',
  templateUrl: './add-company.component.html',
  styleUrls: ['./add-company.component.scss']
})
export class AddCompanyComponent implements OnInit {
  model: any = [];
  isSubmitting: boolean = false;
  packageList : any = [];
  stateList : any = [];
  selectedFile: File | null = null;


  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService
  ) { }

  ngOnInit(): void {
    this.getState();
    this.getPackage();
  }

  getPackage() {
      this.isSubmitting = true;
      this.globalService.gePackageList().subscribe({
        next: (res:any) => {
          console.log(res);
          this.packageList = res.data; // ✅ Store API data here first
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

  const formData = new FormData(); // ✅ empty

  formData.append('name', this.model.name);
  formData.append('industry', this.model.industry);
  formData.append('website', this.model.website);
  formData.append('address', this.model.address);
  formData.append('country', this.model.country);
  formData.append('city', this.model.city);
  formData.append('state', this.model.state);
  formData.append('pin', this.model.pin);
  formData.append('phone', this.model.phone);
  formData.append('email', this.model.email);
  formData.append('pan', this.model.pan);
  formData.append('gst', this.model.gst);
  formData.append('package_id', this.model.package_id);

  if (this.selectedFile) formData.append('logo', this.selectedFile);

  this.globalService.addCompany(formData).subscribe({
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
