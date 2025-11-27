import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-asset-status-change',
  templateUrl: './asset-status-change.component.html',
  styleUrls: ['./asset-status-change.component.scss']
})
export class AssetStatusChangeComponent implements OnInit {
  model: any = [];
  isSubmitting: boolean = false;
  centerList: any = [];
  filterCenterList: any = [];
  @ViewChild('dropdownTrigger') dropdownTrigger: ElementRef;
  dropdownOpen: boolean;
  searchText: any;
  selectedCenter: any;
  classList: any = [];
  selectedClassName: any;
  selectedSubClassName: any;
  subClassList: any = [];
  selectedCenterCode: any;
  selectedStatus: any;
  changeStatus: any;
  assetList: any = [];
  filteredAssetList: any = [];
  masterSelected: boolean = false;
  showAssetList = false;
  searchTextStudent = '';


  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService
  ) { }

  ngOnInit(): void {
    console.log("member is", this.globalService.member_id, this.globalService.role_id);
    this.loadCenter();
  }

  loadCenter(): void {
    this.isSubmitting = true;
    this.globalService.getAllActiveDeactiveCenter().subscribe({
      next: (res) => {
        this.centerList = res.centers;
        this.filterCenterList = this.centerList;
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
    this.filterCenterList = this.centerList.filter(c =>
      c.center_code.toLowerCase().includes(text)
    );
  }

  selectTransCenter(centerData: any) {
    this.model.center = centerData;
    this.selectedCenter = this.centerList.find(
      (course) => course.center_code === centerData
    );
    console.log('center data', this.selectedCenter);
    ;
    this.selectedCenterCode = this.selectedCenter.center_code;
    this.dropdownOpen = false;
    this.searchText = '';
    this.filterOptions();
    this.loadClass();
  }

  loadClass() {
    this.isSubmitting = true;
    var data = {
      'center_code': this.selectedCenterCode,
      'member_id': this.globalService.member_id,
      'type': 'sc',
    }
    this.globalService.classByUser(data).subscribe({
      next: (res: any) => {
        this.classList = res.data;
        this.isSubmitting = false;

      },
      error: (res: any) => {
        this.isSubmitting = false;

      }
    })
  }

  selectClass(categoryName: any) {
    // store selected ID
    this.selectedClassName = categoryName;
    this.model.status_of_asset = '';
    this.model.asset_sub_class = '';
    this.showAssetList = false;
    this.assetList = []; // clear selected assets
    // call your next function
    this.loadSubClass();
  }

  selectSubClass(categoryName: any) {
    // store selected ID
    this.selectedSubClassName = categoryName;
    this.model.status_of_asset = '';
    this.showAssetList = false;
    this.assetList = []; // clear selected assets
    // call your next function
  }


  loadSubClass() {
    var data = {
      'center_code': this.selectedCenterCode,
      'member_id': this.globalService.member_id,
      'type': 'sc',
      'category': this.selectedClassName
    }
    this.isSubmitting = true;
    this.globalService.assetSubListByUser(data).subscribe({
      next: (res: any) => {
        this.subClassList = res.data;
        this.isSubmitting = false;

      },
      error: (res: any) => {
        this.isSubmitting = false;

      }
    })
  }

  selectStatus(status: any) {
    this.selectedStatus = status;
    //console.log(this.selectedStatus);
    this.showAssetList = true;
    this.loadAsset();
  }

  selectedChangeTo(status:any){
    this.changeStatus = status;
  }

  loadAsset() {
    var data = {
      'center_code': this.selectedCenterCode,
      'status': this.selectedStatus,
      'sub_class': this.selectedSubClassName,
      'category': this.selectedClassName
    }
    this.isSubmitting = true;
    this.globalService.getAssetForStatus(data).subscribe({
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
          (asset.serial_no.toString().includes(text)) ||
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
      center: this.selectedCenterCode,
      asset_class_name: this.selectedClassName,
      asset_sub_class_name: this.selectedSubClassName,
      status: this.changeStatus,

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
    this.globalService.submitStatusChange(payload).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;

        if (res.status) {
          this.toastrService.success('Status Change successfully!', 'Success');
          this.showAssetList = false;
          fm.resetForm(); // ✅ reset form
          this.model = {}; // clear model
          this.assetList = []; // clear selected assets
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
