import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'ngx-custom-edit-button',
  template: `
    <button (click)="onEdit()" class="btn btn-primary text-white py-0">View</button>
  `
})
export class CustomEditButtonComponent implements OnInit {
  @Input() rowData: any;
  @Output() editClicked = new EventEmitter<any>();

  ngOnInit() {
    console.log("rowData from CustomEditButtonComponent (ngOnInit):", this.rowData);
  }

  onEdit() {
    console.log("rowData from CustomEditButtonComponent (onEdit):", this.rowData);
    this.editClicked.emit(this.rowData);
  }
}