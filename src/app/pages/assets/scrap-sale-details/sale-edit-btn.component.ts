import { Component, Input, Output, EventEmitter } from '@angular/core';
import { GlobalService } from '../../../services/global.service'; // ✅ adjust path if needed

@Component({
  selector: 'ngx-pending-edit',
  template: `
    <div class="action-buttons">

      <!-- 🔹 Edit Button -->
      <button nbButton ghost size="small" status="primary" (click)="onView()">
        <nb-icon icon="eye-outline"></nb-icon>
      </button>

            <!-- 🔹 Delte Button -->
      <button nbButton ghost size="small" status="info" (click)="onDownload()">
        <nb-icon icon="download-outline"></nb-icon>
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
export class SaleEditButtonComponent {
  @Input() value: any;
  @Input() rowData: any;
  @Output() download = new EventEmitter<any>();
  @Output() view = new EventEmitter<any>();

  showApproveButton = false;

  constructor(private globalService: GlobalService) {}

  ngOnInit(): void {
    // ✅ Check once when component loads
    console.log("ANp ID",this.globalService.user_code);
  }

  onDownload() {
    this.download.emit(this.rowData);
  }

  onView() {
    this.view.emit(this.rowData);
  }

}
