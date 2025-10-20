import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'ngx-asset-action',
  template: `
    <div class="action-buttons">
      <button nbButton ghost size="small" status="info" (click)="onView()">
        <nb-icon icon="eye-outline"></nb-icon>
      </button>
      <button nbButton ghost size="small" status="primary" (click)="onEdit()">
        <nb-icon icon="edit-outline"></nb-icon>
      </button>
    </div>
  `,
  styles: [`
    .action-buttons {
      display: flex;
      gap: 4px;
      justify-content: center;
    }
    nb-icon {
      font-size: 18px;
    }
  `]
})
export class AssetActionComponent {
  @Input() value: any;      // The row value
  @Input() rowData: any;    // Full row data
  @Output() view = new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>();

  onView() {
    this.view.emit(this.rowData);
  }

  onEdit() {
    this.edit.emit(this.rowData);
  }
}
