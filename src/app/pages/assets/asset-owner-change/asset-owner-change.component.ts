import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-asset-owner-change',
  templateUrl: './asset-owner-change.component.html',
  styleUrls: ['./asset-owner-change.component.scss']
})
export class AssetOwnerChangeComponent implements OnInit{
model: any = [];
  isSubmitting: boolean = false;
  centerList: any = [];
  filterCenterList: any = [];
  // @ViewChild('dropdownTrigger') dropdownTrigger: ElementRef;
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
  funderList: any = [];
  filterFunderList: any = [];


  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService
  ) { }

  ngOnInit(): void {
    console.log("member is", this.globalService.member_id, this.globalService.role_id);
    this.loadFunders();
  }

    loadFunders(){
    this.isSubmitting = true;
    this.globalService.getFundersOwner(this.globalService.role_id).subscribe({
      next:(res:any) => {
        this.funderList = res.data.funder;
        this.filterFunderList = this.funderList;
        this.isSubmitting = false;
        
      },
      error:(res:any) => {
      this.isSubmitting = false;

      }
    })
  }

  selectFunder(funderData: string) {
  this.model.funded_by = funderData;
  this.dropdownOpen = false;
  this.showAssetList = true;
  this.searchText = '';
  this.filterOptions(); // refresh list when reopening
  this.loadFunders(); // your existing function
  this.loadAsset();
}

toggleDropdown() {
  this.dropdownOpen = !this.dropdownOpen;
}

 filterOptions() {
  const text = this.searchText.toLowerCase();
  console.log("print filter",text);
  this.filterFunderList = this.funderList.filter(c =>
    c.funder_name.toLowerCase().includes(text) 
  );
}

  loadAsset() {
    var data = {
      'funder': this.model.funded_by,
      'role_id': this.globalService.role_id

    }
    this.isSubmitting = true;
    this.globalService.getOwnerAssetApprove(data).subscribe({
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
          (asset.assets_class.toLowerCase().includes(text)) ||
          (asset.assets_sub_class.toLowerCase().includes(text)) ||
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

    // // 🔸 Step 2: Get selected assets
    const selectedAssets = this.assetList.filter(asset => asset.isSelected);

    // // ❌ If no assets selected, show error and stop submission
    if (selectedAssets.length === 0) {
      this.toastrService.danger('Please select at least one asset before submitting.', 'No Asset Selected');
      return;
    }

    // 🔸 Step 3: Construct the payload including selected assets
    const payload = {
      role_id: this.globalService.role_id,
      member_id: this.globalService.member_id,
      user_id: this.globalService.user_id,

      // 🟢 Include selected asset details
       selected_assets: selectedAssets.map(asset => ({
        id: asset.id, // assuming you have asset_id or another unique key
        brand_name: asset.brand_name,
        model_no: asset.model_no,
        serial_no: asset.serial_no,
        purchase_date: asset.purchase_date,
        anudip_identification_no: asset.anudip_identification_no
      })),
    };

    console.log('🔹 Payload to submit:', payload);

    // 🔸 Step 4: Call API
    this.isSubmitting = true;
    this.globalService.submitOwnerChange(payload).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;

        if (res.status) {
          this.toastrService.success('Owner Changed successfully!', 'Success');
          fm.resetForm(); // ✅ reset form
          this.model = {}; // clear model
          this.assetList = []; // clear selected assets
          this.showAssetList = false;
        } else {
          this.toastrService.warning(res.message || 'Owner Change submission failed.', 'Warning');
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