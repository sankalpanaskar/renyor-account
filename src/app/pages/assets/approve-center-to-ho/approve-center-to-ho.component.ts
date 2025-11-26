import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-approve-center-to-ho',
  templateUrl: './approve-center-to-ho.component.html',
  styleUrls: ['./approve-center-to-ho.component.scss']
})
export class ApproveCenterToHoComponent implements OnInit {
  model: any = [];
  isSubmitting: boolean = false;
  centerList: any = [];
  centerListTransfer: any = [];
  filterCenterListTransfer: any = [];
  dropdownOpen: boolean;
  searchText: any;
  selectedTransferCenter: any;
  dropdownOpenMember = false;
  searchTextMember = '';
  searchTextStudent = '';
  assetList: any = [];
  filteredAssetList: any = [];
  masterSelected: boolean = false;
  showAssetList = false;
  selectedFromCenterCode: any;



  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService
  ) { }

  ngOnInit(): void {
    console.log("member is", this.globalService.member_id, this.globalService.role_id);
    this.loadCenters();
  }

loadCenters(): void {
  this.isSubmitting = true;

  this.globalService.getCenterApproveHO(this.globalService.member_id, this.globalService.role_id).subscribe({
    next: (res) => {
      this.isSubmitting = false;

      if (res.status === true) {
        // ✅ Success case
        this.centerList = res.data || [];
      } else {
        // ❌ API returned false
        this.toastrService.danger(res.message || 'Something went wrong.', 'Error');
      }
    },
    error: (err) => {
      this.isSubmitting = false;
      console.error('API error:', err);

      // 🧩 Show readable message from backend or fallback
      const errorMessage =
        err?.error?.message ||
        err?.message ||
        'An unexpected error occurred. Please try again.';

      this.toastrService.danger(errorMessage, 'Error');
    },
  });
}

  selectFromCenter(centerCode: any) {
    this.selectedFromCenterCode = centerCode;
    if (centerCode) {
      this.showAssetList = true; // ✅ show table & approval section
      this.loadAssetList(); // load data for that center
    } else {
      this.showAssetList = false; // hide everything if center not selected
    }
    this.loadAssetList();
  }

  loadAssetList(): void {
    var data = {
      'center_code': this.selectedFromCenterCode,
      'member_id': this.globalService.member_id,
      'role_id' : this.globalService.role_id
    }
    this.isSubmitting = true;
    this.globalService.assetListHO(data).subscribe({
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
    });
  }

  filterAsset() {
    const text = this.searchTextStudent?.toLowerCase().trim();
    if (text) {
      this.filteredAssetList = this.assetList.filter(asset => {
        return (
          // (asset.brand_name.toLowerCase().includes(text)) ||
          (asset.assets_sub_class.toLowerCase().includes(text)) ||
          (asset.serial_no.toString().includes(text)) ||
          (asset.requested_by_name.toLowerCase().includes(text)) ||
          (asset.from_center.toLowerCase().includes(text)) ||
          (asset.to_center.toLowerCase().includes(text)) ||
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
    // 🔸 Step 1: Validate form fields
    if (!fm.valid) {
      this.toastrService.warning('Please fill all required fields correctly.', 'Validation');
      return;
    }

    // 🔸 Step 2: Get selected assets
    const selectedAssets = this.assetList.filter(asset => asset.isSelected);

    // ❌ If no assets selected, show error and stop submission
    if (selectedAssets.length === 0) {
      this.toastrService.danger('Please select at least one asset before submitting.', 'No Asset Selected');
      return;
    }

    // 🔸 Step 3: Construct the payload including selected assets
    const payload = {
      role_id: this.globalService.role_id,
      member_id: this.globalService.member_id,
      user_id: this.globalService.user_id,
      center: this.model.from_center,
      approval_status: this.model.approval_status,
      remarks: this.model.remarks,

      // 🟢 Include selected asset details
      selected_assets: selectedAssets.map(asset => ({
        id: asset.id,
        asset_id: asset.asset_id, // assuming you have asset_id or another unique key
        brand_name: asset.brand_name,
        assets_sub_class: asset.assets_sub_class,
        serial_no: asset.serial_no,
        from_center: asset.from_center,
        to_center: asset.to_center,
        anudip_identification_no: asset.anudip_identification_no
      })),
    };

    console.log('🔹 Payload to submit:', payload);

    // 🔸 Step 4: Call API
    this.isSubmitting = true;
    this.globalService.submitHOApproval(payload).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;

        if (res.status) {
          this.toastrService.success('Asset Approve submitted successfully!', 'Success');
          this.showAssetList = false;
          fm.resetForm(); // ✅ reset form
          this.model = {}; // clear model
          this.assetList = []; // clear selected assets
        } else {
          this.toastrService.warning(res.message || 'Approve submission failed.', 'Warning');
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
