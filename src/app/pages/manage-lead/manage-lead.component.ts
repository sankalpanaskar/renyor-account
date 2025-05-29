import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { GlobalService } from '../../services/global.service'; // or correct relative path
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { CustomEditButtonComponent } from './custom-edit-btn.component';
import { LeadEditDialogComponent } from '../lead-edit-dialog/lead-edit-dialog.component';

@Component({
  selector: 'ngx-manage-lead',
  templateUrl: './manage-lead.component.html',
  styleUrls: ['./manage-lead.component.scss']
})
export class ManageLeadComponent implements OnInit {

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
      id: {
        title: 'ID',
        type: 'number',
        hide: true, // ✅ Hide from view
        isHidden: true, // Optional, for clarity
      },
      leadStatusId: {
        title: 'leadId',
        type: 'number',
        hide: true, // ✅ Hide from view
        isHidden: true, // Optional, for clarity
      },
      slNo: {
        title: 'SL',
        type: 'number',
        filter: false,
        editable: false
      },
      leadName: {
        title: 'Name',
        width: '60px',
        type: 'string',
        filter: false,
        editable: false
      },
      leadSource: {
        title: 'Source',
        type: 'string',
        filter: false,
        editable: false
      },
      leadStatus: {
        title: 'Status',
        width: '50px',
        filter: false,
        editable: false,
        type: 'html',
        valuePrepareFunction: (cell: any) => {
          console.log("cell value---", cell);
          if (cell === 'new_lead') {
            return `<h6><span class="badge rounded-pill bg-primary text-white pl-2 pr-2 custom-badge">New Lead</span></h6>`;
          }
          else if (cell === 'not_connected') {
            return `<h6><span class="badge rounded-pill bg-primary text-white pl-2 pr-2 custom-badge">Not Connected</span></h6>`;
          }
          else if (cell === 'connected') {
            return `<h6><span class="badge rounded-pill bg-primary text-white pl-2 pr-2">Connected</span></h6>`;
          }
          else if (cell === 'do_not_call') {
            return `<h6><span class="badge rounded-pill bg-primary text-white pl-2 pr-2 custom-badge">Do Not Call </span></h6>`;
          }
          else if (cell === 'interested') {
            return `<h6><span class="badge rounded-pill bg-primary text-white pl-2 pr-2">Interested</span></h6>`;
          }
          else if (cell === 'counseling_link_send') {
            return `<h6><span class="badge rounded-pill bg-primary text-white pl-2 pr-2 custom-badge">Counselling Link Send</span></h6>`;
          }
          else if (cell === 'student_counseling_done') {
            return `<h6><span class="badge rounded-pill bg-primary text-white pl-2 pr-2">Student Counselling Done </span></h6>`;
          }
          else if (cell === 'po_counseling_done') {
            return `<h6><span class="badge rounded-pill bg-primary text-white pl-2 pr-2">PO Counseling Done</span></h6>`;
          }
          else if (cell === 'test_link_send') {
            return `<h6><span class="badge rounded-pill bg-primary text-white pl-2 pr-2">Test Link Send</span></h6>`;
          }
          else if (cell === 'test_passed') {
            return `<h6><span class="badge rounded-pill bg-primary text-white pl-2 pr-2">Test Passed</span></h6>`;
          }
          else if (cell === 'test_failed') {
            return `<h6><span class="badge rounded-pill bg-primary text-white pl-2 pr-2">Test Failed</span></h6>`;
          }
          else if (cell === 'ori_generated') {
            return `<h6><span class="badge rounded-pill bg-primary text-white pl-2 pr-2">ORI Generated</span></h6>`;
          }
          else if (cell === 'registration_done') {
            return `<h6><span class="badge rounded-pill bg-primary text-white pl-2 pr-2">Registration Done</span></h6>`;
          }
          else if (cell === 'mne_verification_done') {
            return `<h6><span class="badge rounded-pill bg-primary text-white pl-2 pr-2">MNE Verification Done</span></h6>`;
          }
          else if (cell === 'enrolled') {
            return `<h6><span class="badge rounded-pill bg-primary text-white pl-2 pr-2">Enrolled</span></h6>`;
          }
          else if (cell === 'po_counseling_rejected') {
            return `<h6><span class="badge rounded-pill bg-danger text-white pl-2 pr-2">PO Rejected</span></h6>`;
          }
          // else {
          //   return `<h6><span class="badge rounded-pill bg-info text-white pl-2 pr-2">Interested</span></h6>`;
          // }
        }
      },
      owner: {
        title: 'Owner',
        width: '60px',
        type: 'string',
        filter: false,
        editable: false
      },
      phone: {
        title: 'Phone',
        type: 'number',
        filter: false,
        editable: false
      },
    //  oriId: {
    //     title: 'Ori no',
    //     type: 'number',
    //     filter: false,
    //     editable: false
    //   },
      state: {
        title: 'State',
        width: '80px',
        type: 'string',
        filter: false,
        editable: false
      },
      center: {
        title: 'Center',
        type: 'string',
        filter: false,
        editable: false
      },
      course: {
        title: 'Course',
        type: 'string',
        filter: false,
        editable: false
      },
      callDate: {
        title: 'Call Date',
        width: '120px',
        type: 'string',
        filter: false,
        editable: false
      },
      action: {
        title: 'Action',
        type: 'custom',
        renderComponent: CustomEditButtonComponent,
        filter: false,
        onComponentInitFunction: (instance) => {
          instance.editClicked.subscribe((row) => {
            console.log('Row passed from CustomEditButtonComponent:', row);
            const fullRowData = this.apiData.find(item => item.id === row.id); // ✅ Match by ID
            console.log('Full API object for selected row:', fullRowData);

            this.openEditDialog(fullRowData); // 👈 Send full original object
          });
        }
      }
    },
  };
  apiData: any = [];
  originalData: any;
  todayCount: any;
  yesterdayCount: any;
  tomorrowCount: any;
  centerIds: any = [];
  loading: boolean = false; // <-- Add this to your class
  noDataFound: boolean =  false;
  newLeadCount: any;
  studentPendingCount: any;
  poPendingCount: any;
  quizPendingCount: any;
  oriPendingCount: any;
  readyToEnrollCount: any;
  connectCount: any;
  notConnectCount: any;
  doNotCallCount: any;
  interestedCount: any;
  poRejectedCount: any;
  quizFailedCount: any;
  oriGeneratedCount: any;
  registrationDoneCount: any;
  mneVerificationCount: any;
  enrolledCount: any;
  selectedFilter: string | null = null;


  constructor(
    public globalService: GlobalService,
    private toastrService: NbToastrService,
    private dialogService: NbDialogService
  ) { }

  ngOnInit(): void {
    console.log("role id------- is ",this.globalService.role_id);
    // ✅ Extract only the center_id values into an array
    this.centerIds = this.globalService.centerData.map((item: any) => item.center_id);

    console.log("Extracted centerIds:", this.centerIds);
    this.getLeadData();
  }

  openEditDialog(rowData): void {
    console.log('Opening dialog with rowData {{{{}}}}:', rowData); // <-- Add this
    const originalData = this.apiData.find(
      item => item.id === rowData.id // or another unique field
    );
    console.log("orignal data", originalData);
    this.dialogService.open(LeadEditDialogComponent, {
      // context: rowData, // Make sure `rowData` is an object
      context: { data: rowData }
    }).onClose.subscribe(updatedData => {
      this.getLeadData();
      if (updatedData) {
        console.log('Updated lead:', updatedData);
      }
    });
  }

  getLeadData(): void {
    this.selectedFilter = null; // Reset filter dropdown when "ALL" is clicked
    var data = {
      center_id: this.centerIds
    }
    this.loading = true;
    this.globalService.getLeadData(data).subscribe({
      next: (response) => {
        this.apiData = response.data || [];
        const mappedData = this.apiData.map((item, index) => ({
          id: item.id,
          slNo: index + 1,
          leadName: `${item.first_name} ${item.last_name}`,
          leadSource: item.source_type || 'N/A',
          // leadStatus: this.getStatusLabel(item.follow_up_status),
          leadStatus: item.lead_status,
          owner: item.created_by_name,
          phone: item.phone_number,
          state: item.state,
          center: item.center_code,
          course: item.course_alias,
          callDate: item.follow_up_date,
          leadStatusId: item.lead_status_id,
          oriId: item.ori_no

        }));
        this.source.load(mappedData);
        this.updateFollowupCounts();
        this.loading = false;
        // console.log("")
      },
      error: (err) => {
        console.error('Lead data error:', err);
        this.toastrService.danger(err.message, 'Error');
        this.loading = false;
      },
    });
  }

  updateFollowupCounts(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize to midnight
    const todayStr = this.formatDateToYYYYMMDD(today);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = this.formatDateToYYYYMMDD(yesterday);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = this.formatDateToYYYYMMDD(tomorrow);

    // Now count in apiData (assuming follow_up_date is in YYYY-MM-DD format)
    this.todayCount = this.apiData.filter(item => item.follow_up_date === todayStr).length;
    this.yesterdayCount = this.apiData.filter(item => item.follow_up_date === yesterdayStr).length;
    this.tomorrowCount = this.apiData.filter(item => item.follow_up_date === tomorrowStr).length;
    // NEW LEAD COUNT
    this.newLeadCount = this.apiData.filter(item => item.lead_status_id === 1).length;
    //new
    this.studentPendingCount = this.apiData.filter(item => item.lead_status_id === 6).length;
    this.poPendingCount = this.apiData.filter(item => item.lead_status_id === 7).length;
    this.quizPendingCount = this.apiData.filter(item => item.lead_status_id === 8).length;
    this.oriPendingCount = this.apiData.filter(item => item.lead_status_id === 10).length;
    this.connectCount = this.apiData.filter(item => item.lead_status_id === 3).length;
    this.notConnectCount = this.apiData.filter(item => item.lead_status_id === 2).length;
    this.doNotCallCount = this.apiData.filter(item => item.lead_status_id === 4).length;
    this.interestedCount = this.apiData.filter(item => item.lead_status_id === 5).length;
    this.poRejectedCount = this.apiData.filter(item => item.lead_status_id === 9).length;
    this.quizFailedCount =  this.apiData.filter(item => item.lead_status_id === 11).length;
    this.oriGeneratedCount = this.apiData.filter(item => item.lead_status_id === 12).length;
    this.registrationDoneCount = this.apiData.filter(item => item.lead_status_id === 13).length;
    this.mneVerificationCount = this.apiData.filter(item => item.lead_status_id === 14).length;
    this.enrolledCount = this.apiData.filter(item => item.lead_status_id === 15).length;


  }

  formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

 filterFollowups(filterType: string): void {
   // Deselect dropdown when a Followup button is clicked
  const dropdownFilters = [
    'connected', 'not-connected', 'do-not-call', 'interested',
    'studentPending', 'poPending', 'poRejected', 'quizPending',
    'oriPending', 'quizFailed', 'oriGenerated', 'registrationDone',
    'mneVerification', 'enrolled'
  ];

  if (!dropdownFilters.includes(filterType)) {
    this.selectedFilter = null; // Reset the dropdown
  }
  console.log("filter type",filterType);
  let filteredData = [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

   if (filterType === 'today') {
     const dateStr = this.formatDateToYYYYMMDD(today);
     filteredData = this.apiData.filter(item => item.follow_up_date === dateStr);
   } else if (filterType === 'yesterday') {
     const date = new Date(today);
     date.setDate(today.getDate() - 1);
     const dateStr = this.formatDateToYYYYMMDD(date);
     filteredData = this.apiData.filter(item => item.follow_up_date === dateStr);
   } else if (filterType === 'tomorrow') {
     const date = new Date(today);
     date.setDate(today.getDate() + 1);
     const dateStr = this.formatDateToYYYYMMDD(date);
     filteredData = this.apiData.filter(item => item.follow_up_date === dateStr);
   } else if (filterType === 'newLead') {
     // FILTER FOR NEW LEADS (lead_status_id === 1)
     filteredData = this.apiData.filter(item => item.lead_status_id === 1);
   }
   // New
   else if (filterType === 'studentPending') {
     filteredData = this.apiData.filter(item => item.lead_status_id === 6);
   }
   else if (filterType === 'poPending') {
     filteredData = this.apiData.filter(item => item.lead_status_id === 7);
   }
   else if (filterType === 'quizPending') {
     filteredData = this.apiData.filter(item => item.lead_status_id === 8);
   }
   else if (filterType === 'oriPending') {
     filteredData = this.apiData.filter(item => item.lead_status_id === 10);
   }
  //  else if (filterType === 'readyToEnroll') {
  //    filteredData = this.apiData.filter(item => item.lead_status_id === 14);
  //  }
   else if (filterType === 'connected') {
     filteredData = this.apiData.filter(item => item.lead_status_id === 3);
   }
   else if (filterType === 'not-connected') {
     filteredData = this.apiData.filter(item => item.lead_status_id === 2);
   }
   else if (filterType === 'do-not-call') {
     filteredData = this.apiData.filter(item => item.lead_status_id === 4);
   }
   else if (filterType === 'interested') {
     filteredData = this.apiData.filter(item => item.lead_status_id === 5);
   }
   else if (filterType === 'poRejected') {
     filteredData = this.apiData.filter(item => item.lead_status_id === 9);
   }
   else if (filterType === 'quizFailed') {
     filteredData = this.apiData.filter(item => item.lead_status_id === 11);
   }
   else if (filterType === 'oriGenerated') {
     filteredData = this.apiData.filter(item => item.lead_status_id === 12);
   }
   else if (filterType === 'registrationDone') {
     filteredData = this.apiData.filter(item => item.lead_status_id === 13);
   }
   else if (filterType === 'mneVerification') {
     filteredData = this.apiData.filter(item => item.lead_status_id === 14);
   }
   else if (filterType === 'enrolled') {
     filteredData = this.apiData.filter(item => item.lead_status_id === 15);
   }  
  
  

  const mappedData = filteredData.map((item, index) => ({
    id: item.id,
    slNo: index + 1,
    leadName: `${item.first_name} ${item.last_name}`,
    leadSource: item.source_type || 'N/A',
    leadStatus: item.lead_status,
    owner: item.created_by_name,
    phone: item.phone_number,
    state: item.state,
    center: item.center_code,
    course: item.course_alias,
    callDate: item.follow_up_date,
    leadStatusId: item.lead_status_id,
    oriId: item.ori_no
  }));

  this.source.load(mappedData);
}


  // getStatusLabel(status: number | string): string {
  //   switch (status) {
  //     case 0:
  //     case '0':
  //       return '0';
  //     case 1:
  //     case '1':
  //       return '1';
  //     case 2:
  //     case '2':
  //       return '2';
  //     default:
  //       return '3';
  //   }
  // }

  onSearch(query: string = ''): void {
    this.source.setFilter([
      { field: 'leadName', search: query },
      { field: 'leadSource', search: query },
      { field: 'leadStatus', search: query },
      { field: 'phone', search: query },
      { field: 'callDate', search: query },
      { field: 'center', search: query },
      { field: 'course', search: query }

    ], false);

    if (this.source.count() === 0) {
      this.noDataFound = this.source.count() === 0;
      this.source.reset();
    }
  }

  // onDeleteConfirm(event): void {
  //   if (window.confirm('Are you sure you want to delete?')) {
  //     event.confirm.resolve();
  //   } else {
  //     event.confirm.reject();
  //   }
  // }



}
