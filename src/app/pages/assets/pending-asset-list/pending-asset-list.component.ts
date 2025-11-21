import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { LocalDataSource } from 'ng2-smart-table';
import { DatePipe } from '@angular/common';
import { EditAssetDialogComponent } from '../edit-asset-dialog/edit-asset-dialog.component';
import { PendingEditBtnComponent } from './pending-edit-btn.component';
import { ViewAssetDialogComponent } from '../view-asset-dialog/view-asset-dialog.component';
import { ApproveAssetDialogComponent } from '../approve-asset-dialog/approve-asset-dialog.component';

@Component({
  selector: 'ngx-pending-asset-list',
  templateUrl: './pending-asset-list.component.html',
  styleUrls: ['./pending-asset-list.component.scss']
})
export class PendingAssetListComponent implements OnInit {
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
      AssetName: {
        title: 'Asset Name',
        type: 'number',
        filter: false,
        editable: false
      },
      BrandName: {
        title: 'Brand Name',
        type: 'string',
        filter: false,
        editable: false
      },
      AnudipIdNo: {
        title: 'Anudip ID No',
        type: 'string',
        filter: false,
        editable: false
      },
      SerialNo: {
        title: 'Serial No',
        type: 'string',
        filter: false,
        editable: false
      },
      PurchaseDate: {
        title: 'Purchase Date',
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
      AssetCategory: {
        title: 'Asset Category',
        type: 'string',
        filter: false,
        editable: false
      },
      FundedBy: {
        title: 'Funded By',
        type: 'string',
        filter: false,
        editable: false
      },
      AssetStatus: {
        title: 'Status',
        width: '90px',
        filter: false,
        editable: false,
        type: 'html',
        valuePrepareFunction: (cell: any) => {
          console.log("cell value---", cell);
          if (cell === 1) {
            return `<h6><span class="badge rounded-pill bg-success text-white pl-2 pr-2 custom-badge">Working</span></h6>`;
          }
          else if (cell === 2) {
            return `<h6><span class="badge rounded-pill bg-warning text-white pl-2 pr-2 custom-badge">Pending</span></h6>`;
          }
        }
      },
      AssetNature: {
        title: 'Asset Nature',
        type: 'string',
        filter: false,
        editable: false
      },
      Action: {
        title: 'Action',
        width: '90px',
        type: 'custom',
        filter: false,
        renderComponent: PendingEditBtnComponent,
        onComponentInitFunction: (instance: any) => {
          instance.view.subscribe((rowData: any) => {
            this.onView(rowData);
          });
          instance.edit.subscribe((rowData: any) => {
            this.onEdit(rowData);
          });
          instance.approve.subscribe((rowData: any) => {
            this.onApprove(rowData); // ✅ handle Approve button click
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

  onView(rowData: any) {
    const assetData = rowData.fullData; // ✅ full object from API
    console.log("asset data", assetData);
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
      this.loadPendingList();
    });
  }

  onApprove(rowData: any) {
    const assetData = rowData.fullData;
    const dialogRef = this.dialogService.open(ApproveAssetDialogComponent, {
      context: { assetData: assetData },
      closeOnBackdropClick: true,
      hasScroll: true,
    });

    // ✅ When dialog closes
    dialogRef.onClose.subscribe((updatedData) => {
      this.loadPendingList();

    });
  }


  // reloadAssetList() {
  //   if (this.lastSearchForm) {
  //     this.onSubmit(this.lastSearchForm);
  //   } else {
  //     console.warn('No previous search form found for reload');
  //   }
  // }

  loadPendingList() {
    var data = {
      'role_id': this.globalService.role_id,
      'member_id': this.globalService.member_id,
    }
    this.loading = true;
    this.globalService.getPendingAsset(data).subscribe({
      next: (res) => {
        this.apiData = res.data.assets; // ✅ Store API data here first
        const mappedData = this.apiData.map((item, index) => ({
          slNo: index + 1,
          Id: item.id,
          AnudipIdNo: item.anudip_identification_no,
          Center: item.center_code,
          AssetName: item.assets_sub_class,
          BrandName: item.brand_name,
          PurchaseDate: this.datePipe.transform(item.purchase_date, 'yyyy-MM-dd') || '',
          AssetCategory: item.assets_class,
          AssetNature: item.nature_of_assets,
          SerialNo: item.serial_no,
          InvoiceNo: item.invoice_no,
          FundedBy: item.funded_by,
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
  onSearch(query: string = ''): void {
    this.source.setFilter([
      { field: 'AnudipIdNo', search: query },
      { field: 'Center', search: query },
      { field: 'AssetName', search: query },
      { field: 'SerialNo', search: query },
      { field: 'InvoiceNo', search: query },
      { field: 'FundedBy', search: query },
      { field: 'AssetCategory', search: query },
      { field: 'PurchaseDate', search: query },


    ], false);

    if (this.source.count() === 0) {
      this.source.reset();
    }
  }
}