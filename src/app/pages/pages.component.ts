// pages.component.ts
import { Component, OnDestroy } from '@angular/core';
import { getMenuItems } from './pages-menu';
import { GlobalService } from '../services/global.service';
import { Subscription } from 'rxjs';

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
    this.subscription = this.globalService.roleId$.subscribe(roleId => {
      this.menu = getMenuItems(roleId);
      console.log("Updated menu for role:", roleId);
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
