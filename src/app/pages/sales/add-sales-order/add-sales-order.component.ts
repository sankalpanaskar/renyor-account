import { Component, OnInit } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { GlobalService } from '../../../services/global.service';

interface SalesOrderItemRow {
  item_details: string;
  quantity: number;
  rate: number;
  tax: string;
}

interface SalesOrderCustomerOption {
  id: number;
  label: string;
}

@Component({
  selector: 'ngx-add-sales-order',
  templateUrl: './add-sales-order.component.html',
  styleUrls: ['./add-sales-order.component.scss']
})
export class AddSalesOrderComponent implements OnInit {
  isSubmitting = false;
  showOrderNumberPopup = false;
  customerOptions: SalesOrderCustomerOption[] = [];
  uploadedFiles: File[] = [];

  salespersonOptions: string[] = [
    'Aarav Sharma',
    'Riya Verma',
    'Neha Singh'
  ];

  deliveryMethodOptions: string[] = [
    'Local Delivery',
    'Courier',
    'Express Shipping',
    'Pickup'
  ];

  paymentTerms: Array<{ termName: string; days: number }> = [];

  taxOptions: Array<{ label: string; rate: number }> = [
    { label: 'Non-Taxable', rate: 0 },
    { label: 'GST 5%', rate: 5 },
    { label: 'GST 12%', rate: 12 },
    { label: 'GST 18%', rate: 18 }
  ];

  taxModes = ['TDS', 'TCS'];

  model: any = {
    customer_id: '',
    sales_order_no: '',
    reference_no: '',
    sales_order_date: null,
    expected_shipment_date: null,
    payment_terms: '',
    delivery_method: '',
    salesperson: '',
    customer_notes: '',
    terms_and_conditions: '',
    tax_mode: 'TDS',
    additional_tax: '',
    adjustment_label: 'Adjustment',
    adjustment_value: 0
  };

  orderNumberPreference = {
    mode: 'auto',
    prefix: 'SO-',
    nextNumber: '00001'
  };

  itemRows: SalesOrderItemRow[] = [];

  constructor(
    private toastrService: NbToastrService,
    private globalService: GlobalService
  ) {}

  ngOnInit(): void {
    this.fetchCustomers();
    this.fetchPaymentTerms();
    this.applyOrderNumber();
    this.model.sales_order_date = this.getToday();
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
          .filter((customer: SalesOrderCustomerOption) => customer.id > 0 && !!customer.label);
      },
      error: () => {
        this.customerOptions = [];
      }
    });
  }

  fetchPaymentTerms(): void {
    this.globalService.getPaymentTerms().subscribe({
      next: (res: any) => {
        this.paymentTerms = Array.isArray(res?.data)
          ? res.data.map((item: any) => ({
              termName: item.term_name,
              days: Number(item.no_of_days || 0)
            }))
          : [];

        if (!this.model.payment_terms && this.paymentTerms.length > 0) {
          this.model.payment_terms = this.paymentTerms[0].termName;
        }
      },
      error: () => {
        this.paymentTerms = [];
      }
    });
  }

  private getCustomerLabel(customer: any): string {
    const fullName = `${customer?.primary_contact_f_name || ''} ${customer?.primary_contact_l_name || ''}`.trim();
    return customer?.display_name || customer?.company_name || fullName || '';
  }

  generateOrderNumber(): string {
    return `${this.orderNumberPreference.prefix}${this.orderNumberPreference.nextNumber}`;
  }

  getToday(): Date {
    return new Date();
  }

  addRow(): void {
    this.itemRows = [
      ...this.itemRows,
      {
        item_details: '',
        quantity: 1,
        rate: 0,
        tax: ''
      }
    ];
  }

  removeRow(index: number): void {
    if (this.itemRows.length === 1) {
      this.itemRows[0] = {
        item_details: '',
        quantity: 1,
        rate: 0,
        tax: ''
      };
      return;
    }

    this.itemRows = this.itemRows.filter((_: SalesOrderItemRow, rowIndex: number) => rowIndex !== index);
  }

  trackByIndex(index: number): number {
    return index;
  }

  getTaxRate(label: string): number {
    return this.taxOptions.find((option: { label: string; rate: number }) => option.label === label)?.rate || 0;
  }

  getRowAmount(row: SalesOrderItemRow): number {
    return Number(row.quantity || 0) * Number(row.rate || 0);
  }

  getSubTotal(): number {
    return this.itemRows.reduce((total: number, row: SalesOrderItemRow) => total + this.getRowAmount(row), 0);
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

  openOrderNumberPopup(): void {
    this.showOrderNumberPopup = true;
  }

  closeOrderNumberPopup(): void {
    this.showOrderNumberPopup = false;
  }

  saveOrderNumberPreference(): void {
    this.applyOrderNumber();
    this.closeOrderNumberPopup();
  }

  onFilesChange(files: File[]): void {
    this.uploadedFiles = files;
  }

  private applyOrderNumber(): void {
    if (this.orderNumberPreference.mode === 'auto') {
      this.model.sales_order_no = this.generateOrderNumber();
    }
  }

  onSubmit(form: any): void {
    if (!form.valid || this.itemRows.length === 0) {
      return;
    }

    this.toastrService.success('Sales order form is ready.', 'Saved');
  }
}
