import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { LocalDataSource } from 'ng2-smart-table';

@Component({
  selector: 'ngx-donor-account-list',
  templateUrl: './donor-account-list.component.html',
  styleUrls: ['./donor-account-list.component.scss']
})
export class DonorAccountListComponent implements OnInit {

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
      budgetName: {
        title: 'Donor Name',
        type: 'string',
        filter: false,
        editable: false
      },
      fcNfc: {
        title: 'FC/NFC',
        type: 'string',
        filter: false,
        editable: false
      },
      type: {
        title: 'Type',
        type: 'string',
        filter: false,
        editable: false
      },
      startDate: {
        title: 'Start Date',
        type: 'string',
        filter: false,
        editable: false
      },
      endDate: {
        title: 'End Date',
        type: 'string',
        filter: false,
        editable: false
      },
      financeSpoc: {
        title: 'SPOC',
        type: 'string',
        filter: false,
        editable: false
      }
    },
  };

  apiData : any = [];
  originalData : any;
  
  donoAccountList : any = [];
  pendingStudentList = [];
  completeStudentList = [];
  isPendingTab = true;
  selectedCenter: any;
  studentList: any = [];
  expandedStudent: any = null;
  selectedFilter = 'all';
  loading: boolean = false; // <-- Add this to your class


  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
    private dialogService: NbDialogService
  ) { }

  ngOnInit(): void {
    this.getDonorAccountList();
  }

  getDonorAccountList() {
    this.globalService.getDonorAccount().subscribe({
      next: (data) => {
        this.donoAccountList = data?.donor || []; 
        console.log(this.apiData);
        const mappedData = this.donoAccountList.map((item, index) => ({
          slNo        : index + 1,
          budgetName  : item.budget_name,
          fcNfc       : item.fc_nfc_status,
          type        : item.budget_type,
          startDate   : item.start_date,
          endDate     : item.end_date,
          financeSpoc : item.finance_spoc_name,
        }));
        this.source.load(mappedData);
        this.loading = false;
      },
      error: (err) => {
        console.error('Center error:', err);
        this.toastrService.danger(err.message, 'Error');
        this.loading = false;
      },
    });
  }
 
  // onFilterChange(status: string) {
  //   this.selectedFilter = status;
  //   this.applyFilter(status);
  // }

  // applyFilter(status: string) {
  //   let filteredData = [];

  //   if (status === 'all') {
  //     filteredData = this.apiData;
  //   }
  //   else if (status === 'student_pending') {
  //     filteredData = this.apiData.filter(student => student.lead_status_id === 6);
  //   } else if (status === 'po_done') {
  //     filteredData = this.apiData.filter(student => student.lead_status_id === 8);
  //   } else if (status === 'po_pending') { // ✅ fixed this line
  //     filteredData = this.apiData.filter(student => student.lead_status_id === 7);
  //   }

  //   const mappedData = filteredData.map((item, index) => ({
  //     lead_id: item.lead_id,
  //     slNo: index + 1,
  //     leadName: `${item.first_name} ${item.last_name}`,
  //     leadEmail: item.email_id || 'N/A',
  //     counselingStatus: item.student_counseling_status,
  //     phone: item.phone_number,
  //     center: item.center_code,
  //     course: item.course_alias,
  //     POStatus: item.po_counseling_status,
  //     POApproval: item.lead_status_id,
  //     id: item.lead_id,
  //     canEdit: item.student_counseling_status === 1
  //   }));

  //   this.source.load(mappedData);
  // }



  // openEditDialog(rowData): void {
  //   console.log('Opening dialog with rowData {{{{}}}}:', rowData); // <-- Add this
  //   this.dialogService.open(InterviewQuestionsComponent, {
  //     context: { data: rowData }
  //   }).onClose.subscribe(updatedData => {
  //     if (updatedData?.updated) {
  //       console.log('Updated lead:', updatedData);
  //       if (this.selectedCenter?.center_id) {
  //         this.loadStudentList(this.selectedCenter.center_id);
  //       }
  //     }else{
  //       this.loadStudentList(this.selectedCenter.center_id);
  //     }
  //   });
  // }



  onSearch(query: string = ''): void {
  if (query.trim()) {
    this.source.setFilter(
      [{ field: 'budgetName', search: query }],
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


  onDeleteConfirm(event): void {
    if (window.confirm('Are you sure you want to delete?')) {
      event.confirm.resolve();
    } else {
      event.confirm.reject();
    }
  }

}
