import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface PaymentTermOption {
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
  newTermName = '';
  newTermDays: string | number = '';

  closePopup(): void {
    this.showAddForm = false;
    this.newTermName = '';
    this.newTermDays = '';
    this.close.emit();
  }

  startAddTerm(): void {
    this.showAddForm = true;
  }

  cancelAddTerm(): void {
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

    const normalizedDays = /^\d+$/.test(rawDays) ? Number(rawDays) : rawDays;
    const nextTerms = [...this.terms, { termName, days: normalizedDays }];

    this.termsChange.emit(nextTerms);
    this.termSelected.emit(termName);
    this.closePopup();
  }

  selectTerm(termName: string): void {
    this.termSelected.emit(termName);
    this.closePopup();
  }
}
