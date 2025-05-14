import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'ngx-custom-student-button',
  template: `
    <button (click)="onEdit()" class="btn btn-primary text-white py-0" [disabled]="rowData?.counselingStatus===0">View</button>
  `
})
export class CustomStudentButtonComponent implements OnInit {
  @Input() rowData: any;
  @Output() editClicked = new EventEmitter<any>();

  ngOnInit() {
    console.log("rowData from CustomCounselingButtonComponent (ngOnInit):", this.rowData);
  }

  onEdit() {
    console.log("rowData from CustomCounselingButtonComponent (onEdit):", this.rowData);
    this.editClicked.emit(this.rowData);
  }
}
