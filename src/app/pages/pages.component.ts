// pages.component.ts
import { Component, OnDestroy } from '@angular/core';
import { getMenuItems } from './pages-menu';
import { GlobalService } from '../services/global.service';
import { Subscription, combineLatest } from 'rxjs';

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
  private subscription: Subscription;

  constructor(private globalService: GlobalService) {}

  ngOnInit() {
    // If you already expose roleId$ and userCode$, combine them.
    // If not, you can read user_code directly (this.globalService.user_code).
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
}
