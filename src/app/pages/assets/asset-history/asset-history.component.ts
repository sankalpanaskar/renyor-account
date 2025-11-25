import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-asset-history',
  templateUrl: './asset-history.component.html',
  styleUrls: ['./asset-history.component.scss']
})
export class AssetHistoryComponent implements OnInit {
  assetSearch = '';
  showDetails = false;

  // assetData: any = {
  //   anudip_id: 'AF-PA-MON-2223-385',
  //   brand_name: 'Dell',
  //   model_no: 'E1916HVF',
  //   serial_no: '09YKY7-72872-71E-E2FAI-A00',
  //   invoice_no: 'Old Invoice',
  //   voucher_no: 'Old Voucher',
  //   asset_class: 'COMPUTER & ACCESSORIES',
  //   asset_sub_class: 'Monitor',
  //   nature_of_asset: 'IT',
  //   purchase_date: '2015-06-10',
  //   funded_by: 'JPMC',
  //   supplier: 'Accenture',
  //   asset_under: 'Non-FC',
  //   owner_of_asset: 'Project',
  //   status: 'NOT WORKING',
  //   remarks: '',
  // };

  // assetHistory = [
  //   {
  //     center_name: 'HO - Anudip Foundation for Social Welfare',
  //     assigned_to: 'Gopal Pramanik',
  //     email: 'gopal@anudip.org',
  //     mobile: '8373069559',
  //     state: 'West Bengal',
  //     district: 'Kolkata',
  //     address: 'Mira Towers, 8th & 9th Floor, DN 27, Sector V, Salt Lake City, Kolkata-700091',
  //     assigned_date: '2024-07-20'
  //   },
  //   {
  //     center_name: 'HRGUR - Anudip Foundation For Social Welfare—Gurgaon',
  //     assigned_to: 'Ashok Kumar Yadav',
  //     email: 'ashok.yadav@anudip.org',
  //     mobile: '7044401197',
  //     state: 'Haryana',
  //     district: 'Gurgaon',
  //     address: 'SCO-28, Sector-14, HUDA commercial center, Gurgaon, Haryana',
  //     assigned_date: '2024-07-20'
  //   },
  //   {
  //     center_name: 'HO - Anudip Foundation for Social Welfare',
  //     assigned_to: 'Gopal Pramanik',
  //     email: 'gopal@anudip.org',
  //     mobile: '8373069559',
  //     state: 'West Bengal',
  //     district: 'Kolkata',
  //     address: 'Mira Towers, 8th & 9th Floor, DN 27, Sector V, Salt Lake City, Kolkata-700091',
  //     assigned_date: '2025-06-18'
  //   }
  // ];
  assetHisData: any = [];
  isSubmitting: boolean;
  assetData: any;
  assetHistory: any = [];

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService
  ) { }

  ngOnInit(): void {
    console.log("member is", this.globalService.member_id, this.globalService.role_id);
  }

  onSearch() {
    this.isSubmitting = true;

    this.globalService.getAssetHistory(this.assetSearch).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        this.assetData = res.data.assetData || {};
        this.assetHistory = res.data.assetHistory || [];
        this.showDetails = true;
        console.log('data---', this.assetData);
        console.log('data2---', this.assetHistory);
      },
      error: (err:any) => {
        console.error('History error:', err);
        const errorMessage =
          err?.error?.message || // Use server error message if available
          err?.message ||        // Fallback to generic message
          'Asset History Not Found!. Please try again.';
        this.toastrService.danger(errorMessage, 'Asset History Not Found !');
        this.isSubmitting = false;
      }
    });
  }

}
