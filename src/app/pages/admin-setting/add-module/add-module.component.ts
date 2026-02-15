import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'ngx-add-module',
  templateUrl: './add-module.component.html',
  styleUrls: ['./add-module.component.scss']
})
export class AddModuleComponent implements OnInit {
  model: any = [];
  permissions: string[] = [];
  isSubmitting: boolean = false;

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
  }

  onPermissionChange(value: string, checked: boolean) {
    if (checked) {
      if (!this.permissions.includes(value)) {
        this.permissions.push(value);
      }
    } else {
      this.permissions = this.permissions.filter(v => v !== value);
    }
    console.log(this.permissions);
  }
  

  onSubmit(fm: any) {
    if (this.permissions.length === 0) {
      return;
    }
    fm.value.permissions = this.permissions;
    this.isSubmitting = false;
    if (fm.valid) {
      this.globalService.addPackage(fm.value).subscribe({
        next: (res) => {
          fm.resetForm();
          this.toastrService.success(res.message, 'Package added successfully!');
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


