import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-assets-report',
  templateUrl: './assets-report.component.html',
  styleUrls: ['./assets-report.component.scss']
})
export class AssetsReportComponent {

  model: any = [];
  isSubmitting: boolean = false;
  centerList: any = [];
  filterCenterList: any = [];
  @ViewChild('dropdownTrigger') dropdownTrigger: ElementRef;
  dropdownOpen: boolean;
  searchText: any;
  selectedCenter: any;

  brandList: any = [];
  classList: any = [];
  selectedClassId: any;
  selectedClass: any;

  electedSubClass: any;
  selectedSubClassId: any;

  selectedSubClass: any;
  subClassList: any = [];

  funderList: any = [];
  filterFunderList: any = [];

  selectedCenterCode: any;
  selectedStatus: any;
  assetList: any = [];
  filteredAssetList: any = [];
  masterSelected: boolean = false;
  showAssetList = false;
  searchTextStudent = '';

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService
  ) { }

  ngOnInit(): void {
    console.log("member is", this.globalService.member_id, this.globalService.role_id);
    this.loadCenter();
    this.loadBrand();
    this.loadClass();
    this.loadFunders();
  }

  loadCenter(): void {
    this.isSubmitting = true;
    this.globalService.getAllActiveDeactiveCenter().subscribe({
      next: (res) => {
        this.centerList = res.centers;
        this.filterCenterList = this.centerList;
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('State error:', err);
        this.toastrService.danger(err.message, 'Error');
        this.isSubmitting = false;
      },
    });
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  filterOptions() {
    const text = this.searchText.toLowerCase();
    console.log("print filter", text);
    this.filterCenterList = this.centerList.filter(c =>
      c.center_code.toLowerCase().includes(text)
    );
  }

  selectCenter(centerData: any) {
    console.log("center select",centerData);
    this.model.center = centerData;
    this.selectedCenter = this.centerList.find(
      (course) => course.center_code === centerData
    );
    console.log('center data', this.selectedCenter);
    ;
    this.selectedCenterCode = this.selectedCenter.center_code;
    this.dropdownOpen = false;
    this.searchText = '';
    this.filterOptions();
    this.loadClass();
  }

  loadBrand(){
    this.isSubmitting = true;
    this.globalService.getBrandsList().subscribe({
      next:(res:any) => {
        this.brandList = res.data.brands;
        this.isSubmitting = false;

      },
      error:(res:any) => {
      this.isSubmitting = false;

      }
    })
  }

  loadClass(){
    this.isSubmitting = true;
    this.globalService.getClass().subscribe({
      next:(res:any) => {
        this.classList = res.data.class_name;
        this.isSubmitting = false;
      },
      error:(res:any) => {
      this.isSubmitting = false;
      }
    })
  }

  selectClass(classId: any) {
    // store selected ID
    this.selectedClassId = classId;

    // find the matching class name from classList
    const selectedObj = this.classList.find((item: any) => item.class_id === classId);

    if (selectedObj) {
      this.selectedClass = selectedObj.asset_class_name;
    } else {
      this.selectedClass = null;
    }

    console.log('Selected Class ID:', this.selectedClassId);
    console.log('Selected Class Name:', this.selectedClass);

    // call your next function
    this.loadSubClass();
  }

selectSubClass(classId: any) {
  // store selected ID
  this.selectedSubClassId = classId;

  // find the matching class name from classList
  const selectedObj = this.subClassList.find((item: any) => item.sub_class_id === classId);

  if (selectedObj) {
    this.selectedSubClass = selectedObj.sub_class_name;
  } else {
    this.selectedSubClass = null;
  }

  console.log('Selected Class ID:', this.selectedSubClassId);
  console.log('Selected Class Name:', this.selectedSubClass);

  // call your next function
  this.loadSubClass();
}


  loadSubClass(){
    this.isSubmitting = true;
    this.globalService.getSubClass(this.selectedClassId).subscribe({
      next:(res:any) => {
        this.subClassList = res.data.sub_class;
        this.isSubmitting = false;
      },
      error:(res:any) => {
      this.isSubmitting = false;

      }
    })
  }

  loadFunders(){
    this.isSubmitting = true;
    this.globalService.getFunders().subscribe({
      next:(res:any) => {
        this.funderList = res.data.funder;
        this.filterFunderList = this.funderList;
        this.isSubmitting = false;
        
      },
      error:(res:any) => {
      this.isSubmitting = false;

      }
    })
  }

  onSubmit(fm){
    if(fm.valid){
      console.log(fm.value);
      this.isSubmitting = true;
      this.globalService.assetsReport(fm.value).subscribe({
        next: (res) => {
          console.log(res);
          //fm.resetForm();
          //this.toastrService.success(res.message, 'Added');
          window.open(res.file_path, '_blank');
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
