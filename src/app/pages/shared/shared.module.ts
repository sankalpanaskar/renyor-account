import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NbButtonModule, NbCardModule, NbIconModule, NbInputModule } from '@nebular/theme';
import { PaymentTermsPopupComponent } from './payment-terms-popup/payment-terms-popup.component';
import { TdsPopupComponent } from './tds-popup/tds-popup.component';
import { GstTaxRatePopupComponent } from './gst-tax-rate-popup/gst-tax-rate-popup.component';
import { UnitPopupComponent } from './unit-popup/unit-popup.component';

@NgModule({
  declarations: [PaymentTermsPopupComponent, TdsPopupComponent, GstTaxRatePopupComponent, UnitPopupComponent],
  imports: [CommonModule, FormsModule, NbCardModule, NbButtonModule, NbInputModule, NbIconModule],
  exports: [PaymentTermsPopupComponent, TdsPopupComponent, GstTaxRatePopupComponent, UnitPopupComponent],
})
export class SharedModule {}
