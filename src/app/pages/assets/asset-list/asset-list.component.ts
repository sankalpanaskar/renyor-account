import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';
import { LocalDataSource } from 'ng2-smart-table';

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
    actions: {
      edit: false,
      delete: false,
      add: false,
      position: 'right'
    },
    columns: {
      // Id: {
      //   title: 'ID',
      //   type: 'number',
      //   hide: true, // ✅ Hide from view
      //   isHidden: true, // Optional, for clarity
      // },
      AnudipIdNo: {
        title: 'Anudip ID No',
        width: '120px',
        type: 'string',
        filter: false,
        editable: false
      },
      Center: {
        title: 'Center',
        width: '180px',
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
        width: '160px',
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
    },
  };
  model: any = [];
  isSubmitting: boolean = false;
  loading: boolean = false; // <-- Add this to your class
  apiData: any = [];




  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService
  ) { }


  ngOnInit(): void {
    console.log("member is", this.globalService.member_id, this.globalService.role_id);
  }

  onSubmit(fm: any) {
    if (fm.valid) {
      var data = {
        'role_id': this.globalService.role_id,
        'member_id': this.globalService.member_id,
        'search_type': fm.value.search_type,
        'keyword': fm.value.keyword,
      }
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
          this.isSubmitting = false;
        },
      });
    }
  }
}
