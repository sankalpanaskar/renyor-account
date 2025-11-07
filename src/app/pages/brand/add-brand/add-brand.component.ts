import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-add-brand',
  templateUrl: './add-brand.component.html',
  styleUrls: ['./add-brand.component.scss']
})
export class AddBrandComponent implements OnInit{
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

  
 constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService
  ) { }

  ngOnInit(): void {
    console.log("member is", this.globalService.member_id, this.globalService.role_id);
  }

  loadBrand(){
       this.isSubmitting = true;
    this.globalService.getBrandsList().subscribe({
      next:(res:any) => {
        // this.subClassList = res.data.sub_class;
        this.isSubmitting = false;
        
      },
      error:(res:any) => {
      this.isSubmitting = false;

      }
    })
  }

    onSubmit(fm: any) {
      if(fm.valid){
        fm.value.created_by = this.globalService.fullName;

        this.globalService.submitAddBrand(fm.value).subscribe({
        next: (res) => {
          this.model = '';
          fm.resetForm();
          this.loadBrand();
          this.toastrService.success(res.message, 'Added');
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('Submit error:', err);
          const errorMessage =
            err?.error?.message ||
            err?.message ||
            'Add Brand Failed. Please try again.';

          this.toastrService.danger(errorMessage, 'Add Brand Failed');
          this.isSubmitting = false;
        },
      });


      }
 
    }
}
