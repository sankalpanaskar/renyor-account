import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';
import { LocalDataSource } from 'ng2-smart-table';

@Component({
  selector: 'ngx-amount-recieved-from-donor',
  templateUrl: './amount-recieved-from-donor.component.html',
  styleUrls: ['./amount-recieved-from-donor.component.scss']
})
export class AmountRecievedFromDonorComponent implements OnInit{
  model:any = [];
  isSubmitting: boolean = false;
  donorList : any = [];
  donor_account_id : any;
  amountList : any = [];
  isShowHide = 0;

  source: LocalDataSource = new LocalDataSource();

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
      receivedAmount: {
        title: 'Received Amount',
        type: 'string',
        filter: false,
        editable: false
      },
      receivedDate: {
        title: 'Amount Received Date',
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
        this.donorList = data?.donor || []; 
        console.log(this.donorList);
      },
      error: (err) => {
        console.error('Center error:', err);
        this.toastrService.danger(err.message, 'Error');
      },
    });
  }

  donorSelect(value:any){
    this.donor_account_id = value;
    console.log(value);
    this.globalService.getReceivedAmountFromDonor(value).subscribe({
        next: (res) => {
          console.log(res);
          this.amountList = res.record;
          const mappedData = this.amountList.map((item, index) => ({
            slNo           : index + 1,
            receivedAmount : item.received_amount,
            receivedDate   : item.received_date,
          }));
          this.source.load(mappedData);
          this.loading = false;
          this.isShowHide = 1;
        },
        error: (err) => {
          this.toastrService.danger(err.message, 'Error');
          this.isSubmitting = false;
        },
      });
    
  }


  onSearch(query: string = ''): void {
  if (query.trim()) {
    this.source.setFilter(
      [{ field: 'receivedAmount', search: query },{ field: 'receivedDate', search: query }],

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
      this.globalService.insertReceivedAmountFromDonor(fm.value).subscribe({
        next: (res) => {
          fm.resetForm();
          this.toastrService.success(res.message, 'Amount Received Successfully!');
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

