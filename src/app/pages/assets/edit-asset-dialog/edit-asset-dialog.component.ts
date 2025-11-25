import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NB_DIALOG_CONFIG, NbDialogRef, NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-edit-asset-dialog',
  templateUrl: './edit-asset-dialog.component.html',
  styleUrls: ['./edit-asset-dialog.component.scss']
})
export class EditAssetDialogComponent implements OnInit {
  model: any = [];
  isSubmitting: boolean = false;
  centerList: any[] = [];
  stateList: any[] = [];
  filteredCenterList: any[] = [];
  courseList: any[] = [];
  selectedState: any;
  districList: any[] = [];
  selectedCenter: any;
  selectedCourse: any;
  selectedDistric: any;
  categoryList: any[] = [];
  sourceList: any[] = [];
  filteredSourceList: any[] = [];
  selectedSource: any;
  brandList: any = [];
  classList: any = [];
  selectedClass: any;
  slectedClassId: any;
  subClassList: any = [];

  searchText = '';
  selectedOption = null;
  dropdownOpen = false;
  openAbove = false;
  @ViewChild('dropdownTrigger') dropdownTrigger: ElementRef;
  funderList: any = [];
  filterFunderList: any = [];
  selectedClassId: any;
  selectedSubClassId: any;
  selectedSubClass: any;
  assetData: any;


  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
    protected dialogRef: NbDialogRef<EditAssetDialogComponent>,
    @Inject(NB_DIALOG_CONFIG) public data: any
  ) {
    this.assetData = this.data; // receive data from parent
  }

  ngOnInit(): void {
  console.log("Data", this.assetData);
  this.loadBrand();
  this.loadClass();
  this.loadFunders();

  if (this.assetData) {
    // Allowed asset_type values from your HTML
    const validAssetTypes = ["Consumable", "Other Than Consumable"];

    this.model = {
      id_no: this.assetData.anudip_identification_no || '',
      model_no: this.assetData.model_no || '',
      serial_no: this.assetData.serial_no || '',
      invoice_no: this.assetData.invoice_no || '',
      nature_of_asset: this.assetData.nature_of_assets || '',
      supplier_name: this.assetData.supplier_name || '',
      value_of_asset: this.assetData.value_of_assets || '',
      purchase_date: this.assetData.purchase_date ? new Date(this.assetData.purchase_date) : '',
      status_of_asset: this.assetData.status_of_assets || '',
      funded_by: this.assetData.funded_by || '',
      asset_type: '', // initialize empty, fill only if valid below
      asset_under_fcra: this.assetData.assets_under || '',
      remarks: this.assetData.remarks || ''
    };

    // ✅ Prefill only if the value matches one of the valid options
    if (
      this.assetData.asset_type &&
      validAssetTypes.some(
        t => t.trim().toLowerCase() === this.assetData.asset_type.trim().toLowerCase()
      )
    ) {
      // match found → fill the model
      this.model.asset_type = validAssetTypes.find(
        t => t.trim().toLowerCase() === this.assetData.asset_type.trim().toLowerCase()
      )!;
    } else {
      // no match → leave empty so field remains invalid
      this.model.asset_type = '';
    }

    // ✅ Owner of asset
    if (this.assetData.owner_of_assets === 'Anudip') {
      this.model.owner_of_asset = 'Anudip';
    } else {
      this.model.owner_of_asset = 'Project';
    }

    this.model.funded_by = this.assetData.funded_by;
    this.model.brand = this.assetData.brand_name;
  }
}


