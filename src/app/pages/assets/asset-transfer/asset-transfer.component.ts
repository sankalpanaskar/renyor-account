import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-asset-transfer',
  templateUrl: './asset-transfer.component.html',
  styleUrls: ['./asset-transfer.component.scss']
})
export class AssetTransferComponent implements OnInit {
  model: any = [];
  isSubmitting: boolean = false;
  centerList: any = [];
  centerListTransfer: any = [];
  filterCenterListTransfer: any = [];
  empList: any = [];
  filterEmpList: any = [];
  classList: any = [];
  selectedClassId: any;
  selectedClass: any;
  selectedSubClassId: any;
  subClassList: any = [];
  selectedSubClass: any;
  @ViewChild('dropdownTrigger') dropdownTrigger: ElementRef;
  dropdownOpen: boolean;
  searchText: any;
  selectedTransferCenter: any;
  @ViewChild('dropdownTriggerMember') dropdownTriggerMember: ElementRef;
  dropdownOpenMember = false;
  searchTextMember = '';
  selectedFromCenterId: any;
  selectedFromCenter: any;
  selectedClassName: any;
  selectedSubClassName: any;
  searchTextStudent = '';
  assetList: any = [];
  filteredAssetList: any = [];
  masterSelected: boolean = false;
  showAssetList = false;



  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService
  ) { }

  ngOnInit(): void {
    console.log("member is", this.globalService.member_id, this.globalService.role_id);
    this.loadCenters();
    this.loadTransferCenter();
  }

  loadCenters(): void {
    this.isSubmitting = true;
    this.globalService.getCenterUser(this.globalService.user_id).subscribe({
      next: (res) => {
        this.centerList = res.centers;
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('State error:', err);
        this.toastrService.danger(err.message, 'Error');
        this.isSubmitting = false;
      },
    });
  }

    selectFromCenter(centerId: any) {
    // store selected ID
    this.selectedFromCenterId = centerId;
    // find the matching class name from classList
    const selectedObj = this.centerList.find((item: any) => item.center_id === centerId);
    // 🔹 Reset dependent fields when From Center changes
    this.model.asset_class = '';
    this.model.asset_sub_class = '';
    this.classList = [];
    this.subClassList = [];
    this.assetList = [];
    this.filteredAssetList = [];
    this.masterSelected = false;
    this.showAssetList = false; // hide asset list table
    if (selectedObj) {
      this.selectedFromCenter = selectedObj.center_code;
    } else {
      this.selectedFromCenter = null;
    }

    console.log('Selected Center ID:', this.selectedFromCenterId);
    console.log('Selected Center Name:', this.selectedFromCenter);

    // call your next function
    this.loadClass();
  }

  loadClass() {
    this.isSubmitting = true;
    var data = {
      'center_code' : this.selectedFromCenter,
      'member_id'   : this.globalService.member_id,
      'type'        : 'Tr',
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
    this.showAssetList = false;

    // call your next function
    this.loadSubClass();
  }

  selectSubClass(categoryName: any) {
    // store selected ID
    this.selectedSubClassName = categoryName;
    this.showAssetList = true;
    // call your next function
    this.loadAssetList();
  }


  loadSubClass() {
    var data = {
      'center_code' : this.selectedFromCenter,
      'member_id'   : this.globalService.member_id,
      'type'        : 'Tr',
      'category'    : this.selectedClassName
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


  loadTransferCenter(): void {
    this.isSubmitting = true;
    this.globalService.getAllCenter().subscribe({
      next: (res) => {
        this.centerListTransfer = res.centers;
        this.filterCenterListTransfer = this.centerListTransfer;
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('State error:', err);
        this.toastrService.danger(err.message, 'Error');
        this.isSubmitting = false;
      },
    });
  }

  loadAssetList(): void {
    var data = {
      'center_code' : this.selectedFromCenter,
      'member_id'   : this.globalService.member_id,
      'type'        : 'Tr',
      'category'    : this.selectedClassName,
      'sub_class'   : this.selectedSubClassName
    }
    this.isSubmitting = true;
    this.globalService.assetListTrans(data).subscribe({
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
  

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  filterOptions() {
    const text = this.searchText.toLowerCase();
    console.log("print filter", text);
    this.filterCenterListTransfer = this.centerListTransfer.filter(c =>
      c.center_code.toLowerCase().includes(text)
    );
  }

  selectTransCenter(centerData: any) {
    this.model.transfer_center = centerData;
    this.selectedTransferCenter = this.centerListTransfer.find(
      (course) => course.center_code === centerData
    );
    console.log('center data', this.selectedTransferCenter);
    this.model.state = this.selectedTransferCenter.state;
    this.model.district = this.selectedTransferCenter.district;
    this.model.address = this.selectedTransferCenter.address;
    this.dropdownOpen = false;
    this.searchText = '';
    this.filterOptions();
    this.loadEmployeeByCenter();
  }

  loadEmployeeByCenter(): void {
    this.isSubmitting = true;
    this.globalService.getEmployeeCenter(this.selectedTransferCenter.center_id).subscribe({
      next: (res) => {
        this.empList = res.employees;
        this.filterEmpList = this.empList;
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('State error:', err);
        this.toastrService.danger(err.message, 'Error');
        this.isSubmitting = false;
      },
    });
  }

  toggleDropdownMember() {
    this.dropdownOpenMember = !this.dropdownOpenMember;
  }

  filterMember() {
    const text = this.searchTextMember.toLowerCase();
    this.filterEmpList = this.empList.filter((c) =>
      c.member_code.toLowerCase().includes(text)
    );
  }

  selectMember(memberCode: string) {
    this.model.assign_to = memberCode;

    const selectedEmployee = this.empList.find(
      (emp) => emp.member_code === memberCode
    );
    console.log('Selected member:', selectedEmployee);

    this.dropdownOpenMember = false;
    this.searchTextMember = '';
    this.filterEmpList = this.empList; // reset filter
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
    from_center: this.selectedFromCenter,
    asset_class_name: this.selectedClassName,
    asset_sub_class_name: this.selectedSubClassName,
    transfer_center: this.model.transfer_center,
    state: this.model.state,
    district: this.model.district,
    address: this.model.address,
    assign_to: this.model.assign_to,
    assign_date: this.model.assign_date,

    // 🟢 Include selected asset details
    selected_assets: selectedAssets.map(asset => ({
      asset_id: asset.id, // assuming you have asset_id or another unique key
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
  this.globalService.submitAssetTransfer(payload).subscribe({
    next: (res: any) => {
      this.isSubmitting = false;

      if (res.status) {
        this.toastrService.success('Transfer Request submitted successfully!', 'Success');
        this.showAssetList = false;
        fm.resetForm(); // ✅ reset form
        this.model = {}; // clear model
        this.assetList = []; // clear selected assets
      } else {
        this.toastrService.warning(res.message || 'Transfer Request submission failed.', 'Warning');
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
