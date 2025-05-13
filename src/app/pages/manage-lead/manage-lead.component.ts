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
        width: '120px',
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
        width: '80px',
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
        width: '130px',
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
          leadStatusId: item.lead_status_id
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
  }

  formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  filterFollowups(filterType: string): void {
    let dateToFilter: Date;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filterType === 'today') {
      dateToFilter = today;
    } else if (filterType === 'yesterday') {
      dateToFilter = new Date(today);
      dateToFilter.setDate(today.getDate() - 1);
    } else if (filterType === 'tomorrow') {
      dateToFilter = new Date(today);
      dateToFilter.setDate(today.getDate() + 1);
    }

    const formattedDate = this.formatDateToYYYYMMDD(dateToFilter);

    // Filter the original data based on follow_up_date 
    const filteredData = this.apiData.filter(item => item.follow_up_date === formattedDate);

    console.log("date wise filtered data", filteredData);
    const mappedData = filteredData.map((item, index) => ({
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
      leadStatusId: item.lead_status_id
    }));

    // Now update the smart table data source (if that's what you want)
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
