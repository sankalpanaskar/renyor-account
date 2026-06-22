import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { GlobalService } from '../../../services/global.service';

export interface PaymentTermOption {
  id?: string | number;
  termName: string;
  days: string | number;
}

@Component({
  selector: 'ngx-payment-terms-popup',
  templateUrl: './payment-terms-popup.component.html',
  styleUrls: ['./payment-terms-popup.component.scss'],
})
export class PaymentTermsPopupComponent {
  @Input() open = false;
  @Input() title = 'Configure Payment Terms';
  @Input() terms: PaymentTermOption[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() termsChange = new EventEmitter<PaymentTermOption[]>();
  @Output() termSelected = new EventEmitter<string>();

  showAddForm = false;
  isSubmitting = false;
  newTermName = '';
  newTermDays: string | number = '';

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
  ) {}

  closePopup(): void {
    if (this.isSubmitting) {
      return;
    }

    this.showAddForm = false;
    this.newTermName = '';
    this.newTermDays = '';
    this.close.emit();
  }

  startAddTerm(): void {
    this.showAddForm = true;
  }

  cancelAddTerm(): void {
    if (this.isSubmitting) {
      return;
    }

    this.showAddForm = false;
    this.newTermName = '';
    this.newTermDays = '';
  }

  saveTerm(): void {
    const termName = `${this.newTermName || ''}`.trim();
    const rawDays = `${this.newTermDays ?? ''}`.trim();

    if (!termName || !rawDays) {
      return;
    }

    if (!/^\d+$/.test(rawDays)) {
      this.toastrService.danger('Enter a valid number of days.', 'Validation Failed');
      return;
    }

    const days = Number(rawDays);
    const payload = {
      name: termName,
      no_of_days: days,
    };

    this.isSubmitting = true;
    this.globalService.createPaymentTerm(payload).subscribe({
      next: (res: any) => {
        const createdTerm: PaymentTermOption = {
          id: res?.data?.id,
          termName,
          days,
        };
        const nextTerms = [...(this.terms || []), createdTerm];

        this.termsChange.emit(nextTerms);
        this.termSelected.emit(createdTerm.termName);
        this.toastrService.success(res?.message || 'Payment term added successfully.', 'Added');
        this.isSubmitting = false;
        this.closePopup();
      },
      error: (err: any) => {
        const errorMessage =
          err?.error?.message ||
          err?.message ||
          'Payment term could not be added. Please try again.';

        this.toastrService.danger(errorMessage, 'Add Payment Term Failed');
        this.isSubmitting = false;
      },
    });
  }

  selectTerm(termName: string): void {
    this.termSelected.emit(termName);
    this.closePopup();
  }
}
