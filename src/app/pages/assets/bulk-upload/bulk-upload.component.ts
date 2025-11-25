import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-bulk-upload',
  templateUrl: './bulk-upload.component.html',
  styleUrls: ['./bulk-upload.component.scss']
})
export class BulkUploadComponent implements OnInit {
  model: any = [];
  courseList: any = [];
  selectedCourse: any;
  centerList: any = [];
  selectedCenter: any;
  fileError: string = '';
  selectedFile: File | null = null;
  categoryList: any = [];
  sourceList: any = [];
  filteredSourceList: any = [];
  selectedSource: any;
  excelPath: any;
  isSubmitting: boolean = false;

  @ViewChild('fileInput') fileInput: ElementRef;

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService
  ) { }

  ngOnInit(): void {
    this.getExcelPath();
    console.log("member is", this.globalService.member_id, this.globalService.role_id);
  }

  getExcelPath() {
    this.globalService.getExcelPath().subscribe({
      next: (res) => {
        this.excelPath = res.file_path;
        console.log('Excel path:', this.excelPath);
      },
      error: (err) => {
        console.error('Course error:', err);
        this.toastrService.danger(err.message, 'Error');
      },
    });
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

  resetFileInput() {
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
      this.selectedFile = null;
    }
  }

  clearFileInput() {
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
      this.selectedFile = null;
      this.model.file = null;
    }
  }


  onSubmit(fm: any) {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('member_id', this.globalService.member_id);
      formData.append('role_id', this.globalService.role_id);
      formData.append('file', this.selectedFile);

      this.isSubmitting = true;

      this.globalService.uploadBulkAsset(formData).subscribe({
        next: (res) => {
          console.log('Upload success:', res);

          fm.resetForm();
          this.model = '';

          this.toastrService.success(res.message, 'Uploaded', {
            duration: 5000,
          });

          this.isSubmitting = false;
          this.resetFileInput();
        },
        error: (err) => {
          console.error('Upload error:', err);

          const errorMessage =
            err?.error?.message || // Use server error message if available
            err?.message ||        // Fallback to generic message
            'Upload failed. Please try again.';

          this.toastrService.danger(errorMessage, 'Upload Failed', {
            duration: 15000,
            destroyByClick: true,
            hasIcon: true,
          });
          this.isSubmitting = false;
        }

      });

      console.log('Form Submitted', formData);
    } else {
      this.fileError = 'Please upload a valid Excel file.';
    }
  }





}
