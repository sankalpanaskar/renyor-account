import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { LocalDataSource } from 'ng2-smart-table';
import { BudgetBreakupParticularDialougeComponent } from '../budget-breakup-particular-dialouge/budget-breakup-particular-dialouge.component';
import { CustomEditButtonComponent } from './custom-edit-btn.component';

@Component({
  selector: 'ngx-budget-list',
  templateUrl: './budget-list.component.html',
  styleUrls: ['./budget-list.component.scss']
})
export class BudgetListComponent implements OnInit {

  source: LocalDataSource = new LocalDataSource();

  //data: LocalDataSource = new LocalDataSource();

  settings = {
    pager: {
      display: true,
      perPage: 10
    },
    actions: {
      edit: false,
      delete: false,
      add: false,
      position: 'right'
    },
    columns: {
      slNo: {
        title: 'SL',
        type: 'number',
        filter: false,
        editable: false
      },
      type: {
        title: 'Vertices/Center',
        type: 'string',
        filter: false,
        editable: false
      },
      category: {
        title: 'Category',
        type: 'string',
        filter: false,
        editable: false
      },
      commonParticular: {
        title: 'Common Particular',
        type: 'string',
        filter: false,
        editable: false
      },
      particularAsPerBudget: {
        title: 'Particular As Per Budget',
        type: 'string',
        filter: false,
        editable: false
      },
      unitNo: {
        title: 'Unit',
        type: 'number',
        filter: false,
        editable: false
      },
      unitCost: {
        title: 'Cost',
        type: 'number',
        filter: false,
        editable: false
      },
      grossBudget: {
        title: 'Gross Budget',
        type: 'number',
        filter: false,
        editable: false
      },
      afLc: {
        title: 'AF/LC Contri.',
        type: 'number',
        filter: false,
        editable: false
      },
      netBudget: {
        title: 'Net Budget',
        type: 'number',
        filter: false,
        editable: false
      },
      action: {
        title: 'Action',
        type: 'custom',
        renderComponent: CustomEditButtonComponent,
        filter: false,
        onComponentInitFunction: (instance) => {
          instance.editClicked.subscribe((row) => {
            console.log('Row passed from CustomEditButtonComponent:', row);
            const fullRowData = this.apiData.find(item => item.id === row.id); // ✅ Match by ID
            console.log('Full API object for selected row:', fullRowData);

            this.openEditDialog(fullRowData); // 👈 Send full original object
          });
        }
      }
    },
  };

  apiData : any = [];
  originalData : any;
  
