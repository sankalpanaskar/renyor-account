import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbDialogRef, NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-add-roles',
  templateUrl: './add-roles.component.html',
  styleUrls: ['./add-roles.component.scss']
})
export class AddRolesComponent implements OnInit {

  model: any = [];
  isSubmitting: boolean = false;

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
    private dialogRef: NbDialogRef<AddRolesComponent>
  ) { }

  ngOnInit(): void {
  }

  cancel() {
    this.dialogRef.close(false);
  }

  onSubmit(fm: any) {
    if (fm.valid) {
      this.globalService.addRole(fm.value).subscribe({
        next: (res) => {
          fm.resetForm();
          this.dialogRef.close({ success: true });
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


