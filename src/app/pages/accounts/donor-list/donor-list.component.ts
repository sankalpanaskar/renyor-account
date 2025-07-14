import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { LocalDataSource } from 'ng2-smart-table';

@Component({
  selector: 'ngx-donor-list',
  templateUrl: './donor-list.component.html',
  styleUrls: ['./donor-list.component.scss']
})
export class DonorListComponent implements OnInit {

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
      donorName: {
        title: 'Donor Name',
        type: 'string',
        filter: false,
        editable: false
      },
      status: {
        title: 'Status',
        type: 'string',
        filter: false,
        editable: false
      }
    },
  };

  apiData : any = [];
  originalData : any;
  
  donorList : any = [];
  loading: boolean = false; // <-- Add this to your class


  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
    private dialogService: NbDialogService
  ) { }

  ngOnInit(): void {
    this.getDonorList();
  }

  getDonorList(): void {
    this.globalService.getDonorList().subscribe({
      next: (data) => {
        this.donorList = data?.donor || [];
        const mappedData = this.donorList.map((item, index) => ({
          slNo        : index + 1,
          donorName   : item.name,
          status      : item.status,
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
 

  onSearch(query: string = ''): void {
  if (query.trim()) {
    this.source.setFilter(
      [{ field: 'donorName', search: query }],
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
{

}
