import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { LocalDataSource } from 'ng2-smart-table';
import { AssetActionComponent } from './asset-action.component';
import { ViewAssetDialogComponent } from '../view-asset-dialog/view-asset-dialog.component';
import { EditAssetDialogComponent } from '../edit-asset-dialog/edit-asset-dialog.component';

@Component({
  selector: 'ngx-asset-list',
  templateUrl: './asset-list.component.html',
  styleUrls: ['./asset-list.component.scss']
})
export class AssetListComponent implements OnInit {
  source: LocalDataSource = new LocalDataSource();

  settings = {
    pager: {
      display: true,
      perPage: 10
    },
    actions: false, // disable default actions
    columns: {
      // Id: {
      //   title: 'ID',
      //   type: 'number',
      //   hide: true, // ✅ Hide from view
      //   isHidden: true, // Optional, for clarity
      // },
      AnudipIdNo: {
        title: 'Anudip ID No',
        width: '150px',
        type: 'string',
        filter: false,
        editable: false
      },
      Center: {
        title: 'Center',
        width: '120px',
        type: 'html',
        filter: false,
        editable: false,
        valuePrepareFunction: (cell: string) => {
          return `<div class="wrap-email">${cell}</div>`;
        }
      },
      AssetName: {
        title: 'Asset Name',
        type: 'number',
        filter: false,
        editable: false
      },

      SerialNo: {
        title: 'Serial No',
        width: '150px',
        type: 'string',
        filter: false,
        editable: false
      },
      InvoiceNo: {
        title: 'Invoice No',
        type: 'string',
        filter: false,
        editable: false
      },
      AssetStatus: {
        title: 'Status',
        width: '130px',
        filter: false,
        editable: false,
        type: 'html',
        valuePrepareFunction: (cell: any) => {
          console.log("cell value---", cell);
          if (cell === 1) {
            return `<h6><span class="badge rounded-pill bg-success text-white pl-2 pr-2 custom-badge">Working</span></h6>`;
          }
        }
      },
      Action: {
      title: 'Action',
      type: 'custom',
      filter: false,
      renderComponent: AssetActionComponent, // ✅ custom component for buttons
      onComponentInitFunction: (instance: any) => {
        instance.view.subscribe((rowData: any) => {
          this.onView(rowData);
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
  }

onView(rowData: any) {
  const assetData = rowData.fullData; // ✅ full object from API
  console.log("asset data",assetData);
  this.dialogService.open(ViewAssetDialogComponent, {
    context: { assetData: assetData },
    closeOnBackdropClick: true,
    hasScroll: true,
  });
}

onEdit(rowData: any) {
  const assetData = rowData.fullData;

  const dialogRef = this.dialogService.open(EditAssetDialogComponent, {
    context: { assetData: assetData },
    closeOnBackdropClick: true,
    hasScroll: true,
  });

  // ✅ When dialog closes
  dialogRef.onClose.subscribe((updatedData) => {
    if (updatedData) {
      // this.toastrService.success('Asset updated successfully', 'Updated');

      // ✅ Re-run your search API automatically using the same filter form data
      // grab your last submitted form values (store them globally or from template ref)
      if (this.lastSearchForm) {
        this.onSubmit(this.lastSearchForm); // call your existing function again
      } else {
        // or if you have access to a template reference variable (fm)
        const fmEl = document.querySelector('#leadForm');
        if (fmEl && fmEl['ngForm']) {
          this.onSubmit(fmEl['ngForm']);
        } else {
          // fallback: call a general reload if no form available
          this.reloadAssetList();
        }
      }
    }
  });
}

reloadAssetList() {
  if (this.lastSearchForm) {
    this.onSubmit(this.lastSearchForm);
  } else {
    console.warn('No previous search form found for reload');
  }
}

  onSubmit(fm: any) {
    if (fm.valid) {
      this.lastSearchForm = fm; // ✅ store the last used form
      var data = {
        'role_id': this.globalService.role_id,
        'member_id': this.globalService.member_id,
        'search_type': fm.value.search_type,
        'keyword': fm.value.keyword,
      }
      this.loading = true;
      this.globalService.SearchAsset(data).subscribe({
        next: (res) => {
          this.apiData = res.data.assets; // ✅ Store API data here first
           const mappedData = this.apiData.map((item, index) => ({
            slNo: index + 1,
            Id: item.id,
            AnudipIdNo: item.anudip_identification_no,
            Center: item.center_code,
            AssetName: item.assets_sub_class,
            SerialNo: item.serial_no,
            InvoiceNo: item.invoice_no,
            fullData: item, // ✅ include full object
            // leadEmail: item.email_id || 'N/A',
            AssetStatus: item.status, // ✅ Corrected based on your data
          }));
          this.source.load(mappedData);
          this.loading = false;
        },
        error: (err) => {
          console.error('Submit error:', err);
          const errorMessage =
            err?.error?.message ||
            err?.message ||
            'Add Lead Failed. Please try again.';

          this.toastrService.danger(errorMessage, 'Add Lead Failed');
          this.loading = false;
        },
      });
    }
  }
    onSearch(query: string = ''): void {
    this.source.setFilter([
      { field: 'AnudipIdNo', search: query },
      { field: 'Center', search: query },
      { field: 'AssetName', search: query },
      { field: 'SerialNo', search: query },
      { field: 'InvoiceNo', search: query },

    ], false);

    if (this.source.count() === 0) {
      this.source.reset();
    }
  }
}
