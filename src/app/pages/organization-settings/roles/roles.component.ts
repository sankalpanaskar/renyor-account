import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';
import { Router } from '@angular/router';
import { LocalDataSource } from 'ng2-smart-table';

@Component({
  selector: 'ngx-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {

  source: LocalDataSource = new LocalDataSource();

  settings = {
    pager: {
      display: true,
      perPage: 10
    },
    actions: false,
    columns: {
      role_name: {
        title: 'Role Name',
        width: '30%',
        type: 'string',
        filter: false,
        editable: false
      },
      remarks: {
        title: 'Remarks',
        width: '50%',
        type: 'string',
        filter: false,
        editable: false
      },
      status: {
        title: 'Status',
        width: '20%',
        type: 'html',
        filter: false,
        editable: false,
        valuePrepareFunction: (cell: any) => {
          if (cell === 1) {
            return `<h6><span class="badge rounded-pill bg-success text-white pl-2 pr-2">Active</span></h6>`;
          } else if (cell === 0) {
            return `<h6><span class="badge rounded-pill bg-danger text-white pl-2 pr-2">Inactive</span></h6>`;
          }
          return cell;
        }
      }
    }
  };

  model: any = [];
  roleList: any = [];
  loading: boolean = false;

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getRolesByCompany();
  }

  getRolesByCompany() {
    this.loading = true;
    this.globalService.fetchRoles().subscribe({
      next: (res: any) => {
        console.log(res);
        this.roleList = res.data;
        const mappedData = this.roleList.map((item: any) => ({
          role_name: item.role_name,
          remarks: item.remarks || '-',
          status: item.status || 1,
          fullData: item
        }));
        this.source.load(mappedData);
        this.loading = false;
      },
      error: (err) => {
        this.toastrService.danger(err.message || 'Failed', 'Error');
        this.loading = false;
      },
    });
  }

  gotoAddRole(){
    this.router.navigate(['/pages/organization-setting/add-roles']);
  }

}

