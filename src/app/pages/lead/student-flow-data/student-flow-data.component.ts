import { Component } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-student-flow-data',
  templateUrl: './student-flow-data.component.html',
  styleUrls: ['./student-flow-data.component.scss']
})
export class StudentFlowDataComponent {
  searchTerm: string = '';
  searchResults: any[] = [];
  showDropdown = false;
  leadFlowData: any = [];
  model:any = [];
  oriId: any;
  preselectedStatus: any;
  preselectedFollowDate: any;
  isSubmitting: boolean;

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService

  ) {}


 fetchStudents(event: any) {
  const keyword = event.target.value;
    this.leadFlowData = [];

  if (keyword.length > 4) {
    const payload = { keyword };

    this.globalService.searchStudents(payload).subscribe({
      next: (res) => {
        this.searchResults = res.data;
        this.showDropdown = true;
      },
      error: () => {
        this.searchResults = [];
        this.showDropdown = false;
      },
    });
  } else {
    this.searchResults = [];
    this.showDropdown = false;
  }
}

selectStudent(student: any) {
  this.searchTerm = `${student.name}`;
  this.searchResults = [];
  this.showDropdown = false;
  // Call any logic like passing student.id or student.member_code here
    this.model.first_name = student.first_name;
    this.model.last_name = student.last_name;
    this.model.phone_number = student.phone_number;
    this.model.email_id = student.email_id;
    this.model.pincode = student.pincode;
    this.model.state = student.state; // "Andaman and Nicobar Islands"
    this.model.distric = student.district; // "Nicobar"
    this.model.center_code = student.center_code;
    this.model.course = student.course_alias;
    this.model.category = student.category;
    this.model.source_type = student.source_type;
    this.oriId = student.ori_no;
    this.preselectedStatus = student.lead_status;
    this.preselectedFollowDate = student.follow_up_date;
  this.loadLeadsFlow(student.lead_id);

}
  loadLeadsFlow(lead_id): void {
    this.isSubmitting = true;
    this.globalService.getLeadsFlow(lead_id).subscribe({
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

hideDropdownWithDelay() {
  setTimeout(() => {
    this.showDropdown = false;
  }, 200); // gives time for click to register
}
  
}


