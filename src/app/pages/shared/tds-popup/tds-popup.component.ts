import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface TdsTermOption {
  termName: string;
  percentage: string | number;
}

@Component({
  selector: 'ngx-tds-popup',
  templateUrl: './tds-popup.component.html',
  styleUrls: ['./tds-popup.component.scss'],
})
export class TdsPopupComponent {
  @Input() open = false;
  @Input() title = 'Configure TDS';
  @Input() terms: TdsTermOption[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() termsChange = new EventEmitter<TdsTermOption[]>();
  @Output() termSelected = new EventEmitter<string>();

  showAddForm = false;
  newTermName = '';
  newTermPercentage: string | number = '';

  closePopup(): void {
    this.showAddForm = false;
    this.newTermName = '';
    this.newTermPercentage = '';
    this.close.emit();
  }

  startAddTerm(): void {
    this.showAddForm = true;
  }

  cancelAddTerm(): void {
    this.showAddForm = false;
    this.newTermName = '';
    this.newTermPercentage = '';
  }

  saveTerm(): void {
    const termName = `${this.newTermName || ''}`.trim();
    const rawPercentage = `${this.newTermPercentage ?? ''}`.trim();

    if (!termName || !rawPercentage) {
      return;
    }

    const normalizedPercentage = /^\d+(\.\d+)?$/.test(rawPercentage)
      ? Number(rawPercentage)
      : rawPercentage;

    const nextTerms = [...this.terms, { termName, percentage: normalizedPercentage }];
    this.termsChange.emit(nextTerms);
    this.termSelected.emit(termName);
    this.closePopup();
  }

  selectTerm(termName: string): void {
    this.termSelected.emit(termName);
    this.closePopup();
  }
}
