import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-approve-scrap-request',
  templateUrl: './approve-scrap-request.component.html',
  styleUrls: ['./approve-scrap-request.component.scss']
})
export class ApproveScrapRequestComponent implements OnInit{
 model: any = [];
  isSubmitting: boolean = false;
  centerList: any = [];
  filterCenterList: any = [];
  @ViewChild('dropdownTrigger') dropdownTrigger: ElementRef;
  dropdownOpen: boolean;
  searchText: any;
  selectedCenter: any;
  selectedCenterCode: any;
  selectedStatus: any;
  assetList: any = [];
  filteredAssetList: any = [];
  masterSelected: boolean = false;
  showAssetList = false;
  searchTextStudent = '';
  scrapList: any = [];
  filterScrapList: any = [];


  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService
  ) { }

  ngOnInit(): void {
    console.log("member is", this.globalService.member_id, this.globalService.role_id);
    this.loadScrapId();
  }

  loadScrapId(): void {
    this.isSubmitting = true;
    var data = {
      'member_id' : this.globalService.member_id
    }
    this.globalService.getScrapId(data).subscribe({
      next: (res) => {
        this.scrapList = res.data;
        this.filterScrapList = this.scrapList;
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('State error:', err);
        this.toastrService.danger(err.message, 'Error');
        this.isSubmitting = false;
      },
    });
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  filterOptions() {
    const text = this.searchText.toLowerCase();
    console.log("print filter", text);
    this.filterScrapList = this.scrapList.filter(c =>
      c.scrap_request_id.toLowerCase().includes(text)
    );
  }

  selectId(scrapId: any) {
    this.model.scrap_id = scrapId;
  
    console.log('id data', this.model.scrap_id);
    this.showAssetList = true;
    this.dropdownOpen = false;
    this.searchText = '';
    this.filterOptions();
    this.loadScrapId();
    this.loadAsset();
  }

  loadAsset() {
    var data = {
      'scrap_request_id': this.model.scrap_id,
      'member_id' : this.globalService.member_id
    }
    this.isSubmitting = true;
    this.globalService.getScrapAssetApprove(data).subscribe({
      next: (res) => {
        this.assetList = res.data.map(asset => ({
          ...asset,
          isSelected: false
        }));
        this.filteredAssetList = [...this.assetList];
        this.masterSelected = false;
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('State error:', err);
        this.toastrService.danger(err.message, 'Error');
        this.isSubmitting = false;
      },
    })
  }

  filterAsset() {
    const text = this.searchTextStudent?.toLowerCase().trim();
    if (text) {
      this.filteredAssetList = this.assetList.filter(asset => {
        return (
          (asset.brand_name.toLowerCase().includes(text)) ||
          (asset.model_no.toLowerCase().includes(text)) ||
          (asset.serial_no.toLowerCase().includes(text)) ||
          (asset.purchase_date.toLowerCase().includes(text)) ||
          (asset.anudip_identification_no.toLowerCase().includes(text))
        );
      });
    } else {
      this.filteredAssetList = [...this.assetList];
    }
  }

  selectAll() {
    this.assetList.forEach(asset => {
      asset.isSelected = this.masterSelected;
    });
  }

  checkIfAllSelected() {
    this.masterSelected = this.assetList.every(asset => asset.isSelected);
  }

  get selectedCount(): number {
    return this.assetList.filter(asset => asset.isSelected).length;
  }



onSubmit(fm: any) {
  if (!fm.valid) {
    this.toastrService.warning('Please fill all required fields correctly.', 'Validation');
    return;
  }

  const selectedAssets = this.assetList.filter(asset => asset.isSelected);

  if (selectedAssets.length === 0) {
    this.toastrService.danger('Please select at least one asset before submitting.', 'No Asset Selected');
    return;
  }

  // ✅ 1 if all assets are selected, else 2
  const partial_status = selectedAssets.length === this.assetList.length ? 1 : 2;

  // normalize remarks to null when empty
  const rawRemarks = (this.model.remarks ?? '').toString().trim();
  const remarks = rawRemarks.length ? rawRemarks : null;

  const payload = {
    role_id: this.globalService.role_id,
    member_id: this.globalService.member_id,
    user_id: this.globalService.user_id,
    approval_request: this.model.approval_status,
    remarks,
    scrap_assets: selectedAssets,
    partial_status,                         // 👈 send it to API
  };

  console.log('🔹 Payload to submit:', payload);

  this.isSubmitting = true;
  this.globalService.submitScrapApprove(payload).subscribe({
    next: (res: any) => {
      this.isSubmitting = false;
      if (res.status) {
        this.toastrService.success('Status Change successfully!', 'Success');
        fm.resetForm();
        this.model = {};
        this.assetList = [];
        this.loadScrapId();
        this.showAssetList = false;
      } else {
        this.toastrService.warning(res.message || 'Status Change submission failed.', 'Warning');
      }
    },
    error: (err) => {
      this.isSubmitting = false;
      console.error('Submit error:', err);
      this.toastrService.danger(err?.error?.message || 'Something went wrong. Please try again.', 'Error');
    },
  });
}

}