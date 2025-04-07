import { Component } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';

import { SmartTableData } from '../../../app/@core/data/smart-table';
import { CustomEditButtonComponent } from './custom-edit-btn.component';
@Component({
  selector: 'ngx-manage-lead',
  templateUrl: './manage-lead.component.html',
  styleUrls: ['./manage-lead.component.scss']
})
export class ManageLeadComponent {

  data = [
    {
    slNo: 1,
    leadName: 'Sankalpa Naskar',
    leadSource: 'Whatsapp',
    leadStatus: '0',
    owner: 'Debdas Mondal',
    phone: '7501191806',
    state: 'West Bengal',
    center: 'WBMSI',
    course: 'APJW',
    callDate: '28/01/2025',
    },
    {
      slNo: 2,
      leadName: 'Arup Das',
      leadSource: 'Facebook',
      leadStatus: '4',
      owner: 'Debdas Mondal',
      phone: '7501191806',
      state: 'West Bengal',
      center: 'WBMSI',
      course: 'APJW',
      callDate: '28/01/2025',
    },
    {
      slNo: 3,
      leadName: 'Sankalpa Naskar',
      leadSource: 'Whatsapp',
      leadStatus: '2',
      owner: 'Debdas Mondal',
      phone: '7501191806',
      state: 'West Bengal',
      center: 'WBMSI',
      course: 'APJW',
      callDate: '28/01/2025',
      },
      {
        slNo: 4,
        leadName: 'Arup Das',
        leadSource: 'Facebook',
        leadStatus: '1',
        owner: 'Debdas Mondal',
        phone: '7501191806',
        state: 'West Bengal',
        center: 'WBMSI',
        course: 'APJW',
        callDate: '29/01/2025',
      },
      {
        slNo: 5,
        leadName: 'Sankalpa Naskar',
        leadSource: 'Whatsapp',
        leadStatus: '1',
        owner: 'Debdas Mondal',
        phone: '7501191806',
        state: 'West Bengal',
        center: 'WBMSI',
        course: 'APJW',
        callDate: '26/01/2025',
        },
        {
          slNo: 6,
          leadName: 'Arup Das',
          leadSource: 'Facebook',
          leadStatus: '3',
          owner: 'Debdas Mondal',
          phone: '7501191806',
          state: 'West Bengal',
          center: 'WBMSI',
          course: 'APJW',
          callDate: '28/01/2025',
        },
        {
          slNo: 7,
          leadName: 'Sankalpa Naskar',
          leadSource: 'Whatsapp',
          leadStatus: 'Warm',
          owner: 'Debdas Mondal',
          phone: '7501191806',
          state: 'West Bengal',
          center: 'WBMSI',
          course: 'APJW',
          callDate: '28/01/2025',
          },
          {
            slNo: 8,
            leadName: 'Arup Das',
            leadSource: 'Facebook',
            leadStatus: 'Cool',
            owner: 'Debdas Mondal',
            phone: '7501191806',
            state: 'West Bengal',
            center: 'WBMSI',
            course: 'APJW',
            callDate: '28/01/2025',
          },
          {
            slNo: 9,
            leadName: 'Sankalpa Naskar',
            leadSource: 'Whatsapp',
            leadStatus: 'Warm',
            owner: 'Debdas Mondal',
            phone: '7501191806',
            state: 'West Bengal',
            center: 'WBMSI',
            course: 'APJW',
            callDate: '28/01/2025',
            },
            {
              slNo: 10,
              leadName: 'Arup Das',
              leadSource: 'Facebook',
              leadStatus: 'Cool',
              owner: 'Debdas Mondal',
              phone: '7501191806',
              state: 'West Bengal',
              center: 'WBMSI',
              course: 'APJW',
              callDate: '28/01/2025',
            }
  ];

  settings = {
    pager: {
      display: true,  // Enables pagination
      perPage: 5      // Sets 5 items per page
    },
    actions: {
      edit: false, // Disable default edit action
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
      leadName: {
        title: 'Name',
        width: '180px',
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
        filter: false,
        editable: false,
        type: 'html',
        valuePrepareFunction: (cell: any) => {
          if (cell === '0') {
            return `<h6><span class="badge rounded-pill bg-primary text-white pl-2 pr-2">Cool</span></h6>`;
          } else if (cell === '1') {
            return `<h6><span class="badge rounded-pill bg-warning text-white pl-2 pr-2">Warm</span></h6>`;
          } else if (cell === '2') {
            return `<h6><span class="badge rounded-pill bg-danger text-white pl-2 pr-2">Hot</span></h6>`;
          } else {
            return `<h6><span class="badge rounded-pill bg-info text-white pl-2 pr-2">Interested</span></h6>`; 
          }
        }
        
      },
      owner: {
        title: 'Owner',
        width: '150px',
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
        width: '150px',
        type: 'number',
        filter: false,
        editable: false
      },
      center: {
        title: 'Center',
        type: 'number',
        filter: false,
        editable: false
      },
      course: {
        title: 'Course',
        type: 'number',
        filter: false,
        editable: false
      },
      callDate: {
        title: 'Call Date',
        width: '120px',
        type: 'number',
        filter: false,
        editable: false
      },
      action: {
        title: 'Action',
        type: 'custom',
        renderComponent: CustomEditButtonComponent, // Custom edit button
        filter: false
      }
    },
  };

  onSearch(query: string = '') {
    this.source.setFilter([
      // fields we want to include in the search
      {
        field: 'leadName',
        search: query
      },
      {
        field: 'leadSource',
        search: query
      },
      {
        field: 'leadStatus',
        search: query
      },
      {
        field: 'callDate',
        search: query
      }
    ], false);
    if (this.source.count() === 0) {
      this.source.reset(); // Resets to show all data again
    }

  //source: LocalDataSource = new LocalDataSource();

  
  }
  onDeleteConfirm(event): void {
    if (window.confirm('Are you sure you want to delete?')) {
      event.confirm.resolve();
    } else {
      event.confirm.reject();
    }
  }

  source: LocalDataSource;
  
  constructor() {
    this.source = new LocalDataSource(this.data);
  }

}
