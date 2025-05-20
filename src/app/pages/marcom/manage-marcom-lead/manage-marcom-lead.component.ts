import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { LocalDataSource } from 'ng2-smart-table';
import { CustomCheckboxComponent } from './custom-checkbox.component';
import { CenterDialogComponent } from '../center-dialog/center-dialog.component';

@Component({
  selector: 'ngx-manage-marcom-lead',
  templateUrl: './manage-marcom-lead.component.html',
  styleUrls: ['./manage-marcom-lead.component.scss']
})
export class ManageMarcomLeadComponent implements OnInit{
source: LocalDataSource = new LocalDataSource();

  settings = {
    pager: {
      display: true,
      perPage: 8
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
      title: 'Select',
      type: 'custom',
      renderComponent: CustomCheckboxComponent, // 👈 A custom component we'll create
      filter: false,
      editable: false,
      onComponentInitFunction: (instance) => {
        instance.checked.subscribe((row) => {
          const exists = this.selectedRows.find(r => r.id === row.id);
          if (!exists) {
            this.selectedRows.push(row);
            console.log('Current selectedRows:', this.selectedRows);
          }
        });
        instance.unchecked.subscribe((row) => {
          this.selectedRows = this.selectedRows.filter(r => r.id !== row.id);
          console.log('Current selectedRows after remove:', this.selectedRows);
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
  selectedRows: any[] = [];


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

openEditDialog(): void {
  this.dialogService.open(CenterDialogComponent, {
    context: { data: this.selectedRows },
  dialogClass: 'center-dialog-no-shift'

  }).onClose.subscribe(updatedData => {
    this.getLeadData();
    if (updatedData) {
      console.log('Updated lead:', updatedData);
    }
  });
}


//   onUserRowSelect(event: any): void {
//   const selectedRow = event.data;
//   const isChecked = event.isSelected;

//   if (isChecked) {
//     // Add if not already in array
//     const exists = this.selectedRows.find(row => row.id === selectedRow.id);
//     if (!exists) {
//       this.selectedRows.push(selectedRow);
//     }
//   } else {
//     // Remove from array
//     this.selectedRows = this.selectedRows.filter(row => row.id !== selectedRow.id);
//   }

//   console.log('Selected rows:', this.selectedRows);
// }


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
          leadStatusId: item.lead_status_id,
          oriId: item.ori_no

        }));
        this.source.load(mappedData);
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

