import { Component, OnInit } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { GlobalService } from '../../../services/global.service';

interface EstimateItemRow {
  item_details: string;
  quantity: number;
  rate: number;
  tax: string;
}

interface EstimateCustomerOption {
  id: number;
  label: string;
}

@Component({
  selector: 'ngx-add-estimates',
  templateUrl: './add-estimates.component.html',
  styleUrls: ['./add-estimates.component.scss']
})
export class AddEstimatesComponent implements OnInit {
  isSubmitting = false;
  showEstimateNumberPopup = false;
  customerOptions: EstimateCustomerOption[] = [];

  salespersonOptions: string[] = [
    'Aarav Sharma',
    'Riya Verma',
    'Neha Singh'
  ];

  projectOptions: string[] = [
    'Office Interiors',
    'Retail Renovation',
    'Annual Supply Contract'
  ];

  taxOptions: Array<{ label: string; rate: number }> = [
    { label: 'Non-Taxable', rate: 0 },
    { label: 'GST 5%', rate: 5 },
    { label: 'GST 12%', rate: 12 },
    { label: 'GST 18%', rate: 18 }
  ];

  taxModes = ['TDS', 'TCS'];

  model: any = {
    customer_id: '',
    estimate_no: '',
    reference_no: '',
    estimate_date: '',
    expiry_date: '',
    salesperson: '',
    project_name: '',
    subject: '',
    customer_notes: 'Looking forward for your business.',
    tax_mode: 'TDS',
    additional_tax: '',
    adjustment_label: 'Adjustment',
    adjustment_value: 0
  };

  estimateNumberPreference = {
    mode: 'auto',
    prefix: 'EST-',
    nextNumber: '000001'
  };

  itemRows: EstimateItemRow[] = [];

  constructor(
    private toastrService: NbToastrService,
    private globalService: GlobalService
  ) {}

  ngOnInit(): void {
    this.fetchCustomers();
    this.applyEstimateNumber();
    this.model.estimate_date = this.getTodayAsInputDate();
    this.addRow();
    this.addRow();
  }

  fetchCustomers(): void {
    this.globalService.getCustomerListByTenant(34).subscribe({
      next: (res: any) => {
        const customers = Array.isArray(res?.data) ? res.data : [];
        this.customerOptions = customers
          .map((customer: any) => ({
            id: Number(customer?.id || 0),
            label: this.getCustomerLabel(customer)
          }))
          .filter((customer: EstimateCustomerOption) => customer.id > 0 && !!customer.label);
      },
      error: () => {
        this.customerOptions = [];
      }
    });
  }

  private getCustomerLabel(customer: any): string {
    const fullName = `${customer?.primary_contact_f_name || ''} ${customer?.primary_contact_l_name || ''}`.trim();
    return customer?.display_name || customer?.company_name || fullName || '';
  }

  generateEstimateNumber(): string {
    return `${this.estimateNumberPreference.prefix}${this.estimateNumberPreference.nextNumber}`;
  }

  getTodayAsInputDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = `${today.getMonth() + 1}`.padStart(2, '0');
    const day = `${today.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  addRow(): void {
    this.itemRows = [
      ...this.itemRows,
      {
        item_details: '',
        quantity: 1,
        rate: 0,
        tax: 'Non-Taxable'
      }
    ];
  }

  removeRow(index: number): void {
    if (this.itemRows.length === 1) {
      this.itemRows[0] = {
        item_details: '',
        quantity: 1,
        rate: 0,
        tax: 'Non-Taxable'
      };
      return;
    }

    this.itemRows = this.itemRows.filter((_: EstimateItemRow, rowIndex: number) => rowIndex !== index);
  }

  trackByIndex(index: number): number {
    return index;
  }

  getTaxRate(label: string): number {
    return this.taxOptions.find((option: { label: string; rate: number }) => option.label === label)?.rate || 0;
  }

  getRowAmount(row: EstimateItemRow): number {
    return Number(row.quantity || 0) * Number(row.rate || 0);
  }

  getSubTotal(): number {
    return this.itemRows.reduce((total: number, row: EstimateItemRow) => total + this.getRowAmount(row), 0);
  }

  getAdditionalTaxAmount(): number {
    const subTotal = this.getSubTotal();
    const taxRate = this.getTaxRate(this.model.additional_tax);
    return (subTotal * taxRate) / 100;
  }

  getAdjustmentValue(): number {
    return Number(this.model.adjustment_value || 0);
  }

  getTotal(): number {
    return this.getSubTotal() + this.getAdditionalTaxAmount() + this.getAdjustmentValue();
  }

  openEstimateNumberPopup(): void {
    this.showEstimateNumberPopup = true;
  }

  closeEstimateNumberPopup(): void {
    this.showEstimateNumberPopup = false;
  }

  saveEstimateNumberPreference(): void {
    this.applyEstimateNumber();
    this.closeEstimateNumberPopup();
  }

  private applyEstimateNumber(): void {
    if (this.estimateNumberPreference.mode === 'auto') {
      this.model.estimate_no = this.generateEstimateNumber();
    }
  }

  onSubmit(form: any): void {
    if (!form.valid || this.itemRows.length === 0) {
      return;
    }

    this.toastrService.success('Estimate form is ready.', 'Saved');
  }
}
