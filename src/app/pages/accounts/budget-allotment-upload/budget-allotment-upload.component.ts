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

  fileError: string = '';
  selectedFile: File | null = null;

  donor: any;
  donor_account_id:any;
  verticesShowHide = 0;
  centerShowHide = 0;
  verticesList : any = [];
  centerList : any = [];
  donorType : any;

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
    this.donor = value.name;
    this.donor_account_id = value.id;
    this.donorType = value.type;
    if(this.donorType == 'Vertices'){
      this.verticesShowHide = 1;
      this.centerShowHide = 0;
    }else if(this.donorType == 'Center'){
      this.centerShowHide = 1;
      this.verticesShowHide = 0;
    } else if(this.donorType == 'Both'){
      this.verticesShowHide = 1;
      this.centerShowHide = 1;
    }

    this.globalService.getBudgetVerticesCenterByDonorAccount(this.donor_account_id).subscribe({
      next: (res) => {
        console.log(res);
        this.verticesList = res.data.vertices;
        this.centerList = res.data.centers;
      },
    error: (err) => {
          console.error('Upload error:', err);
          const errorMessage =
            err?.error?.message || // Use server error message if available
            err?.message ||        // Fallback to generic message
            'Upload failed. Please try again.';

          this.toastrService.danger(errorMessage, 'Upload Failed');
          this.isSubmitting = false;
        }
    });

    
  }




  onDownload(fm1:any){
    if (fm1.valid) {
      var data = {
        'donor_account_id' : this.donor_account_id,
        'type' : this.donorType,
        'vertices_id' : fm1.value.vertices,
        'center_id' : fm1.value.center
      }
      this.globalService.downloadBudgetAllotmentFormat(data).subscribe({
        next: (res) => {
          console.log(res);
          this.toastrService.success(res.message, 'Donor Account Created Successfully!');
          window.open(res.data.excelPath, '_blank');
          this.isDownload = false;
        },
        error: (err) => {
          console.error('distric error:', err);
          this.toastrService.danger(err.message, 'Error');
          this.isDownload = false;
        },
      });
    }

  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    this.fileError = ''; // Reset

    if (file) {
      const allowedTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

      if (!allowedTypes.includes(file.type)) {
        this.fileError = 'Only Excel files (.xls, .xlsx) are allowed.';
        this.selectedFile = null;
      } else {
        this.selectedFile = file;
      }
    }
  }

  onUpload(fm:any){
    console.log(fm.value.donor.name);
    if (fm.valid && this.selectedFile) {
    const formData = new FormData();
    formData.append('donor_account_id', fm.value.donor.id);
    formData.append('donor_account_name', fm.value.donor.name);
    formData.append('member_id', this.globalService.member_id);
    formData.append('role_id', this.globalService.role_id);
    formData.append('file', this.selectedFile);
    this.isSubmitting = true;
    // Example call
    this.globalService.uploadBudgetAllotmentFormat(formData).subscribe({
      next: (res) => {
        console.log('Upload success:', res);
        fm.resetForm();
        this.model = {}; // ✅ fixed
        this.selectedFile = null;
        this.fileError = '';
        this.toastrService.success(res.message, 'Uploaded Successfully');
        this.isSubmitting = false;
      },
    error: (err) => {
          console.error('Upload error:', err);
          const errorMessage =
            err?.error?.message || // Use server error message if available
            err?.message ||        // Fallback to generic message
            'Upload failed. Please try again.';

          this.toastrService.danger(errorMessage, 'Upload Failed');
          this.isSubmitting = false;
        }
    });

    console.log('Form Submitted', formData);
      } else {
        if (!this.selectedFile) {
          this.fileError = 'Please upload a valid Excel file.';
        }
      }
  }

}