  donoAccountList : any = [];
  pendingStudentList = [];
  completeStudentList = [];
  isPendingTab = true;
  selectedCenter: any;
  studentList: any = [];
  expandedStudent: any = null;
  selectedFilter = 'all';
  loading: boolean = false; // <-- Add this to your class
  categoryNames : any = [];


  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
    private dialogService: NbDialogService
  ) { }

  ngOnInit(): void {
    this.getDonorAccountList();
  }

  getDonorAccountList() {
    this.globalService.getDonorAccount().subscribe({
      next: (data) => {
        this.donoAccountList = data?.donor || []; 
      },
      error: (err) => {
        console.error('Center error:', err);
        this.toastrService.danger(err.message, 'Error');
      },
    });
  }

  donorAccountChange(id:any) {
    //this.selectedCenter = centerData; // ✅ Track selected
    console.log("center data", id);
    this.getBudgetDetails(id);
  }

  getBudgetDetails(centerId) {
    this.loading = true;
    this.globalService.getBudgetDetailsByDonorAccount(centerId).subscribe({
      next: (res) => {
        this.apiData = res.record;
        this.categoryNames = [...new Set(this.apiData.map(record => record.category))];
        const mappedData = this.apiData.map((item, index) => ({
          slNo                  : index + 1,
          type: item.budget_type === 'Vertices' 
          ? item.vertices_name 
          : item.budget_type === 'Center' 
          ? item.center_code + ' ' + item.center_name 
          : null,
          category              : item.category,
          commonParticular      : item.common_particular,
          particularAsPerBudget : item.particular_as_per_budget,
          unitNo                : item.unit,
          unitCost              : item.cost,
          grossBudget           : item.gross_budget,
          afLc                  : item.af_lc,
          netBudget             : item.net_budget,

        }));
        // Calculate the sum of netBudget
        const netBudgetSum = mappedData.reduce((acc, item) => acc + parseFloat(item.netBudget), 0);
        const grossBudgetSum = mappedData.reduce((acc, item) => acc + parseFloat(item.grossBudget), 0);
        const aflcBudgetSum = mappedData.reduce((acc, item) => acc + parseFloat(item.afLc), 0);

        // Add a summary row with the sum of netBudget
        const summaryRow = {
          slNo: null,  // Display "Total" for the last row
          type: null,
          category: null,
          commonParticular: null,
          particularAsPerBudget: "Total",
          unitNo: null,
          unitCost: null,
          grossBudget: grossBudgetSum.toFixed(2),
          afLc: aflcBudgetSum.toFixed(2),
          netBudget: (grossBudgetSum - aflcBudgetSum).toFixed(2),  
        };

        // Push the summary row to the mappedData
        mappedData.push(summaryRow);
        this.source.load(mappedData);
        this.loading = false;
      },
      error: (err) => {
        console.error('Student load error:', err);
        this.toastrService.danger(err.message, 'Error');
        this.loading = false;
      },
    });
  }
 
  onFilterChange(status: string) {
    this.selectedFilter = status;
    console.log(status);
    this.applyFilter(status);
  }

  applyFilter(status: string) {
    let filteredData = [];

    if (status === 'all') {
      filteredData = this.apiData;
    }
    else if (status === 'Personnel') {
      filteredData = this.apiData.filter(record => record.category === 'Personnel');
    } else if (status === 'Capex') {
      filteredData = this.apiData.filter(record => record.category === 'Capex');
    } else if (status === 'Opex') { // ✅ fixed this line
      filteredData = this.apiData.filter(record => record.category === 'Opex');
    } else if (status === 'SG&A') { // ✅ fixed this line
      filteredData = this.apiData.filter(record => record.category === 'SG&A');
    }

    const mappedData = filteredData.map((item, index) => ({
          slNo                  : index + 1,
          type: item.budget_type === 'Vertices' 
          ? item.vertices_name 
          : item.budget_type === 'Center' 
          ? item.center_code + ' ' + item.center_name 
          : null,
          category              : item.category,
          commonParticular      : item.common_particular,
          particularAsPerBudget : item.particular_as_per_budget,
          unitNo                : item.unit,
          unitCost              : item.cost,
          grossBudget           : item.gross_budget,
          afLc                  : item.af_lc,
          netBudget             : item.net_budget,
        }));

        // Calculate the sum of netBudget
        const netBudgetSum = mappedData.reduce((acc, item) => acc + parseFloat(item.netBudget), 0);
        const grossBudgetSum = mappedData.reduce((acc, item) => acc + parseFloat(item.grossBudget), 0);
        const aflcBudgetSum = mappedData.reduce((acc, item) => acc + parseFloat(item.afLc), 0);

        // Add a summary row with the sum of netBudget
        const summaryRow = {
          slNo: null,  // Display "Total" for the last row
          type: null,
          category: null,
          commonParticular: null,
          particularAsPerBudget: "Total",
          unitNo: null,
          unitCost: null,
          grossBudget: grossBudgetSum.toFixed(2),
          afLc: aflcBudgetSum.toFixed(2),
          netBudget: (grossBudgetSum - aflcBudgetSum).toFixed(2), 
        };

        // Push the summary row to the mappedData
        mappedData.push(summaryRow);

    this.source.load(mappedData);
  }



  openEditDialog(rowData): void {
    console.log('Opening dialog with rowData {{{{}}}}:', rowData); // <-- Add this
    this.dialogService.open(BudgetBreakupParticularDialougeComponent, {
      context: { data: rowData }
    }).onClose.subscribe(updatedData => {
      // if (updatedData?.updated) {
      //   console.log('Updated lead:', updatedData);
      //   if (this.selectedCenter?.center_id) {
      //     this.loadStudentList(this.selectedCenter.center_id);
      //   }
      // }else{
      //   this.loadStudentList(this.selectedCenter.center_id);
      // }
    });
  }





  onSearch(query: string = ''): void {
  if (query.trim()) {
    this.source.setFilter([
      { field: 'category', search: query },
      { field: 'commonParticular', search: query },
      { field: 'particularAsPerBudget', search: query }
    ], false);
  } else {
    this.source.reset(); // ✅ clear filters if empty query
  }

  // Optional: feedback if no results found
  this.source.getAll().then(data => {
    if (data.length === 0) {
      console.warn('No matches found for:', query);
    }
  });
}


  onDeleteConfirm(event): void {
    if (window.confirm('Are you sure you want to delete?')) {
      event.confirm.resolve();
    } else {
      event.confirm.reject();
    }
  }

}
