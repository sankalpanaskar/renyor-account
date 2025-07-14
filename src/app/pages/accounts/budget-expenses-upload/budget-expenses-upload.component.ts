import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-budget-expenses-upload',
  templateUrl: './budget-expenses-upload.component.html',
  styleUrls: ['./budget-expenses-upload.component.scss']
})
export class BudgetExpensesUploadComponent implements OnInit{
  model:any = [];
  isSubmitting: boolean = false;
  donoAccountList : any = [];
  loading: boolean = false;

  fileError: string = '';
  selectedFile: File | null = null;

  donor: any;
  donor_account_id:any;

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
    formData.append('donor_account_id', fm.value.donor);
    formData.append('file', this.selectedFile);
    formData.append('user_id', this.globalService.user_id);
    this.isSubmitting = true;
    // Example call
    this.globalService.uploadBudgetExpenses(formData).subscribe({
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
