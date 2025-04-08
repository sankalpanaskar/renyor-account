import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'ngx-custom-edit-button',
  template: `
    <button (click)="onEdit()" class="btn btn-primary rounded-circle text-white">Edit</button>
  `
})
export class CustomEditButtonComponent {
  @Input() rowData: any;
  
  onEdit() {
    alert(`Edit button clicked for: ${this.rowData.leadName}`);
  }
}
