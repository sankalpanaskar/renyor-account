// pages.component.ts
import { Component, OnDestroy } from '@angular/core';
import { getMenuItems } from './pages-menu';
import { GlobalService } from '../services/global.service';
import { Subscription, combineLatest } from 'rxjs';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-pages',
  styleUrls: ['pages.component.scss'],
  template: `
    <ngx-one-column-layout>
      <nb-menu [items]="menu" autoCollapse="true"></nb-menu>
      <router-outlet></router-outlet>
    </ngx-one-column-layout>
  `,
})
export class PagesComponent implements OnDestroy {

  menu = [];
  isSubmitting: boolean = false;
  private subscription: Subscription;

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
  ) {}

  ngOnInit() {
    // If you already expose roleId$ and userCode$, combine them.
    // If not, you can read user_code directly (this.globalService.user_code).
    this.getMenu();
    this.subscription = combineLatest([
      this.globalService.roleId$,
      this.globalService.userCode$ ?? this.globalService.roleId$, // fallback just to trigger
    ]).subscribe(([roleId]) => {
      const userCode = this.globalService.user_code; // e.g. "ANP-0011"
      this.menu = getMenuItems(roleId, userCode);
      console.log('Updated menu for role:', roleId, 'user:', userCode);
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  getMenu(){
    this.globalService.getMenuByUser().subscribe({
      next: (res: any) => {
        console.log(res);
        //this.menu = res.data;
        this.isSubmitting = false;
      },
      error: (err: any) => {
        this.toastrService.danger(err.message, 'Error!');
        this.isSubmitting = false;
      }
    })
  }
  
}
