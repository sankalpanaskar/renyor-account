import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { GlobalService } from '../../../services/global.service';

export interface GstTaxRateOption {
  id?: string | number;
  taxName: string;
  rate: string | number;
  label?: string;
}

@Component({
  selector: 'ngx-gst-tax-rate-popup',
  templateUrl: './gst-tax-rate-popup.component.html',
  styleUrls: ['./gst-tax-rate-popup.component.scss'],
})
export class GstTaxRatePopupComponent {
  @Input() open = false;
  @Input() title = 'Configure GST Tax Rates';
  @Input() rates: GstTaxRateOption[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() ratesChange = new EventEmitter<GstTaxRateOption[]>();
  @Output() rateSelected = new EventEmitter<string | number>();

  showAddForm = false;
  isSubmitting = false;
  newTaxName = '';
  newRate: string | number = '';

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
  ) {}

  closePopup(): void {
    if (this.isSubmitting) {
      return;
    }

    this.resetForm();
    this.close.emit();
  }

  startAddRate(): void {
    this.showAddForm = true;
  }

  cancelAddRate(): void {
    if (this.isSubmitting) {
      return;
    }

    this.resetForm();
  }

  saveRate(): void {
    const taxName = `${this.newTaxName || ''}`.trim();
    const rawRate = `${this.newRate ?? ''}`.trim();

    if (!taxName || !rawRate) {
      return;
    }

    if (!/^\d+(\.\d+)?$/.test(rawRate)) {
      this.toastrService.danger('Enter a valid rate percentage.', 'Validation Failed');
      return;
    }

    const rate = Number(rawRate);
    const payload = {
      tax_rate_name: taxName,
      tax_rate_percentage: rate,
    };

    this.isSubmitting = true;
    this.globalService.createTaxRate(payload).subscribe({
      next: (res: any) => {
        const createdRate: GstTaxRateOption = {
          id: res?.data?.id,
          taxName,
          rate,
          label: `${taxName} [${rate}%]`,
        };
        const nextRates = [...(this.rates || []), createdRate];

        this.ratesChange.emit(nextRates);
        this.rateSelected.emit(createdRate.id);
        this.toastrService.success(res?.message || 'Tax rate added successfully.', 'Added');
        this.isSubmitting = false;
        this.closePopup();
      },
      error: (err: any) => {
        const errorMessage =
          err?.error?.message ||
          err?.message ||
          'Tax rate could not be added. Please try again.';

        this.toastrService.danger(errorMessage, 'Add Tax Rate Failed');
        this.isSubmitting = false;
      },
    });
  }

  selectRate(rate: GstTaxRateOption): void {
    this.rateSelected.emit(rate.id);
    this.closePopup();
  }

  private resetForm(): void {
    this.showAddForm = false;
    this.newTaxName = '';
    this.newRate = '';
  }
}
