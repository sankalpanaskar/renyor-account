import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';
import { LocalDataSource } from 'ng2-smart-table';

@Component({
  selector: 'ngx-add-budget-category',
  templateUrl: './add-budget-category.component.html',
  styleUrls: ['./add-budget-category.component.scss']
})
export class AddBudgetCategoryComponent implements OnInit{
  model:any = [];
  isSubmitting: boolean = false;
  budgetCategory : any = [];
  commonParticular : any = [];
  particularList : any = [];
  isShowHide = 0;

  source: LocalDataSource = new LocalDataSource();

  //data: LocalDataSource = new LocalDataSource();

  settings = {
    pager: {
      display: true,
      perPage: 10
    },
    actions: {
      edit: false,
      delete: false,
      add: false,
      position: 'right'
    },
    columns: {
      slNo: {
        title: 'SL',
        type: 'number',
        filter: false,
        editable: false
      },
      underCategory: {
        title: 'Under Category',
        type: 'string',
        filter: false,
        editable: false
      },
      particular: {
        title: 'Particular',
        type: 'string',
        filter: false,
        editable: false
      }
    },
  };

  loading: boolean = false;

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
      },
      error: (err) => {
        console.error('Center error:', err);
        this.toastrService.danger(err.message, 'Error');
      },
    });
  }

  categorySelect(value:any){
    this.particularList = this.commonParticular[value] || [];
    console.log(value,this.particularList);
    const mappedData = this.particularList.map((item, index) => ({
      slNo          : index + 1,
      underCategory : value,
      particular    : item.common_particular,
    }));
    this.source.load(mappedData);
    this.loading = false;
    this.isShowHide = 1;
  }

  onSearch(query: string = ''): void {
  if (query.trim()) {
    this.source.setFilter(
      [{ field: 'particular', search: query }],
      false // false = OR logic (change to true for AND)
    );
  } else {
    this.source.reset(); // ✅ clear filters if empty query
  }

  // Optional: feedback if no results found
  this.source.getAll().then(data => {
    if (data.length === 0) {
      console.warn('No matches found for:', query);
    }
  });
  }

  onSubmit(fm:any){
    //console.log(fm.value);
    if (fm.valid) {
      this.globalService.insertBudgetCategory(fm.value).subscribe({
        next: (res) => {
          fm.resetForm();
          this.toastrService.success(res.message, 'Category Created Successfully!');
          this.isSubmitting = false;
        },
        error: (err) => {
          this.toastrService.danger(err.message, 'Error');
          this.isSubmitting = false;
        },
      });
    }

  }
  

}
