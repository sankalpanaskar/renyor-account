import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { RejectedCounselingButtonComponent } from './rejected-counseling-btn.component';
import { LocalDataSource } from 'ng2-smart-table';
import { RejectedInterviewComponent } from '../rejected-interview/rejected-interview.component';

@Component({
  selector: 'ngx-rejected-counseling',
  templateUrl: './rejected-counseling.component.html',
  styleUrls: ['./rejected-counseling.component.scss']
})
export class RejectedCounselingComponent implements OnInit{
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
      lead_id: {
        title: 'ID',
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
      leadEmail: {
        title: 'Email',
        width: '180px',
        type: 'html',
        filter: false,
        editable: false,
        valuePrepareFunction: (cell: string) => {
          return `<div class="wrap-email">${cell}</div>`;
        }
      },
      phone: {
        title: 'Phone',
        type: 'number',
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
      POApproval: {
        title: 'Counseling Status',
        width: '160px',
        filter: false,
        editable: false,
        type: 'html',
        valuePrepareFunction: (cell: any) => {
          console.log("cell value---", cell);
          if (cell === 6) {
            return `<h6><span class="badge rounded-pill bg-warning text-white pl-2 pr-2 custom-badge">Student Pending</span></h6>`;
          }
          else if (cell === 7) {
            return `<h6><span class="badge rounded-pill bg-danger text-white pl-2 pr-2 custom-badge">PO Pending</span></h6>`;
          }
          else if (cell === 9) {
            return `<h6><span class="badge rounded-pill bg-success text-white pl-2 pr-2 custom-badge">PO Done</span></h6>`;
          }
          else if (cell === 8) {
            return `<h6><span class="badge rounded-pill bg-success text-white pl-2 pr-2 custom-badge">PO Done</span></h6>`;
          }

        }
      },
      action2: {
        title: 'Action',
        type: 'custom',
        width: '80px',
        renderComponent: RejectedCounselingButtonComponent,
        filter: false,
        onComponentInitFunction: (instance) => {
          instance.editClicked.subscribe((row) => {
            console.log('Row passed from CustomCounselingButtonComponent[]:', row);
            this.openEditDialog(row); // 👈 Send full original object
          });
        }
      }
    },
  };
  apiData: any = [];
  originalData: any;
  centerList: any = [];
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
    this.loadCentersRejected();
  }

  loadCentersRejected() {
    this.globalService.getRejectedCenterFilter().subscribe({
      next: (res) => {
        this.centerList = res.data;

      },
      error: (err) => {
        console.error('State error:', err);
        this.toastrService.danger(err.message, 'Error');
      },
    });
  }

  centerChange(centerData) {
    this.selectedCenter = centerData; // ✅ Track selected
    console.log("center data", centerData);
    this.loadRejectedStudentList(this.selectedCenter.center_id);
  }

  loadRejectedStudentList(centerId) {
    this.loading = true;
    this.globalService.getRejectedStudentList(centerId).subscribe({
      next: (res) => {
        this.apiData = res.data; // ✅ Store API data here first
        const mappedData = this.apiData.map((item, index) => ({
          lead_id: item.lead_id,
          slNo: index + 1,
          leadName: `${item.first_name} ${item.last_name}`,
          leadEmail: item.email_id || 'N/A',
          counselingStatus: item.student_counseling_status, // ✅ Corrected based on your data
          phone: item.phone_number,
          center: item.center_code,
          course: item.course_alias,
          POStatus: item.po_counseling_status, // ✅ Corrected based on your data
          POApproval: item.lead_status_id,
          id: item.lead_id, // ✅ Required if used in the custom component
          canEdit: item.student_counseling_status === 1 // ✅ Flag to control button state
        }));
        this.source.load(mappedData);
        this.loading = false;
      },
      error: (err) => {
        console.error('Student load error:', err);
        this.toastrService.danger(err.message, 'Error');
        this.loading = false;
      },
    });
  }
  onFilterChange(status: string) {
    this.selectedFilter = status;
    this.applyFilter(status);
  }

  applyFilter(status: string) {
    let filteredData = [];

    if (status === 'all') {
      filteredData = this.apiData;
    }
    // else if (status === 'student_done') {
    //   filteredData = this.apiData.filter(student => student.student_counseling_status === 1);
    // } 
    else if (status === 'student_pending') {
      filteredData = this.apiData.filter(student => student.lead_status_id === 6);
    } else if (status === 'po_done') {
      filteredData = this.apiData.filter(student => student.lead_status_id === 8);
    } else if (status === 'po_pending') { // ✅ fixed this line
      filteredData = this.apiData.filter(student => student.lead_status_id === 7);
    }

    const mappedData = filteredData.map((item, index) => ({
      lead_id: item.lead_id,
      slNo: index + 1,
      leadName: `${item.first_name} ${item.last_name}`,
      leadEmail: item.email_id || 'N/A',
      counselingStatus: item.student_counseling_status,
      phone: item.phone_number,
      center: item.center_code,
      course: item.course_alias,
      POStatus: item.po_counseling_status,
      POApproval: item.lead_status_id,
      id: item.lead_id,
      canEdit: item.student_counseling_status === 1
    }));

    this.source.load(mappedData);
  }



  openEditDialog(rowData): void {
    console.log('Opening dialog with rowData {{{{}}}}:', rowData); // <-- Add this
    this.dialogService.open(RejectedInterviewComponent, {
      context: { data: rowData }
    }).onClose.subscribe(updatedData => {
      if (updatedData?.updated) {
        console.log('Updated lead:', updatedData);
        if (this.selectedCenter?.center_id) {
          this.loadRejectedStudentList(this.selectedCenter.center_id);
        }
      }else{
        this.loadRejectedStudentList(this.selectedCenter.center_id);
      }
    });
  }


  // openEditDialogStudent(rowData): void {
  //   console.log('Opening dialog with rowData {{{{}}}}:', rowData); // <-- Add this
  //   this.dialogService.open(StudentAnswersComponent, {
  //     // context: rowData, // Make sure `rowData` is an object
  //     context: { data: rowData}
  //   }).onClose.subscribe(updatedData => {
  //     if (updatedData) {
  //       console.log('Updated lead:', updatedData);
  //     }
  //   });
  // }

  onSearch(query: string = ''): void {
    this.source.setFilter([
      { field: 'leadName', search: query },
      { field: 'counselingStatus', search: query },
      { field: 'POApproval', search: query },
      { field: 'phone', search: query },
      { field: 'center', search: query },
      { field: 'course', search: query }

    ], false);

    if (this.source.count() === 0) {
      this.source.reset();
    }
  }

  onDeleteConfirm(event): void {
    if (window.confirm('Are you sure you want to delete?')) {
      event.confirm.resolve();
    } else {
      event.confirm.reject();
    }
  }



}
