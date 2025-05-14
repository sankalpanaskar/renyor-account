import { Component, Inject, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NB_DIALOG_CONFIG, NbDialogRef, NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-interview-questions',
  templateUrl: './interview-questions.component.html',
  styleUrls: ['./interview-questions.component.scss']
})
export class InterviewQuestionsComponent implements OnInit {

  model: any = [];
  qArray: any = [];
  questionAnsDetailsStatus: any;

  questionAnsDetails: any[] = [];
  studentData: any = [];
  loading: boolean = false;
  recommendeStatus: any;
  remarksShowHide: boolean = false;
  remardsReqd: boolean = false;
  showCounselingDetails = false;
  showCounselingStudent = false;
  studentAnswers: any = [];
  isSubmitting: boolean = false;


  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
    @Inject(NB_DIALOG_CONFIG) public data: any,
    protected dialogRef: NbDialogRef<InterviewQuestionsComponent>
  ) { }

  ngOnInit(): void {
    var data = {
      lead_id: this.data.lead_id
    }
    console.log("data ---- - ", this.data);
    this.loadStudentBasicData(data);
  }

  toggleCounselingDetails() {
    this.showCounselingDetails = !this.showCounselingDetails;
  }
  toggleCounselingStudent() {
    this.showCounselingStudent = !this.showCounselingStudent;
  }

  loadStudentBasicData(lead_id): void {
    this.loading = true; // <-- start loader

    this.globalService.getStudentDataPO(lead_id).subscribe({
      next: (res) => {
        this.studentData = res.data;
        console.log('Student Data:', this.studentData);
        this.questionAnsDetails = res.data.po_answers;
        this.studentAnswers = res.data.student_answers;
        if (this.studentData.po_counseling_status === 1) {
          this.questionAnsDetailsStatus = 1;
        } else {
          this.questionAnsDetailsStatus = 0;
        }
        this.loading = false; // <-- stop loader

      },
      error: (err) => {
        console.error('Student error:', err);
        this.toastrService.danger(err.message, 'Error');
        this.loading = false; // <-- stop loader even on error
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

  recommendationChange(status) {
    console.log("status---", status);
    this.recommendeStatus = status;
    if (this.recommendeStatus === 'Reject') {
      this.remarksShowHide = true;
      this.remardsReqd = true;
    } else {
      this.remarksShowHide = true;
      this.remardsReqd = false;
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  onSubmit(fm: any) {

    var data = {
      member_id: this.globalService.member_id,
      name: this.globalService.fullName,
      question_ans: this.qArray,
      lead_id: this.data.lead_id,
      type: 2,
      status: this.recommendeStatus,
      remarks: this.model.remarks
    }

    if (fm.valid) {
      this.isSubmitting = true;
      this.globalService.saveStudentForm(data).subscribe({
        next: (res) => {
          this.model = [];
          fm.resetForm();
          this.toastrService.success(res.message, 'Added');
          this.dialogRef.close({ updated: true });
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('Student error:', err);
          this.toastrService.danger(err.message, 'Error');
          this.isSubmitting = false;
        },
      });
    }


  }

}
