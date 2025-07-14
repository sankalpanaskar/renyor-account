import { Component, Inject, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NB_DIALOG_CONFIG, NbDialogService, NbToastrService } from '@nebular/theme';
import { LocalDataSource } from 'ng2-smart-table';

@Component({
  selector: 'ngx-budget-breakup-particular-dialouge',
  templateUrl: './budget-breakup-particular-dialouge.component.html',
  styleUrls: ['./budget-breakup-particular-dialouge.component.scss']
})
export class BudgetBreakupParticularDialougeComponent implements OnInit {

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
      }
    },
  };


users: { name: string, title: string }[] = [
    { name: 'April-2025', title: '20000' },
    { name: 'May-2025', title: '20000' },
    { name: 'June-2025', title: '20000' },
    { name: 'July-2025', title: '20000' },
    { name: 'August-2025', title: '20000' },
    { name: 'September-2025', title: '20000' },
    { name: 'October-2025', title: '20000' },
    { name: 'November-2025', title: '20000' },
    { name: 'December-2025', title: '20000' },
    { name: 'January-2025', title: '20000' },
    { name: 'February-2025', title: '20000' },
    { name: 'March-2025', title: '20000' },
  ];

  apiData : any = [];

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
    private dialogService: NbDialogService,
     @Inject(NB_DIALOG_CONFIG) public data: any, // 👈 receive data here
  ) { }

  ngOnInit(): void {
  }

  

}
