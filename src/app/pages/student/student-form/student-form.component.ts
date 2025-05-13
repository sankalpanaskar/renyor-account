import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-student-form',
  templateUrl: './student-form.component.html',
  styleUrls: ['./student-form.component.scss']
})
export class StudentFormComponent implements OnInit {
  model: any = [];
  qArray: any = [];
  questionAnsDetailsStatus: any = 0;

  questionAnsDetails: any[] = [];
  studentData: any = [];
  loading: boolean = false;
  isSubmitting: boolean = false;

    constructor(
      private globalService: GlobalService,
      private toastrService: NbToastrService
    ) 
    {}

  ngOnInit(): void {

    console.log("questionAnsDetails loaded:", this.questionAnsDetails);
    var data={
      lead_id : this.globalService.currentUser.lead_id
    }
    this.loadStudentBasicData(data);
   
  }

  loadStudentBasicData(lead_id): void {
    this.isSubmitting = true; // <-- start loader
  
    this.globalService.getStudentData(lead_id).subscribe({
      next: (res) => {
        this.studentData = res.data;
        console.log('Student Data:', this.studentData);
        this.questionAnsDetails = res.data.answers;
  
        if (this.studentData.student_counseling_status === 1) {
          this.questionAnsDetailsStatus = 1;
        } else {
          this.questionAnsDetailsStatus = 0;
        }
  
        this.isSubmitting = false; // <-- stop loader
      },
      error: (err) => {
        console.error('Student error:', err);
        this.toastrService.danger(err.message, 'Error');
        this.isSubmitting = false; // <-- stop loader even on error
      },
    });
  }
  

  async questionChange(event: any, q: any) {
    const ans = event;
    console.log("question change--", ans);
    this.qArray.forEach((element: any, index) => {
      if (element.question == q) {
        this.qArray.splice(index, 1);
      }
    });
    this.qArray.push({
      'question': q,
      'answer': ans
    });
    console.log("qArray Model---", this.qArray);
  }

  onSubmit(fm: any) {
    if (!fm.valid) {
      // Check if the mobile pattern is wrong specifically
      if (fm.controls?.alt_phone_no?.errors?.pattern) {
        this.toastrService.danger('Enter a valid 10-digit mobile number', 'Invalid Mobile No');
      } else {
        this.toastrService.danger('Please fill all required fields', 'Invalid Form');
      }
      return;
    }
  
    const data = {
      question_ans: this.qArray,
      lead_id: this.globalService.currentUser.lead_id,
      type: 1,
    };
  
    this.isSubmitting = true;
    this.globalService.saveStudentForm(data).subscribe({
      next: (res) => {
        this.studentData = res.data;
        console.log('Student Data:', this.studentData);
        this.toastrService.success(res.message, 'Added');
        this.loadStudentBasicData(data);
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Student error:', err);
        this.toastrService.danger(err?.error?.message || 'Something went wrong', 'Error');
        this.isSubmitting = false;
      },
    });
  }
  
}
