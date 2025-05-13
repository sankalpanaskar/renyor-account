import { Component } from '@angular/core';
import { GlobalService } from '../../services/global.service';
import { NbToastrService } from '@nebular/theme';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'ngx-student-register',
  templateUrl: './student-register.component.html',
  styleUrls: ['./student-register.component.scss']
})
export class StudentRegisterComponent {
userProfile: any;
  roles: any;
  model:any = [];
  centerList: any ;
  stateList: any = [];
  filteredCenterList: any = [];
  courseList: any = [];
  selectedState: any;
  districList: any = [];
  selectedCenter: any;
  selectedCourse: any;
  selectedDistric: any;
  categoryList: any = [];
  sourceList: any = [];
  filteredSourceList: any = [];
  selectedSource: any;
  isSubmitting: boolean = false;

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
    private route: ActivatedRoute,
    private router: Router // ✅ Inject Router
  ) 
  {}

  ngOnInit(): void {
    this.loadStates();
    this.loadSource();
    console.log("member is", this.globalService.member_id, this.globalService.role_id);
  
    // 🔥 FIXED: Use `params` not `queryParams`
    this.route.params.subscribe(params => {
      const sourceName = params['name'];
      console.log('Source name from route param:', sourceName);
  
      if (sourceName) {
        this.model.source_name = sourceName;
        this.autoSelectCategoryAndSourceType(sourceName);
      }
    });
  }
  
  autoSelectCategoryAndSourceType(sourceName: string) {
    // Find the source object that matches the name
    const matchedSource = this.sourceList.find(
      item => item.source_name.toLowerCase() === sourceName.toLowerCase()
    );
  
    if (matchedSource) {
      this.model.category = matchedSource.category;
      this.onCategoryChange(this.model.category); // this filters the source list
      this.model.source_type = matchedSource;
      this.selectedSource = matchedSource.source_type;
      this.model.source_name = matchedSource.source_name; // ✅ fill source name input
    } else {
      console.warn('No matching source found for:', sourceName);
    }
  }
  

  loadSource(): void {
    this.globalService.getSourcesReg().subscribe({
      next: (res) => {
        this.categoryList = res.category;
        this.sourceList = res.data;
        this.filteredSourceList = this.sourceList;
         // After loading, try to match the route param (if it was set)
      if (this.model.source_name) {
        this.autoSelectCategoryAndSourceType(this.model.source_name);
      }
        console.log("category list",this.categoryList);
        console.log("source list",this.sourceList);

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
  }

  onSourceChange(event:any){
    console.log("selected source data",event);
    this.model.source_name = event.source_name;
    this.selectedSource = event.source_type;

  }

  loadCenters(): void {
    var data = {
      state   : this.selectedState.state_name,
      district : this.selectedDistric.district_name
    }
    this.globalService.getCenterReg(data).subscribe({
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

  centerSelect(centerID:any){
    this.selectedCenter = this.centerList.find(center => center.center_id === centerID);
    this.loadCourses(this.selectedCenter.center_id);
    console.log("Selected center Object:", this.selectedCenter); 
  }

  loadStates(): void {
    this.globalService.getStatesReg().subscribe({
      next: (data) => {
        this.stateList = data.data?.state || [];
        // console.log('State Data:', this.stateList);
      },
      error: (err) => {
        console.error('State error:', err);
        this.toastrService.danger(err.message, 'Error');
      },
    });
  }

  stateSelect(stateCode:any){
    this.selectedState = this.stateList.find(state => state.state_code === stateCode);
    console.log("Selected State Object:", this.selectedState); 

    this.loadDistric();

  }

  loadDistric(): void {
    console.log("state code",this.selectedState);
    var data = {
      state_code : this.selectedState.state_code
    }
    console.log("data---",data);

    this.globalService.getDistricReg(data).subscribe({
      next: (data) => {
        this.districList = data.data?.district || [];
        console.log('distric Data:', this.districList);
      },
      error: (err) => {
        console.error('distric error:', err);
        this.toastrService.danger(err.message, 'Error');
      },
    });
  }

  districSelect(districID:any){
    this.selectedDistric = this.districList.find(distric => distric.id === districID);
    this.loadCenters();
    console.log("Selected distric Object:", this.selectedDistric); 
  }

  loadCourses(centerId): void {
    console.log("center id",centerId);
    this.globalService.getCoursesReg(centerId).subscribe({
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

  courseSelect(courseAlias:any){
    this.selectedCourse = this.courseList.find(course => course.alias === courseAlias);
    console.log("Selected course Object:", this.selectedCourse); 
  }

  onSubmit(fm: any) {
    if (fm.valid) {

      fm.value.catergory = "external";
      fm.value.member_id = this.globalService.member_id;
      fm.value.role_id = this.globalService.role_id;

      let formDatas:any = document.getElementById('leadForm');
      const formData    = new FormData(formDatas);
      formData.delete('center');
      formData.delete('state');
      formData.delete('district');
      formData.delete('course');
 
      formData.append('form_catergory', fm.value.catergory);
      formData.append('member_id', fm.value.member_id);
      formData.append('role_id', fm.value.role_id);

      formData.append('center_id',this.selectedCenter.center_id);
      formData.append('center_code',this.selectedCenter.short_code);
      formData.append('center_name',this.selectedCenter.center_name);
      // formData.append('course_id',this.selectedCourse.id);
      formData.append('course_alias',this.selectedCourse.alias);
      formData.append('course_name',this.selectedCourse.name);
      formData.append('state',this.selectedState.state_name);
      formData.append('distric',this.selectedDistric.district_name);
      formData.append('source_type',this.selectedSource);
      formData.append('category',fm.value.category);
      this.isSubmitting = true;
      this.globalService.leadSubmitReg(formData).subscribe({
        next: (res) => {
          this.model = '';
          fm.resetForm();
          this.toastrService.success(res.message, 'Added');
          this.router.navigate(['/auth/login']); // ✅ Redirect after success
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('distric error:', err);
          this.toastrService.danger(err.message, 'Error');
          this.isSubmitting = false;
        },
      });
      console.log('Form Submitted', formData);
      // Add your save logic here
    }
  }
  

}