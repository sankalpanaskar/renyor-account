import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'ngx-assign-module-into-package',
  templateUrl: './assign-module-into-package.component.html',
  styleUrls: ['./assign-module-into-package.component.scss']
})
export class AssignModuleIntoPackageComponent implements OnInit {

  model: any = [];
  parentMenuList : any = [];
  moduleList : any = [];
  packageList : any = [];
  apiData : any = [];
  loading: boolean = false;
  

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.getPackage();
    this.getParentMenu();
  }

  getPackage() {
    this.loading = true;
    this.globalService.gePackageList().subscribe({
      next: (res:any) => {
        console.log(res);
        this.packageList = res.data; // ✅ Store API data here first
        this.loading = false;
      },
      error: (err) => {
        this.toastrService.danger(err, 'Failed');
        this.loading = false;
      },
    });
  }

  onPackageChange(value:any) {
      this.loading = true;
      this.globalService.getMenuByPackage(value).subscribe({
        next: (res:any) => {
          console.log(res);
          this.apiData = res.data; // ✅ Store API data here first
          this.loading = false;
        },
        error: (err) => {
          this.toastrService.danger(err, 'Failed');
          this.loading = false;
        },
      });
  }

  getParentMenu(){
    this.globalService.getParentMenuList().subscribe({
      next: (res: any) => {
        console.log(res);
        this.parentMenuList = res.data;
        this.loading = false;
      },
      error: (err: any) => {
        this.toastrService.danger(err.message, 'Error!');
        this.loading = false;
      }
    })
  }

  onParentMenuChange(value:any) {
    console.log(value);
    this.model.module_id = [];
    this.globalService.getModuleByParentMenuID(value).subscribe({
      next: (res: any) => {
        console.log(res);
        this.moduleList = res.data;
        this.loading = false;
      },
      error: (err: any) => {
        this.toastrService.danger(err.message, 'Error!');
        this.loading = false;
      }
    })
  }

onModuleChange(selectedValues: any) {
  console.log(selectedValues);
  const allIds = this.moduleList.map(m => m.id);
  if (selectedValues.includes('ALL')) {
    const isAllSelected = allIds.every(id =>
      this.model.module_id.includes(id)
    );

    this.model.module_id = isAllSelected ? [] : allIds;
  }
}



  onSubmit(fm: any) {
    this.loading = false;
    if (fm.valid) {
      this.globalService.assignModuleIntoPackage(fm.value).subscribe({
        next: (res) => {
          fm.resetForm();
          this.toastrService.success(res.message, 'Success!');
          this.loading = false;
        },
        error: (err) => {
          this.toastrService.danger(err.message, 'Error!');
          this.loading = false;
        },
      });


    }

  }

}
