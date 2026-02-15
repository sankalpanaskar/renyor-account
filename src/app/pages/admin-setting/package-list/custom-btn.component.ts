import { Component, Input, Output, EventEmitter } from '@angular/core';
import { GlobalService } from '../../../services/global.service'; // ✅ adjust path if needed

@Component({
  selector: 'ngx-customer-btn',
  template: `
    <div class="action-buttons">

      <!-- 🔹 Edit Button -->
      <button nbButton ghost size="small" status="primary" (click)="onEdit()">
        <nb-icon icon="edit-outline"></nb-icon>
      </button>

            <!-- 🔹 Delte Button -->
      <button nbButton ghost size="small" status="info" (click)="onDelete()">
        <nb-icon icon="repeat-outline"></nb-icon>
      </button>

    </div>
  `,
  styles: [`
    .action-buttons {
      display: flex;
      gap: 4px;
      justify-content: center;
      flex-wrap: wrap;
    }

    nb-icon {
      font-size: 18px;
    }

    button[nbButton] {
      font-size: 11px;
      font-weight: 500;
      line-height: 1;
    }
  `]
})
export class PackageButtonComponent {
  @Input() value: any;
  @Input() rowData: any;
  @Output() delete = new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>();

  showApproveButton = false;

  constructor(private globalService: GlobalService) {}

  ngOnInit(): void {
    // ✅ Check once when component loads
    console.log("ANp ID",this.globalService.user_code);
  }

  onDelete() {
    this.delete.emit(this.rowData);
  }

  onEdit() {
    this.edit.emit(this.rowData);
  }

}