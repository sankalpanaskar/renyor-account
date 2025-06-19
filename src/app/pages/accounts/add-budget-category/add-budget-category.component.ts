import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-add-budget-category',
  templateUrl: './add-budget-category.component.html',
  styleUrls: ['./add-budget-category.component.scss']
})
export class AddBudgetCategoryComponent implements OnInit{
  model:any = [];
  isSubmitting: boolean = false;

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService
  ) {}

  ngOnInit(): void {
    
  }
  

}
