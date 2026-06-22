import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { GlobalService } from '../../../services/global.service';

export interface TdsTermOption {
  id?: string | number;
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
  @Output() termSelected = new EventEmitter<string | number>();

  showAddForm = false;
  isSubmitting = false;
  newTermName = '';
  newTermPercentage: string | number = '';

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
    this.newTermPercentage = '';
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
    this.newTermPercentage = '';
  }

  saveTerm(): void {
    const termName = `${this.newTermName || ''}`.trim();
    const rawPercentage = `${this.newTermPercentage ?? ''}`.trim();

    if (!termName || !rawPercentage) {
      return;
    }

    if (!/^\d+(\.\d+)?$/.test(rawPercentage)) {
      this.toastrService.danger('Enter a valid TDS percentage.', 'Validation Failed');
      return;
    }

    const percentage = Number(rawPercentage);
    const payload = {
      name: termName,
      tds_percentage: percentage,
    };

    this.isSubmitting = true;
    this.globalService.createTDS(payload).subscribe({
      next: (res: any) => {
        const createdName = `${res?.data?.tds_name ?? res?.data?.name ?? termName}`.trim();
        const createdPercentage = res?.data?.tds_percentage ?? res?.data?.percentage ?? percentage;
        const createdTerm: TdsTermOption = {
          id: res?.data?.id,
          termName: `${createdName} [${createdPercentage}%]`,
          percentage: createdPercentage,
        };
        const nextTerms = [...(this.terms || []), createdTerm];

        this.termsChange.emit(nextTerms);
        this.termSelected.emit(createdTerm.id ?? createdTerm.termName);
        this.toastrService.success(res?.message || 'TDS added successfully.', 'Added');
        this.isSubmitting = false;
        this.closePopup();
      },
      error: (err: any) => {
        const errorMessage =
          err?.error?.message ||
          err?.message ||
          'TDS could not be added. Please try again.';

        this.toastrService.danger(errorMessage, 'Add TDS Failed');
        this.isSubmitting = false;
      },
    });
  }

  selectTerm(term: TdsTermOption): void {
    this.termSelected.emit(term.id ?? term.termName);
    this.closePopup();
  }
}
