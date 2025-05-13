import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-student-details',
  templateUrl: './student-details.component.html',
  styleUrls: ['./student-details.component.scss']
})
export class StudentDetailsComponent implements OnInit {

  model: any = [];

  courseDetails = [   // <== See '=' used here
    {
      "id": 20077,
      "first_name": "Misbah",
      "last_name": "Chowdhury",
      "email": "misba.chowdhury0007@gmail.com",
      "mobile_no": "7908912264",
      "center_id": 832,
      "center_code": "KAAFW",
      "center_name": "Anudip Foundation For Social Welfare--Bangalore",
      "course_code": "AJP",
      "course_name": "Advanced Java Programming",
      "counseling_by": 1,
      "location": "Kolkata",
      "status_form_send": 1,
      "status_student_form_submit": 2,
      "application_status": 1,
      "cm_approval_status": 0,
      "created_by": "ANPC-6242",
      "mobilizer_name": "Shankar L",
      "mobilizer_phone": "9113935376",
      "cm_email": "simiron.mohanty@anudip.org",
      "mobilizing_date": "2025-04-24 10:12:50",
      "student_submit_date": "2025-04-25 09:36:43",
      "updated_at": "2025-04-24 10:12:50"
    }
  ];
  studentData: any = [];

    constructor(
        private globalService: GlobalService,
        private toastrService: NbToastrService
      ) 
      {}
  
    ngOnInit(): void {
      var data={
        lead_id : this.globalService.currentUser.lead_id
      }
      this.loadStudentBasicData(data);
    }

    loadStudentBasicData(lead_id):void{
      this.globalService.getStudentData(lead_id).subscribe({
        next: (res) => {
          this.studentData = res.data;
          console.log('Student Data:', this.studentData);
        },
        error: (err) => {
          console.error('Student  error:', err);
          this.toastrService.danger(err.message, 'Error');
        },
      });
    }

  onSubmit() {
    // console.log("data", fm.value);
  }
}
