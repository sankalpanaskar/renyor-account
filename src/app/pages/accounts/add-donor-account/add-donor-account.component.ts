import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-add-donor-account',
  templateUrl: './add-donor-account.component.html',
  styleUrls: ['./add-donor-account.component.scss']
})
export class AddDonorAccountComponent implements OnInit{
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
  memberList : any = [];
  allCenter : any = [];
  donor : any;
  donor_id : any;
  selectedDate: Date = new Date();
  grossBudget : any;
  AFLCBudget : any;
  start_dateFY : any;
  end_dateFY : any;
  member_id : any;
  member_code : any;
  member_name : any;

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService
  ) {}

  ngOnInit(): void {
    this.getBudgetCategory();
  }

  getBudgetCategory(): void {
    this.globalService.getDonorList().subscribe({
      next: (data) => {
        this.donorList = data?.donor || [];
        this.memberList = data?.members || [];
      },
      error: (err) => {
        console.error('Center error:', err);
        this.toastrService.danger(err.message, 'Error');
      },
    });
  }

  donorSelect(value:any){
    this.donor = value.name;
    this.donor_id = value.id;
  }

  spocSelect(value:any){
    this.member_id   = value.member_id;
    this.member_code = value.member_code;
    this.member_name = value.first_name + ' ' + value.last_name;
    console.log(value);
  }

  formatToMonthYear(date: Date): string {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${month}-${year}`;
  }

  startDateChange(date:any){
    const formattedDate = this.formatToMonthYear(date);
    this.start_dateFY = formattedDate;
  }

  endDateChange(date:any){
    const formattedDate = this.formatToMonthYear(date);
    this.end_dateFY = formattedDate;
    if(this.start_dateFY && this.end_dateFY){
      this.model.budget_name = this.donor + " From " + this.start_dateFY + " To " + this.end_dateFY;
    }
  }

  onSubmit(fm:any){
    fm.value.donor_id      = this.donor_id;
    fm.value.donor_name    = this.donor;
    fm.value.member_id   = this.member_id;
    fm.value.member_code = this.member_code;
    fm.value.member_name = this.member_name;
    console.log(fm.value);
    if (fm.valid) {
      this.globalService.saveDonorAccount(fm.value).subscribe({
        next: (res) => {
          fm.resetForm();
          this.toastrService.success(res.message, 'Donor Account Created Successfully!');
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
