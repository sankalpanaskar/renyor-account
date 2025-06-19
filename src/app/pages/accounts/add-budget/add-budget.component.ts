import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-add-budget',
  templateUrl: './add-budget.component.html',
  styleUrls: ['./add-budget.component.scss']
})
export class AddBudgetComponent implements OnInit{
  model:any = [];
  isSubmitting: boolean = false;
  budgetCategory : any = [];
  commonParticular :  any = [];
  selectedCategory: string;
  commonParticularList : any = [];
  particular_id : any;
  particular : any;
  isShowHide = 0;
  donorList: any = [];
  verticesList : any = [];
  vertices_id : any;
  vertices : any;
  allCenter : any = [];
  center_id : any;
  center_name : any;
  center_code : any;
  donor : any;
  donor_account_id : any;
  selectedDate: Date = new Date();
  grossBudget : any;
  AFLCBudget : any;
  donorType : any = [];

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService
  ) {}

  ngOnInit(): void {
    this.getBudgetCategory();
  }

  getBudgetCategory(): void {
    this.globalService.getBudgetCategory().subscribe({
      next: (data) => {
        this.budgetCategory = data?.categories || [];
        this.commonParticular = data?.category_wise_particulars || [];
        this.verticesList = data?.vertices || []; 
        this.donorList = data?.donor || []; 
        this.allCenter = data?.center || []; 
        
        console.log(this.budgetCategory);
      },
      error: (err) => {
        console.error('Center error:', err);
        this.toastrService.danger(err.message, 'Error');
      },
    });
  }

  donorSelect(value:any){
    this.donor = value.name;
    this.donor_account_id = value.id;
    this.donorType = value.type;
    if(this.donorType == 'Vertices'){
      this.isShowHide = 1;
    }else{
      this.isShowHide = 2;
    }
    console.log('type'+this.donorType);
  }

  vertCenterSelect(value:any){
    if(value==1){
      this.isShowHide = 1;
    }else{
      this.isShowHide = 2;
    }
  }

  verticesSelect(value:any){
    this.vertices_id = value.id;
    this.vertices = value.name;
  }

  centerSelect(value:any){
    this.center_id = value.id;
    this.center_name = value.name;
    this.center_code = value.code;
    console.log('center:',this.center_id,this.center_name,this.center_code );
  }

  fySelect(fy:any){
    if(this.donor && fy){
      this.model.budget_name = this.donor + " From " +fy;
    }
  }
  
  categorySelect(category:any){
    this.commonParticularList = this.commonParticular[category] || [];
    console.log(this.commonParticularList);
  }

  particularSelect(value:any){
    this.particular_id = value.particular_id;
    this.particular = value.particular;
    console.log(this.particular_id,this.particular);
  }

  onGrossBudgetInput(value:any){
    this.grossBudget = value;
    
    
    console.log(this.grossBudget);
  }

  onAFLCInput(value:any){
    this.AFLCBudget = value;
    // var Afl;
    // if(this.AFLCBudget>0){
    //    Afl = this.AFLCBudget;
    // }else{
    //    Afl = 0;
    // }
    if(this.grossBudget && (this.AFLCBudget== 0 || this.AFLCBudget > 0)){
      console.log("dd"+(this.grossBudget -this.AFLCBudget));
      this.model.net_budget = (this.grossBudget - this.AFLCBudget);
    }
    
    console.log(this.grossBudget,this.AFLCBudget);
  }

  onSubmit(fm:any){
    fm.value.center_id       = this.center_id;
    fm.value.center_name     = this.center_name;
    fm.value.center_code     = this.center_code;
    fm.value.vertices_id     = this.vertices_id;
    fm.value.vertices_name   = this.vertices;
    fm.value.particular_id   = this.particular_id;
    fm.value.particular_name = this.particular;
    fm.value.donor_account_id = this.donor_account_id;
    
    console.log(fm.value);
    if (fm.valid) {
      this.globalService.saveDonorBudgetDetails(fm.value).subscribe({
        next: (res) => {
          fm.resetForm();
          this.toastrService.success(res.message, 'Budget Details Save Successfully!');
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('distric error:', err);
          this.toastrService.danger(err.message, 'Error');
          this.isSubmitting = false;
        },
      });
    }

  }


  

}
