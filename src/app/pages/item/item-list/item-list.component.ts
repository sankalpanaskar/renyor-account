import { Component } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { GlobalService } from '../../../services/global.service';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { ItemEditButtonComponent } from './item-edit-btn.component';
import { AddItemFormComponent } from '../add-item-form/add-item-form.component';

@Component({
  selector: 'ngx-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.scss']
})
export class ItemListComponent {
source: LocalDataSource = new LocalDataSource();

  settings = {
    pager: {
      display: true,
      perPage: 10
    },
    actions: false, // disable default actions
    columns: {
      CategoryName: {
        title: 'Category Name',
        width: '30%',
        type: 'string',
        filter: false,
        editable: false
      }, 
      ItemName: {
        title: 'Item Name',
        width: '30%',
        type: 'string',
        filter: false,
        editable: false
      }, 
      Status: {
        title: 'Status',
        width: '30%',
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
          width: '12%',
          type: 'custom',
          filter: false,
          renderComponent: ItemEditButtonComponent,
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
  ) { }


  ngOnInit(): void {
    console.log("member is", this.globalService.member_id, this.globalService.role_id);
    this.loadItemList();
  }

  onDelete(rowData: any) {
    const itemData = rowData.fullData; // ✅ full object from API
    console.log("asset data",itemData);
     var data = {
      sub_class_id: itemData.sub_class_id
    }
    this.loading = true;
    this.globalService.changeItemStatus(data).subscribe({
      next: (res: any) => {
        this.loadItemList();
        this.toastrService.success(res.message, 'Item Status Change');
        this.loading = false;
      },
      error: (error: any) => {
        this.toastrService.danger(error.message, 'Item Status Change Failed');
        this.loading = false;
      }
    })
  }

 onEdit(rowData: any) {
  const itemData = rowData.fullData;

  const dialogRef = this.dialogService.open(AddItemFormComponent, {
    context: { itemData: itemData },   // 👈 pass data to dialog
    closeOnBackdropClick: true,
    hasScroll: true,
  });

  dialogRef.onClose.subscribe(() => {
    this.loadItemList();              // 👈 refresh list on close
  });
}

onAddBrand() {
  const dialogRef = this.dialogService.open(AddItemFormComponent, {
    // no context => pure "Add" mode
    closeOnBackdropClick: true,
    hasScroll: true,
  });

  dialogRef.onClose.subscribe(() => {
    this.loadItemList();              // 👈 refresh list on close
  });
}


  loadItemList() {
      this.loading = true;
      this.globalService.getItemList().subscribe({
        next: (res) => {
          this.apiData = res.data; // ✅ Store API data here first
           const mappedData = this.apiData.map((item, index) => ({
            slNo: index + 1,
            Id: item.id,
            CategoryName : item.asset_class_name,
            ItemName: item.sub_class_name,
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
      { field: 'CategoryName', search: query },
      { field: 'ItemName', search: query },
    ], false);

    if (this.source.count() === 0) {
      this.source.reset();
    }
  }
}
