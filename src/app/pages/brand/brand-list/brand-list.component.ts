import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { DatePipe } from '@angular/common';
import { LocalDataSource } from 'ng2-smart-table';
import { BrandEditButtonComponent } from './brand-edit-btn.component';
import { AddBrandComponent } from '../add-brand/add-brand.component';

@Component({
  selector: 'ngx-brand-list',
  templateUrl: './brand-list.component.html',
  styleUrls: ['./brand-list.component.scss']
})
export class BrandListComponent implements OnInit{
 source: LocalDataSource = new LocalDataSource();

  settings = {
    pager: {
      display: true,
      perPage: 10
    },
    actions: false, // disable default actions
    columns: {
      BrandName: {
        title: 'Brand Name',
        width: '45%',
        type: 'string',
        filter: false,
        editable: false
      }, 
      Status: {
        title: 'Status',
        width: '45%',
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
          renderComponent: BrandEditButtonComponent,
          onComponentInitFunction: (instance: any) => {
            instance.delete.subscribe((rowData: any) => {
              this.onDelete(rowData);
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
    private dialogService: NbDialogService,
    private datePipe: DatePipe
  ) { }


  ngOnInit(): void {
    console.log("member is", this.globalService.member_id, this.globalService.role_id);
    this.loadPendingList();
  }

  onDelete(rowData: any) {
    const brandData = rowData.fullData; // ✅ full object from API
    console.log("asset data delete",brandData);
    var data = {
      id : brandData.id
    }
    this.loading = true;
    this.globalService.changeBrandStatus(data).subscribe({
      next:(res:any) => {
        this.loadPendingList();
          this.toastrService.success(res.message,'Brand Status Change');
          this.loading = false;
      },
      error:(error:any) => {
          this.toastrService.danger(error.message, 'Brand Status Change Failed');
          this.loading = false;
      }
    })
  }

 onEdit(rowData: any) {
  const brandData = rowData.fullData;

  const dialogRef = this.dialogService.open(AddBrandComponent, {
    context: { brandData: brandData },   // 👈 pass data to dialog
    closeOnBackdropClick: true,
    hasScroll: true,
  });

  dialogRef.onClose.subscribe(() => {
    this.loadPendingList();              // 👈 refresh list on close
  });
}

onAddBrand() {
  const dialogRef = this.dialogService.open(AddBrandComponent, {
    // no context => pure "Add" mode
    closeOnBackdropClick: true,
    hasScroll: true,
  });

  dialogRef.onClose.subscribe(() => {
    this.loadPendingList();              // 👈 refresh list on close
  });
}


  loadPendingList() {
      this.loading = true;
      this.globalService.getBrandList().subscribe({
        next: (res) => {
          this.apiData = res.data.brands; // ✅ Store API data here first
           const mappedData = this.apiData.map((item, index) => ({
            slNo: index + 1,
            Id: item.id,
            BrandName: item.brand_name,
            Status : item.status,
            fullData: item, // ✅ include full object

          }));
          this.source.load(mappedData);
          this.loading = false;
        },
        error: (err) => {
          console.error('Submit error:', err);
          const errorMessage =
            err?.error?.message ||
            err?.message ||
            'Brand List Failed. Please try again.';

          this.toastrService.danger(errorMessage, 'Brand List Failed');
          this.loading = false;
        },
      });
  }
    onSearch(query: string = ''): void {
    this.source.setFilter([
      { field: 'BrandName', search: query },
    ], false);

    if (this.source.count() === 0) {
      this.source.reset();
    }
  }
}
