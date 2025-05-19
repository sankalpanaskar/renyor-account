import { Component, Inject, OnInit } from '@angular/core';
import { NB_DIALOG_CONFIG, NbDialogRef, NbToastrService } from '@nebular/theme';
import { GlobalService } from '../../services/global.service';

@Component({
  selector: 'ngx-lead-edit-dialog',
  templateUrl: './lead-edit-dialog.component.html',
  styleUrls: ['./lead-edit-dialog.component.scss']
})
export class LeadEditDialogComponent implements OnInit {
  leadData: any = [];
  userProfile: any;
  roles: any;
  model: any = [];
  centerList: any;
  stateList: any = [];
  filteredCenterList: any = [];
  courseList: any = [];
  selectedState: any;
  districList: any = [];
  selectedCenter: any;
  selectedCourse: any;
  selectedDistric: any;
  categoryList: any = [];
  sourceList: any = [];
  filteredSourceList: any = [];
  selectedSource: any;
  preselectedType: any;
  statusList: any = [];
  selectedStatus: any;
  stageList: any;
  selectedStage: any;
  showDateField: boolean = false;
  preselectedStatus: any;
  preselectedStage: void;
  preselectedFollowDate: void;
  leadFlowData: any = [];
  hideForm: boolean = false;
  isSubmitting: boolean = false;
  oriId: any;


  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
    @Inject(NB_DIALOG_CONFIG) public data: any, // 👈 receive data here
    protected dialogRef: NbDialogRef<LeadEditDialogComponent>
  ) {
  }

  ngOnInit(): void {
    console.log("member is", this.globalService.member_id, this.globalService.role_id, this.globalService.fullName);

    console.log('Row Data received from table:', this.data); // ✅ log here
    this.model.first_name = this.data.first_name;
    this.model.last_name = this.data.last_name;
    this.model.phone_number = this.data.phone_number;
    this.model.email_id = this.data.email_id;
    this.model.pincode = this.data.pincode;
    this.model.state = this.data.state; // "Andaman and Nicobar Islands"
    this.model.distric = this.data.district; // "Nicobar"
    this.model.center_code = this.data.center_code;
    this.model.course = this.data.course_alias;
    this.model.category = this.data.category;
    this.model.source_type = this.data.source_type;
    this.oriId = this.data.ori_no;

    this.preselectedStatus = this.data.lead_status;
    this.preselectedStage = this.data.lead_stage;
    this.preselectedFollowDate = this.data.follow_up_date;
    console.log(" status in onit ", this.preselectedStatus);
    this.loadStatusLists();
    this.loadLeadsFlow(this.data.id);

    if (this.data.lead_status_id > 5) {
      this.hideForm = true;  // ✅ hides form for status id 9
    } else {
      this.hideForm = false; // ✅ shows for all others
    }


    console.log("status---", this.data.lead_status_id);


  }

  loadLeadsFlow(rowID): void {
    this.isSubmitting = true
    this.globalService.getLeadsFlow(rowID).subscribe({
      next: (res) => {
        this.leadFlowData = res.lead_stages;
        console.log('lead flow  data :', this.leadFlowData);
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('lead flow error:', err);
        this.toastrService.danger(err.message, 'Error');
        this.isSubmitting = false;
      },
    });
  }


  submit(): void {
    this.dialogRef.close(this.leadData);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  loadStatusLists(): void {
    this.globalService.getStatusList().subscribe({
      next: (res) => {
        // Full list
        const fullStatusList = res.status;

        // Filter based on this.data.lead_status_id
        this.statusList = fullStatusList.filter(
          (status: any) => status.id > this.data.lead_status_id
        );

        console.log('Filtered statusList:', this.statusList);
      },
      error: (err) => {
        console.error('status error:', err);
        this.toastrService.danger(err.message, 'Error');
      },
    });
  }

  onStatusChange(statusId) {
    this.selectedStatus = this.statusList.find(data => data.id === statusId);
    console.log("Selected status Object:", this.selectedStatus);
    // this.model.stage = '';
    this.showDateField = false;
    this.loadStageLists(this.selectedStatus.id);
  }

  loadStageLists(statusId): void {
    this.globalService.getStageList(statusId).subscribe({
      next: (res) => {
        this.stageList = res.stage;
        console.log('stage data :', this.stageList);
        console.log("stage  modifiy before", this.stageList[0].lead_stage);
        if (this.stageList.length == 1) {
          this.model.stage = this.stageList[0].lead_stage;
          this.onStageChange(this.stageList[0].lead_stage);
          console.log("stage modifiy", this.stageList[0].lead_stage);
        } else {
          this.model.stage = '';
        }
      },
      error: (err) => {
        console.error('stage error:', err);
        this.toastrService.danger(err.message, 'Error');
      },
    });
  }

  onStageChange(stageName) {
    this.selectedStage = this.stageList.find(data => data.lead_stage === stageName);
    console.log("Selected Stage Object:", this.selectedStage);
    if (this.selectedStage.lead_stage === 'prospect' || this.selectedStage.lead_stage === 'warm' || this.selectedStage.lead_stage === 'hot') {
      this.showDateField = true;
    } else {
      this.showDateField = false;
    }
  }

  onSubmit(fm: any) {
    if (fm.valid) {

      fm.value.member_id = this.globalService.member_id;
      fm.value.fullName = this.globalService.fullName;
      fm.value.mobile = this.globalService.mobile

      const formData = new FormData(); // 🧼 Clean slate — manual control

      if (this.selectedStage.lead_stage === 'counseling_link_send') {

        formData.append('phone_number', this.data.phone_number);
        formData.append('email_id', this.data.email_id);
        formData.append('course_alias', this.data.course_alias);
        formData.append('center_code', this.data.center_code);
        formData.append('center_id', this.data.center_id);
        formData.append('lead_id', this.data.id);
        formData.append('first_name', this.data.first_name);
        formData.append('last_name', this.data.last_name);
        formData.append('lead_status_id', this.selectedStatus.id);
        formData.append('lead_status', this.selectedStatus.lead_status);
        formData.append('lead_stage', this.selectedStage.lead_stage);
        formData.append('created_by', fm.value.member_id);
        formData.append('created_by_name', fm.value.fullName);
        formData.append('created_by_mobile', fm.value.mobile);
        this.isSubmitting = true;
        this.globalService.counselingLeadUpdate(formData).subscribe({
          next: (res) => {
            if (res.status === false) {
              this.toastrService.danger(res.message, 'Error');
              return;
            }
            this.model = '';
            fm.resetForm();
            this.dialogRef.close();
            this.toastrService.success(res.message, 'Updated');
            this.isSubmitting = false;

          },
          error: (err) => {
            console.error('distric error:', err);
            // Try to extract custom error message
            const msg = err?.error?.message || 'Something went wrong';
            this.toastrService.danger(msg, 'Error');
            this.isSubmitting = false;
          },
        });

      } else {

        // Only append follow_up_date if needed
        if (
          this.selectedStage.lead_stage === 'prospect' ||
          this.selectedStage.lead_stage === 'warm' ||
          this.selectedStage.lead_stage === 'hot'
        ) {
          formData.append('follow_up_date', this.model.follow_up_date); // or this.model.follow_up_date
        }

        // if(this.selectedStage.lead_stage === 'counseling_link_send'){
        //   formData.append('RowData', JSON.stringify(this.data)); // ✅
        // }

        formData.append('id', this.data.id);
        formData.append('created_by_member_id', fm.value.member_id);
        formData.append('lead_status_id', this.selectedStatus.id);
        formData.append('lead_status', this.selectedStatus.lead_status);
        formData.append('lead_stage', this.selectedStage.lead_stage);
        formData.append('created_by_name', this.globalService.fullName);
        this.isSubmitting = true;
        this.globalService.leadUpdate(formData).subscribe({
          next: (res) => {
            this.model = '';
            fm.resetForm();
            this.dialogRef.close();
            this.toastrService.success(res.message, 'Updated');
            this.isSubmitting = false;
          },
          error: (err) => {
            console.error('distric error:', err);
            const msg = err?.error?.message || 'Something went wrong';
            this.toastrService.danger(msg, 'Error');
            this.isSubmitting = false;
          },
        });
      }



      console.log('Form Submitted', formData);
      // Add your save logic here
    }
  }

}
