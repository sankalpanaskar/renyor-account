import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NbButtonModule, NbCardModule, NbCheckboxModule, NbIconModule, NbInputModule, NbSpinnerModule } from '@nebular/theme';
import { PaymentTermsPopupComponent } from './payment-terms-popup/payment-terms-popup.component';
import { TdsPopupComponent } from './tds-popup/tds-popup.component';
import { GstTaxRatePopupComponent } from './gst-tax-rate-popup/gst-tax-rate-popup.component';
import { UnitPopupComponent } from './unit-popup/unit-popup.component';
import { DocumentFormatConfigComponent } from './document-format-config/document-format-config.component';

@NgModule({
  declarations: [PaymentTermsPopupComponent, TdsPopupComponent, GstTaxRatePopupComponent, UnitPopupComponent, DocumentFormatConfigComponent],
  imports: [CommonModule, FormsModule, NbCardModule, NbButtonModule, NbInputModule, NbIconModule, NbCheckboxModule, NbSpinnerModule],
  exports: [PaymentTermsPopupComponent, TdsPopupComponent, GstTaxRatePopupComponent, UnitPopupComponent, DocumentFormatConfigComponent],
})
export class SharedModule {}
