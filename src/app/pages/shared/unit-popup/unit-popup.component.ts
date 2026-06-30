import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { GlobalService } from '../../../services/global.service';

export interface UnitOption {
  id?: string | number;
  unitName: string;
  symbol: string;
  label?: string;
}

@Component({
  selector: 'ngx-unit-popup',
  templateUrl: './unit-popup.component.html',
  styleUrls: ['./unit-popup.component.scss'],
})
export class UnitPopupComponent {
  @Input() open = false;
  @Input() title = 'Configure Units';
  @Input() units: UnitOption[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() unitsChange = new EventEmitter<UnitOption[]>();
  @Output() unitSelected = new EventEmitter<string>();

  showAddForm = false;
  isSubmitting = false;
  newUnitName = '';
  newUnitSymbol = '';

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

  startAddUnit(): void {
    this.showAddForm = true;
  }

  cancelAddUnit(): void {
    if (this.isSubmitting) {
      return;
    }

    this.resetForm();
  }

  saveUnit(): void {
    const unitName = `${this.newUnitName || ''}`.trim();
    const symbol = `${this.newUnitSymbol || ''}`.trim();

    if (!unitName || !symbol) {
      return;
    }

    const payload = {
      unit_name: unitName,
      symbol,
    };

    this.isSubmitting = true;
    this.globalService.insertUnit(payload).subscribe({
      next: (res: any) => {
        const createdUnitName = `${res?.data?.unit_name ?? res?.data?.name ?? unitName}`.trim();
        const createdSymbol = `${res?.data?.symbol ?? symbol}`.trim();
        const createdUnit: UnitOption = {
          id: res?.data?.id,
          unitName: createdUnitName,
          symbol: createdSymbol,
          label: `${createdSymbol} (${createdUnitName})`,
        };
        const nextUnits = [...(this.units || []), createdUnit];

        this.unitsChange.emit(nextUnits);
        this.unitSelected.emit(createdSymbol);
        this.toastrService.success(res?.message || 'Unit added successfully.', 'Added');
        this.isSubmitting = false;
        this.closePopup();
      },
      error: (err: any) => {
        const errorMessage =
          err?.error?.message ||
          err?.message ||
          'Unit could not be added. Please try again.';

        this.toastrService.danger(errorMessage, 'Add Unit Failed');
        this.isSubmitting = false;
      },
    });
  }

  selectUnit(unit: UnitOption): void {
    this.unitSelected.emit(unit.symbol);
    this.closePopup();
  }

  private resetForm(): void {
    this.showAddForm = false;
    this.newUnitName = '';
    this.newUnitSymbol = '';
  }
}
