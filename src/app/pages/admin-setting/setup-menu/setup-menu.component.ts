import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-setup-menu',
  templateUrl: './setup-menu.component.html',
  styleUrls: ['./setup-menu.component.scss']
})
export class SetupMenuComponent implements OnInit {

  model : any = [];
  isSubmitting: boolean = false;
  parentMenuList : any = [];
  menuTreeList : any = [];
  // menuTreeList : any = [
  //   {
  //     title: 'Sales',
  //     icon: 'people-outline',
  //     children: [
  //       {
  //         title: 'Add Customer',
  //         link: ''
  //       },
  //       {
  //         title: 'Customer List',
  //         link: ''
  //       }
  //     ],
  //   },
  //   {
  //     title: 'Purchase',
  //     icon: 'people-outline',
  //     children: [
  //       {
  //         title: 'Add Vendor',
  //         link: ''
  //       },
  //       {
  //         title: 'Vendor List',
  //         link: ''
  //       }
  //     ],
  //   },
  //   {
  //     title: 'Purchase',
  //     icon: 'people-outline',
  //     children: [
  //       {
  //         title: 'Add Vendor',
  //         link: ''
  //       },
  //       {
  //         title: 'Vendor List',
  //         link: ''
  //       }
  //     ],
  //   },
  //   {
  //     title: 'Purchase',
  //     icon: 'people-outline',
  //     children: [
  //       {
  //         title: 'Add Vendor',
  //         link: ''
  //       },
  //       {
  //         title: 'Vendor List',
  //         link: ''
  //       }
  //     ],
  //   },
  //   {
  //     title: 'Purchase',
  //     icon: 'people-outline',
  //     children: [
  //       {
  //         title: 'Add Vendor',
  //         link: ''
  //       },
  //       {
  //         title: 'Vendor List',
  //         link: ''
  //       }
  //     ],
  //   },
  // ];

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService
  ) { }

  ngOnInit(): void {
    //console.log(this.menuTreeList)
    this.getParentMenu();
    this.getMenuTree();
  }

  getParentMenu(){
    this.globalService.getParentMenuList().subscribe({
      next: (res: any) => {
        console.log(res);
        this.parentMenuList = res.data;
        this.isSubmitting = false;
      },
      error: (err: any) => {
        this.toastrService.danger(err.message, 'Error!');
        this.isSubmitting = false;
      }
    })
  }

  getMenuTree(){
    this.globalService.getMenuTree().subscribe({
      next: (res: any) => {
        console.log(res);
        this.menuTreeList = res.data;
        this.isSubmitting = false;
      },
      error: (err: any) => {
        this.toastrService.danger(err.message, 'Error!');
        this.isSubmitting = false;
      }
    })
  }
  

  onSubmit(fm: any) {
    if (fm.valid) {
      this.globalService.addMenu(fm.value).subscribe({
        next: (res) => {
          fm.resetForm();
          this.toastrService.success(res.message, 'Menu');
          this.isSubmitting = false;
          this.getParentMenu();
        },
        error: (err) => {
          this.toastrService.danger(err.message, 'Error!');
          this.isSubmitting = false;
        },
      });
    }

  }

}

