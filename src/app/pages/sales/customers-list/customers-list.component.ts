// ...existing code...
import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-customers-list',
  templateUrl: './customers-list.component.html',
  styleUrls: ['./customers-list.component.scss']
})
export class CustomersListComponent implements OnInit{

  showCustomerPopup = false;
  selectedCustomer: any = null;
  allCustomers: any[] = [];

  openCustomerPopup(customer: any) {
    this.selectedCustomer = customer;
    this.showCustomerPopup = true;
  }

  closeCustomerPopup() {
    this.showCustomerPopup = false;
    this.selectedCustomer = null;
  }

  model: any = [];
  isSubmitting: boolean = false;
  loading: boolean = false; // <-- Add this to your class
  apiData: any = [];
  lastSearchForm: string = '';

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
    private router : Router,
    private dialogService: NbDialogService,
    private datePipe: DatePipe
  ) { }


  ngOnInit(): void {
    this.getCustomerList();
  }

  getCustomerList() {
    this.loading = true;
    this.globalService.getCustomerListByTenant(34).subscribe({
      next: (res: any) => {
        console.log("customer list response", res);
        this.allCustomers = res?.data || [];
        this.apiData = [...this.allCustomers];
        this.onSearch(this.lastSearchForm);
        this.loading = false;
      },
      error: (err) => {
        console.error('Submit error:', err);
        const errorMessage =
          err?.error?.message ||
          err?.message ||
          'Customer List Failed. Please try again.';

        this.toastrService.danger(errorMessage, 'Customer List Failed');
        this.loading = false;
      },
    });
  }
  onSearch(query: string = ''): void {
    this.lastSearchForm = query || '';
    const searchText = this.lastSearchForm.trim().toLowerCase();

    if (!searchText) {
      this.apiData = [...this.allCustomers];
      return;
    }

    this.apiData = this.allCustomers.filter((customer: any) => {
      const searchableValues = [
        customer?.display_name,
        customer?.company_name,
        customer?.primary_contact_f_name,
        customer?.primary_contact_l_name,
        `${customer?.primary_contact_f_name || ''} ${customer?.primary_contact_l_name || ''}`.trim(),
        customer?.customer_type,
        customer?.customer_group,
        customer?.email,
        customer?.mobile_no,
        customer?.work_phone,
        customer?.department,
        customer?.designation,
        customer?.source_of_supply,
        customer?.billing_city,
        customer?.shipping_city
      ];

      return searchableValues.some((value: any) =>
        String(value || '').toLowerCase().includes(searchText)
      );
    });
  }

  gotoAddCustomerPage() {
    this.router.navigate(['pages/sales/add-customer']);
  }
}
