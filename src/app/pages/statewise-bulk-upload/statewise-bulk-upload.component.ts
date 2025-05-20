import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../services/global.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-statewise-bulk-upload',
  templateUrl: './statewise-bulk-upload.component.html',
  styleUrls: ['./statewise-bulk-upload.component.scss']
})
export class StatewiseBulkUploadComponent implements OnInit{
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


  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService
  ) { }

  ngOnInit(): void {
    this.loadCenters();
    this.loadSource();
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

  loadSource(): void {
    this.globalService.getSources().subscribe({
      next: (res) => {
        this.categoryList = res.category;
        this.sourceList = res.data;
        this.filteredSourceList = this.sourceList;
        console.log("category list", this.categoryList);
        console.log("source list", this.sourceList);

      },
      error: (err) => {
        console.error('State error:', err);
        this.toastrService.danger(err.message, 'Error');
      },
    });
  }

  onCategoryChange(selectedCategory: string) {
    this.filteredSourceList = this.sourceList.filter(
      (item) => item.category === selectedCategory
    );
    this.model.source_type = '';
    this.model.source_name = '';
  }

  onSourceChange(event: any) {
    console.log("selected source data", event);
    this.model.source_name = event.source_name;
    this.selectedSource = event.source_type;
  }

  loadCourses(centerId): void {
    this.globalService.getCourses(centerId).subscribe({
      next: (data) => {
        this.courseList = data.data?.course || [];
        console.log('Course Data:', this.courseList);
      },
      error: (err) => {
        console.error('Course error:', err);
        this.toastrService.danger(err.message, 'Error');
      },
    });
  }

  courseSelect(courseID: any) {
    this.selectedCourse = this.courseList.find(course => course.id === courseID);
    console.log("Selected course Object:", this.selectedCourse);
  }

  loadCenters(): void {
    this.globalService.getCenterBulk().subscribe({
      next: (data) => {
        this.centerList = data.data?.centers || [];
        // console.log('Center Data:', this.centerList);
      },
      error: (err) => {
        console.error('Center error:', err);
        this.toastrService.danger(err.message, 'Error');
      },
    });
  }

  centerSelect(centerID: any) {
    this.selectedCenter = this.centerList.find(center => center.center_id === centerID);
    this.loadCourses(this.selectedCenter.center_id);
    this.model.course = '';
    console.log("Selected center Object:", this.selectedCenter);
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

  onSubmit(fm: any) {
    if (fm.valid && this.selectedFile) {
      const formData = new FormData();

      formData.append('form_catergory', "bulk_upload");
      formData.append('member_id', this.globalService.member_id);
      formData.append('role_id', this.globalService.role_id);

      formData.append('category', fm.value.category);
      formData.append('source_type', this.selectedSource);
      formData.append('source_name', this.model.source_name);
      formData.append('center_id', this.model.center);  // assuming center_id
      formData.append('center_code', this.selectedCenter.short_code);
      formData.append('center_name', this.selectedCenter.center_name);
      formData.append('course_id', this.model.course);  // assuming course_id
      formData.append('course_alias', this.selectedCourse.alias);
      formData.append('course_name', this.selectedCourse.name);
      formData.append('file', this.selectedFile);
      this.isSubmitting = true;
      // Example call
      this.globalService.leadSubmit(formData).subscribe({
        next: (res) => {
          console.log('Upload success:', res);
          fm.resetForm();
          this.model = '';
          this.toastrService.success(res.message, 'Uploaded');
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('Upload error:', err);
          this.toastrService.danger(err.message, 'Upload Failed');
          this.isSubmitting = false;
        },
      });

      console.log('Form Submitted', formData);
    } else {
      if (!this.selectedFile) {
        this.fileError = 'Please upload a valid Excel file.';
      }
    }
  }
}