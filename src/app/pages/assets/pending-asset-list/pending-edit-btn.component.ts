import { Component, Input, Output, EventEmitter } from '@angular/core';
import { GlobalService } from '../../../services/global.service'; // ✅ adjust path if needed

@Component({
  selector: 'ngx-pending-edit',
  template: `
    <div class="action-buttons">
      <!-- 🔹 View Button -->
      <button nbButton ghost size="small" status="info" (click)="onView()">
        <nb-icon icon="eye-outline"></nb-icon>
      </button>

      <!-- 🔹 Edit Button -->
      <button nbButton ghost size="small" status="primary" (click)="onEdit()">
        <nb-icon icon="edit-outline"></nb-icon>
      </button>

      <!-- ✅ Approve Button (visible only for ANP-2770) -->
      <button
        *ngIf="showApproveButton"
        nbButton
        size="small"
        status="success"
        (click)="onApprove()">
        Approve
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
export class PendingEditBtnComponent {
  @Input() value: any;
  @Input() rowData: any;
  @Output() view = new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>();
  @Output() approve = new EventEmitter<any>(); // ✅ new output event

  showApproveButton = false;

  constructor(private globalService: GlobalService) {}

  ngOnInit(): void {
    // ✅ Check once when component loads
    console.log("ANp ID",this.globalService.user_code);
    this.showApproveButton = String(this.globalService.user_code) === 'ANP-2770'|| String(this.globalService.user_code) === 'ANP-0011';
  }

  onView() {
    this.view.emit(this.rowData);
  }

  onEdit() {
    this.edit.emit(this.rowData);
  }

  onApprove() {
    this.approve.emit(this.rowData);
  }
}
