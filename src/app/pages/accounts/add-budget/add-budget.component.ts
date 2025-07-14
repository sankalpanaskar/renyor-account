import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { SearchListComponent } from '../components/search-list/search-list.component';

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
  verticesShowHide = 0;
  centerShowHide = 0;
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

  searchText = '';
  selectedOption = null;
  dropdownOpen = false;
  filteredCourses: any = [];
  openAbove = false;

  selectedCenter : any;

  @ViewChild('dropdownTrigger') dropdownTrigger: ElementRef;

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
    private dialogService: NbDialogService
  ) {}

  ngOnInit(): void {
    this.getBudgetCategory();
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;

    if (this.dropdownOpen) {
      setTimeout(() => {
        const rect = this.dropdownTrigger.nativeElement.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;

        this.openAbove = spaceBelow < 300 && spaceAbove> 300;
      });
    }
  }

   openDialog(itemType: string) {
    let allItems = [];
    allItems = this.allCenter;

    this.dialogService.open(SearchListComponent, {
      context: {
        itemType: itemType,  // 'center' or 'student'
        allItems: allItems    // List of items to display in the dialog
      }
    }).onClose.subscribe(item => {
      if (item) {
        if (itemType === 'center') {
          this.selectedCenter = item;
        } else if (itemType === 'student') {
          //this.selectedStudent = item;
        }
      }
    });
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
      this.verticesShowHide = 1;
      this.centerShowHide = 0;
    }else if(this.donorType == 'Center'){
      this.centerShowHide = 1;
      this.verticesShowHide = 0;
    } else if(this.donorType == 'Both'){
      this.verticesShowHide = 1;
      this.centerShowHide = 1;
    }
    console.log('type'+this.donorType);
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
