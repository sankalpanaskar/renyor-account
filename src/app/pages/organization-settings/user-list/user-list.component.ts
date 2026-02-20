import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { DatePipe } from '@angular/common';
import { LocalDataSource } from 'ng2-smart-table';
import { Router } from '@angular/router';
import { UserButtonComponent } from './custom-btn.component';

@Component({
  selector: 'ngx-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit{
 source: LocalDataSource = new LocalDataSource();

  settings = {
    pager: {
      display: true,
      perPage: 10
    },
    actions: false, // disable default actions
    columns: {
      type: {
        title: 'ID',
        width: '5%',
        type: 'string',
        filter: false,
        editable: false
      }, 
      role: {
        title: 'Role',
        width: '15%',
        type: 'string',
        filter: false,
        editable: false
      }, 
      name: {
        title: 'Name',
        width: '10%',
        type: 'string',
        filter: false,
        editable: false
      }, 
      email: {
        title: 'email',
        width: '10%',
        type: 'string',
        filter: false,
        editable: false
      }, 
      phone: {
        title: 'Phone',
        width: '10%',
        type: 'string',
        filter: false,
        editable: false
      },
      status: {
        title: 'Status',
        width: '5%',
        filter: false,
        editable: false,
        type: 'html',
        valuePrepareFunction: (cell: any) => {
          console.log("cell value---", cell);
          if (cell === 1) {
            return `<h6><span class="badge rounded-pill bg-success text-white pl-2 pr-2 custom-badge">Active</span></h6>`;
          }
          else if(cell === 0){
            return `<h6><span class="badge rounded-pill bg-danger text-white pl-2 pr-2 custom-badge">Not Active</span></h6>`;
          }
        }
      },
      Action: {
        title: 'Action',
        width: '10%',
        type: 'custom',
        filter: false,
        renderComponent: UserButtonComponent,
        onComponentInitFunction: (instance: any) => {
          instance.delete.subscribe((rowData: any) => {
            //this.onDelete(rowData);
          });
          instance.edit.subscribe((rowData: any) => {
            this.onEdit(rowData);
          });
        },
      },

    },
  };
  model: any = [];
  isSubmitting: boolean = false;
  loading: boolean = false; // <-- Add this to your class
  apiData: any = [];
  lastSearchForm: any; // add this variable on top of your component

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
    private router : Router,
    private dialogService: NbDialogService,
    private datePipe: DatePipe
  ) { }


  ngOnInit(): void {
    this.getUser();
  }

  getUser() {
      this.loading = true;
      this.globalService.getUserByCompany().subscribe({
        next: (res:any) => {
          console.log(res);
          this.apiData = res.data; // ✅ Store API data here first
           const mappedData = this.apiData.map((item, index) => ({
            type      : item.package_type,
            name      : item.name,
            role      : item.role_name,
            email     : item.email,
            phone     : item.phone,
            status    : item.status,
            fullData  : item, // ✅ include full object

          }));
          this.source.load(mappedData);
          this.loading = false;
        },
        error: (err) => {
          this.toastrService.danger(err, 'Failed');
          this.loading = false;
        },
      });
  }

  onDelete(rowData: any) {
    const brandData = rowData.fullData; // ✅ full object from API
    console.log("asset data delete",brandData);
    var data = {
      id : brandData.id
    }
    this.loading = true;
    // this.globalService.changeBrandStatus(data).subscribe({
    //   next:(res:any) => {
    //       //this.loadPendingList();
    //       this.toastrService.success(res.message,'Brand Status Change');
    //       this.loading = false;
    //   },
    //   error:(error:any) => {
    //       this.toastrService.danger(error.message, 'Brand Status Change Failed');
    //       this.loading = false;
    //   }
    // })
  }

  onEdit(rowData: any) {
    const brandData = rowData.fullData;

    // const dialogRef = this.dialogService.open(AddBrandComponent, {
    //   context: { brandData: brandData },   // 👈 pass data to dialog
    //   closeOnBackdropClick: true,
    //   hasScroll: true,
    // });

    // dialogRef.onClose.subscribe(() => {
    //   this.loadPendingList();              // 👈 refresh list on close
    // });
  }
  
  onSearch(query: string = ''): void {
    this.source.setFilter([
      { field: 'name', search: query },
    ], false);

    if (this.source.count() === 0) {
      this.source.reset();
    }
  }

  gotoAddUser() {
    this.router.navigate(['pages/organization-setting/add-user']);
  }
}




