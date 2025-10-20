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

    onSubmit(fm: any) {
    if (!fm.valid) return;
    }

}
