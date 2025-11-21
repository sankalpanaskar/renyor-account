import { Component } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { LocalDataSource } from 'ng2-smart-table';
import { SaleEditButtonComponent } from './sale-edit-btn.component';
import { ScrapSaleDialogComponent } from '../scrap-sale-dialog/scrap-sale-dialog.component';

@Component({
  selector: 'ngx-scrap-sale-details',
  templateUrl: './scrap-sale-details.component.html',
  styleUrls: ['./scrap-sale-details.component.scss']
})
export class ScrapSaleDetailsComponent {
  source: LocalDataSource = new LocalDataSource();

  settings = {
    pager: {
      display: true,
      perPage: 10
    },
    actions: false, // disable default actions
    columns: {
      SellerID: {
        title: 'Seller ID',
        type: 'string',
        filter: false,
        editable: false
      },
      BuyerName: {
        title: 'Buyer Name',
        type: 'string',
        filter: false,
        editable: false
      },
      BuyerID: {
        title: 'Buyer ID',
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
      InvoiceDate: {
        title: 'Invoice Date',
        type: 'string',
        filter: false,
        editable: false
      },
      SubTotal: {
        title: 'Sub Total Amount',
        type: 'string',
        filter: false,
        editable: false
      },
      GST: {
        title: 'GST Amount',
        type: 'string',
        filter: false,
        editable: false
      },
      TCS: {
        title: 'TCS Amount',
        type: 'string',
        filter: false,
        editable: false
      },
      GrandTotal: {
        title: 'Grand Total Amount',
        type: 'string',
        filter: false,
        editable: false
      },

      Action: {
        title: 'Action',
        width: '10%',
        type: 'custom',
        filter: false,
        renderComponent: SaleEditButtonComponent,
        onComponentInitFunction: (instance: any) => {
          instance.download.subscribe((rowData: any) => {
            this.onDownload(rowData);
          });
          instance.view.subscribe((rowData: any) => {
            this.onView(rowData);
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
    this.loadSellerData();
    this.loadScrapData();
  }

  loadScrapData(){
    this.globalService.getScrapAssetData(7).subscribe({
      next:(res:any) => {

      },
      error:(error:any) => {

      }
    })
  }

  onDownload(rowData: any) {
    const scrapData = rowData.fullData; // ✅ full object from API
    console.log("asset data delete", scrapData);
    this.loading = true;
    this.globalService.downloadAssetSaleXls(scrapData.sell_id).subscribe({
      next: (res: any) => {
       window.open(res.file_path, '_blank');
        this.loading = false;
      },
      error: (error: any) => {
        this.toastrService.danger(error.message, 'Brand Status Change Failed');
        this.loading = false;
      }
    })
  }

  onView(rowData: any) {
    const saleData = rowData.fullData;

    const dialogRef = this.dialogService.open(ScrapSaleDialogComponent, {
      context: { saleData: saleData },   // 👈 pass data to dialog
      closeOnBackdropClick: true,
      hasScroll: true,
    });

    dialogRef.onClose.subscribe(() => {
      this.loadSellerData();              // 👈 refresh list on close
    });
  }


  loadSellerData() {
    this.loading = true;
    this.globalService.getSellerDetails().subscribe({
      next: (res) => {
        this.apiData = res.data; // ✅ Store API data here first
        const mappedData = this.apiData.map((item, index) => ({
          slNo: index + 1,
          Id: item.id,
          SellerID: item.sell_id,
          BuyerID: item.buyer_id,
          BuyerName: item.buyer_name,
          InvoiceNo: item.invoice_no,
          InvoiceDate: item.invoice_date,
          SubTotal: item.subtotal_amount,
          GST: item.gst_amount,
          TCS: item.tcs_amount,
          GrandTotal: item.grand_total,
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
      { field: 'SellerID', search: query },
      { field: 'BuyerName', search: query },
      { field: 'BuyerID', search: query },
      { field: 'InvoiceNo', search: query },
      { field: 'InvoiceDate', search: query },
      { field: 'SubTotal', search: query },
      { field: 'GST', search: query },
      { field: 'TCS', search: query },
      { field: 'GrandTotal', search: query },

    ], false);

    if (this.source.count() === 0) {
      this.source.reset();
    }
  }
}