loadBrand() {
  this.isSubmitting = true;
  this.globalService.getBrands().subscribe({
    next: (res: any) => {
      this.brandList = res.data.brands;
      this.isSubmitting = false;

      // ✅ prefill only if brand is found in API list
      if (this.assetData && this.assetData.brand_name) {
        const match = this.brandList.find(
          (b: any) => b.brand_name.trim().toLowerCase() === this.assetData.brand_name.trim().toLowerCase()
        );

        if (match) {
          // value exists — assign it
          this.model.brand = match.brand_name;
        } else {
          // not found — leave blank so required triggers
          this.model.brand = '';
        }
      }
    },
    error: () => {
      this.isSubmitting = false;
    }
  });
}


  loadClass() {
    this.isSubmitting = true;
    this.globalService.getClass().subscribe({
      next: (res: any) => {
        this.classList = res.data.class_name;
        this.isSubmitting = false;

        // ✅ preselect class if editing
        if (this.assetData && this.assetData.assets_class) {
          const selectedClassObj = this.classList.find(
            (c: any) => c.asset_class_name === this.assetData.assets_class
          );
          console.log("class data", selectedClassObj);

          if (selectedClassObj) {
            this.model.asset_class = selectedClassObj.class_id;
            this.selectedClass = selectedClassObj.asset_class_name;
            this.selectedClassId = selectedClassObj.class_id;

            // now that class is known, load sub-class
            this.loadSubClass();
          }
        }
      },
      error: () => {
        this.isSubmitting = false;
      },
    });
  }

  selectClass(classId: any) {
    // store selected ID
    this.selectedClassId = classId;

    // find the matching class name from classList
    const selectedObj = this.classList.find((item: any) => item.class_id === classId);

    if (selectedObj) {
      this.selectedClass = selectedObj.asset_class_name;
    } else {
      this.selectedClass = null;
    }

    console.log('Selected Class ID:', this.selectedClassId);
    console.log('Selected Class Name:', this.selectedClass);

    // call your next function
    this.loadSubClass();
  }

  selectSubClass(classId: any) {
    // store selected ID
    this.selectedSubClassId = classId;

    // find the matching class name from classList
    const selectedObj = this.subClassList.find((item: any) => item.sub_class_id === classId);

    if (selectedObj) {
      this.selectedSubClass = selectedObj.sub_class_name;
    } else {
      this.selectedSubClass = null;
    }

    console.log('Selected Class ID:', this.selectedSubClassId);
    console.log('Selected Class Name:', this.selectedSubClass);

    // call your next function
    this.loadSubClass();
  }


loadSubClass() {
  if (!this.selectedClassId) return;
  this.isSubmitting = true;

  this.globalService.getSubClass(this.selectedClassId).subscribe({
    next: (res: any) => {
      this.subClassList = res.data.sub_class;
      this.isSubmitting = false;

      // ✅ preselect subclass if editing
      if (this.assetData && this.assetData.assets_sub_class) {
        // find the match by comparing names
        const selectedSubObj = this.subClassList.find(
          (s: any) =>
            s.sub_class_name.trim().toLowerCase() ===
            this.assetData.assets_sub_class.trim().toLowerCase()
        );

        console.log("Sub Class Match:", selectedSubObj);

        if (selectedSubObj) {
          // ✅ assign using the correct property name
          this.model.asset_sub_class = selectedSubObj.sub_class_id;
          this.selectedSubClass = selectedSubObj.sub_class_name;
        } else {
          // not found in API → keep empty so validation works
          this.model.asset_sub_class = '';
        }
      }
    },
    error: () => {
      this.isSubmitting = false;
    },
  });
}



  loadFunders() {
    this.isSubmitting = true;
    this.globalService.getFunders().subscribe({
      next: (res: any) => {
        this.funderList = res.data.funder;
        this.filterFunderList = this.funderList;
        this.isSubmitting = false;
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }

  selectFunder(centerData: string) {
    this.model.funded_by = centerData;
    this.dropdownOpen = false;
    this.searchText = '';
    this.filterOptions(); // refresh list when reopening
    this.loadFunders(); // your existing function

  }

  get isFunderDisabled(): boolean {
  return this.model?.owner_of_asset === 'Anudip';
}

toggleDropdown() {
  // 🚫 Do nothing if owner is Anudip
  if (this.isFunderDisabled) {
    return;
  }

  this.dropdownOpen = !this.dropdownOpen;

  if (this.dropdownOpen) {
    setTimeout(() => {
      const rect = this.dropdownTrigger.nativeElement.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      this.openAbove = spaceBelow < 300 && spaceAbove > 300;
    });
  }
}


  filterOptions() {
    const text = this.searchText.toLowerCase();
    console.log("print filter", text);
    this.filterFunderList = this.funderList.filter(c =>
      c.funder_name.toLowerCase().includes(text)
    );
  }




  onSubmit(fm: any) {
    if (fm.valid) {
      fm.value.role_id = this.globalService.role_id;
      fm.value.user_name = this.globalService.fullName;
      fm.value.user_member_id = this.globalService.member_id;
      fm.value.asset_class_name = this.selectedClass;
      fm.value.asset_sub_class_name = this.selectedSubClass;
      fm.value.id = this.assetData.id;

      this.globalService.submitAssetDataUpdate(fm.value).subscribe({
        next: (res) => {
          this.model = '';
          fm.resetForm();
          // ✅ Close dialog and send updated data back to parent
          this.dialogRef.close(fm.value);
          this.toastrService.success(res.message, 'Added');
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('Submit error:', err);
          const errorMessage =
            err?.error?.message ||
            err?.message ||
            'Add Lead Failed. Please try again.';

          this.toastrService.danger(errorMessage, 'Edit Asset Failed');
          this.isSubmitting = false;
        },
      });


    }

  }
}