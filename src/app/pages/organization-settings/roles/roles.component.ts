import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {

  model: any = [];
  roleList : any = [];
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
      next: (res:any) => {
        console.log(res);
        this.roleList = res.data;
        this.loading = false;
      },
      error: (err) => {
        this.toastrService.danger(err, 'Failed');
        this.loading = false;
      },
    });
  }

  gotoAddRole(){
    this.router.navigate(['/pages/organization-setting/add-roles']);
  }

}

