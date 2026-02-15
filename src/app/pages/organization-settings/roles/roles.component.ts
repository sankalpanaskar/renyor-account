import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { AddRolesComponent } from '../add-roles/add-roles.component';

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
    private dialogService: NbDialogService,
  ) { }

  ngOnInit(): void {
    this.getRolesByCompany();
  }

  getRolesByCompany() {
    this.loading = true;
    this.globalService.fetchRoles().subscribe({
      next: (res:any) => {
        console.log(res);
        this.roleList = res.data; // ✅ Store API data here first
        this.loading = false;
      },
      error: (err) => {
        this.toastrService.danger(err, 'Failed');
        this.loading = false;
      },
    });
  }

  gotoAddRole(){
   const dialogRef = this.dialogService.open(AddRolesComponent, {
      context: {},   // 👈 pass data to dialog
      closeOnBackdropClick: true,
      hasScroll: true,
    });

    dialogRef.onClose.subscribe(() => {
      
      this.getRolesByCompany();              // 👈 refresh list on close
    });
  }

}

