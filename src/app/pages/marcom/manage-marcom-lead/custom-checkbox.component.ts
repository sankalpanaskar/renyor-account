import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ngx-app-checkbox-cell',
  template: `
    <input
      type="checkbox"
      [checked]="isChecked"
      (change)="onChange($event)"
    />
  `,
})
export class CustomCheckboxComponent {
  @Input() value: any;
  @Input() rowData: any;

  @Output() checked   = new EventEmitter<any>();
  @Output() unchecked = new EventEmitter<any>();

  isChecked = false;

  onChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.isChecked = checked;

    console.log(`Row ${checked ? 'checked' : 'unchecked'}:`, this.rowData);

    if (checked) {
      this.checked.emit(this.rowData);
    } else {
      this.unchecked.emit(this.rowData);
    }
  }
}
