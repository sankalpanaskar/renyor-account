import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { ExcelErrorDialogComponent } from '../excel-error-dialog/excel-error-dialog.component';

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
    private toastrService: NbToastrService,
    private dialogService: NbDialogService
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
            duration: 4000,
          });

          this.isSubmitting = false;
          this.resetFileInput();
        },
        error: (err) => {
          console.error('Upload error:', err);

          const apiMsg = err?.error?.message;

          // If API sends array of errors → open dialog
          if (Array.isArray(apiMsg)) {
            this.dialogService.open(ExcelErrorDialogComponent, {
              context: {
                errors: apiMsg
              },
              closeOnBackdropClick: true,
              hasScroll: true,
            });
          } else {
            // fallback toast
            this.toastrService.danger(
              apiMsg || err?.message || 'Upload failed. Please try again.',
              'Upload Failed',
              {
                duration: 5000,
              }
            );
          }

          this.isSubmitting = false;
        }

      });

      // console.log('Form Submitted', formData);
    } else {
      this.fileError = 'Please upload a valid Excel file.';
    }
  }





}
