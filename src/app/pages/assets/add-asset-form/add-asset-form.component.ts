import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-add-asset-form',
  templateUrl: './add-asset-form.component.html',
  styleUrls: ['./add-asset-form.component.scss']
})
export class AddAssetFormComponent implements OnInit{
  model: any = [];
  isSubmitting: boolean = false;
  centerList: any[] = [];
  stateList: any[] = [];
  filteredCenterList: any[] = [];
  courseList: any[] = [];
  selectedState: any;
  districList: any[] = [];
  selectedCenter: any;
  selectedCourse: any;
  selectedDistric: any;
  categoryList: any[] = [];
  sourceList: any[] = [];
  filteredSourceList: any[] = [];
  selectedSource: any;   
  brandList: any = [];
  classList: any = [];
  selectedClass: any;
  slectedClassId: any;
  subClassList: any = [];

  searchText = '';
  selectedOption = null;
  dropdownOpen = false;
  openAbove = false;
  @ViewChild('dropdownTrigger') dropdownTrigger: ElementRef;
  funderList: any = [];
  filterFunderList: any = [];
  selectedClassId: any;
  selectedSubClassId: any;
  selectedSubClass: any;

  
 constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService
  ) { }

  ngOnInit(): void {
    console.log("member is", this.globalService.member_id, this.globalService.role_id);
    this.loadBrand();
    this.loadClass();
    this.loadFunders();
    this.model.nature_of_asset = "IT";
  }
  loadBrand(){
    this.isSubmitting = true;
    this.globalService.getBrands().subscribe({
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

  selectFunder(centerData: string) {
  this.model.funded_by = centerData;
  this.dropdownOpen = false;
  this.searchText = '';
  this.filterOptions(); // refresh list when reopening
  this.loadFunders(); // your existing function

}

  

  toggleDropdown() {
  this.dropdownOpen = !this.dropdownOpen;

  if (this.dropdownOpen) {
    setTimeout(() => {
      const rect = this.dropdownTrigger.nativeElement.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      this.openAbove = spaceBelow < 300 && spaceAbove > 300;
    });
  }
}

 filterOptions() {
  const text = this.searchText.toLowerCase();
  console.log("print filter",text);
  this.filterFunderList = this.funderList.filter(c =>
    c.funder_name.toLowerCase().includes(text) 
  );
}




    onSubmit(fm: any) {
      if(fm.valid){
        fm.value.role_id = this.globalService.role_id;
        fm.value.user_name = this.globalService.fullName;
        fm.value.user_member_id = this.globalService.member_id;
        fm.value.asset_class_name = this.selectedClass;
        fm.value.asset_sub_class_name = this.selectedSubClass;

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
