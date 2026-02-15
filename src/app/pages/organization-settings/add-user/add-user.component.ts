import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {
  model: any = [];
  isSubmitting: boolean = false;
  roleList : any = [];
  stateList : any = [];
  selectedFile: File | null = null;


  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService
  ) { }

  ngOnInit(): void {
    this.getRolesByCompany();
  }

  getRolesByCompany() {
    this.isSubmitting = true;
    this.globalService.fetchRoles().subscribe({
      next: (res:any) => {
        console.log(res);
        this.roleList = res.data; // ✅ Store API data here first
        this.isSubmitting = false;
      },
      error: (err) => {
        this.toastrService.danger(err, 'Failed');
        this.isSubmitting = false;
      },
    });
  }

  onSubmit(fm: any) {
    if (fm.valid) {
      this.globalService.addUser(fm.value).subscribe({
        next: (res) => {
          fm.resetForm();
          this.toastrService.success(res.message, 'Success!');
          this.isSubmitting = false;
        },
        error: (err) => {
          this.toastrService.danger(err.message, 'Error!');
          this.isSubmitting = false;
        },
      });

    }
  
  }


}

