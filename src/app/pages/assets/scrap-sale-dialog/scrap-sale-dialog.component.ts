import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbDialogRef, NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-scrap-sale-dialog',
  templateUrl: './scrap-sale-dialog.component.html',
  styleUrls: ['./scrap-sale-dialog.component.scss'],
})
export class ScrapSaleDialogComponent implements OnInit {
  // Filled from dialog context: { saleData }
  public saleData: any;

  isSubmitting = false;
  scrapItems: any[] = [];   // ⬅️ to hold table rows

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
    private dialogRef: NbDialogRef<ScrapSaleDialogComponent>,
  ) {}

  ngOnInit(): void {
    this.loadScrapData();
  }

  loadScrapData(): void {
    if (!this.saleData?.id) {
      return;
    }

    this.isSubmitting = true;

    this.globalService.getScrapAssetData(this.saleData.id).subscribe({
      next: (res: any) => {
        // API: res.data.data is array
        this.scrapItems = res?.data?.data || [];
        this.isSubmitting = false;
      },
      error: (error: any) => {
        console.error('Scrap data error:', error);
        this.toastrService.danger(
          error?.error?.message || error?.message || 'Failed to load scrap details.',
          'Error'
        );
        this.isSubmitting = false;
      },
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
