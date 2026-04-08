// pages.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
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
export class PagesComponent implements OnInit, OnDestroy {

  menu: any[] = [];
  isSubmitting: boolean = false;
  private subscription: Subscription;

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
  ) {}

  ngOnInit() {
    // Load static menus first
    this.subscription = combineLatest([
      this.globalService.roleId$,
      this.globalService.userCode$ ?? this.globalService.roleId$,
    ]).subscribe(([roleId]) => {
      const userCode = this.globalService.user_code;
      this.menu = getMenuItems(roleId, userCode);
      console.log('✅ Static menu loaded for role:', roleId, 'user:', userCode);
      
      // Load dynamic menus from API
      this.loadDynamicMenus();
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  /**
   * Load dynamic menus from getMenuByPackage API
   */
  loadDynamicMenus() {
    // Get package_id from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const packageId = user?.package_id;

    if (!packageId) {
      console.warn('⚠️ No package_id found in localStorage');
      return;
    }

    console.log('📦 Loading menu for package_id:', packageId);

    this.globalService.getMenuByPackage(packageId).subscribe({
      next: (res: any) => {
        if (res.data && Array.isArray(res.data)) {
          console.log('📡 Dynamic menu structure from API:', res.data);
          
          // Convert API menu structure to NbMenuItem format
          const dynamicMenuItems = this.convertMenuStructure(res.data);
          
          // Find FEATURES group and insert after it
          const featuresIndex = this.menu.findIndex(item => item.title === 'FEATURES' && item.group === true);
          
          if (featuresIndex !== -1) {
            // Insert after FEATURES group
            this.menu.splice(featuresIndex + 1, 0, ...dynamicMenuItems);
          } else {
            // If FEATURES group not found, insert after Dashboard (index 1)
            this.menu.splice(1, 0, ...dynamicMenuItems);
          }
          
          console.log('📋 Final menu with dynamic items:', this.menu);
        }
      },
      error: (err: any) => {
        console.error('❌ Failed to load dynamic menus:', err);
        this.toastrService.danger(err.message || 'Failed to load dynamic menus', 'Error!');
      }
    });
  }

  /**
   * Convert API menu structure to NbMenuItem format
   */
  convertMenuStructure(menuItems: any[]): any[] {
    const nbMenuItems: any[] = [];

    menuItems.forEach((item: any) => {
      const menuItem: any = {
        title: item.title || item.name,
        icon: item.icon || 'layers-outline',
      };

      const itemChildren = this.extractChildren(item);

      // If item has children, add them as sub-menu.  A child is included
      // if explicit permission fields are present, it must satisfy at least
      // one permission. If no permission fields are present, include it.
      if (itemChildren.length > 0) {
        const childrenMenu = itemChildren.filter((child: any) => this.canShowChild(child)).map((child: any) => ({
          title: child.title || child.name,
          link: child.link || child.url || child.route,
          icon: child.icon,
        }));

        if (childrenMenu.length) {
          menuItem.children = childrenMenu;
        }
      } else if (item.link || item.url || item.route) {
        // If item has direct link, add it
        menuItem.link = item.link || item.url || item.route;
      }

      // Skip group items unless explicitly needed
      if (item.group !== true) {
        nbMenuItems.push(menuItem);
      }
    });

    return nbMenuItems;
  }

  private extractChildren(item: any): any[] {
    const candidates = [
      item?.children,
      item?.submenus,
      item?.submenu,
      item?.sub_menu,
      item?.modules,
    ];

    const children = candidates.find((candidate: any) => Array.isArray(candidate));
    return Array.isArray(children) ? children : [];
  }

  private canShowChild(child: any): boolean {
    const permissionKeys = ['can_create', 'can_view', 'can_edit', 'can_delete'];
    const hasPermissionFields = permissionKeys.some((key: string) => child?.[key] !== undefined && child?.[key] !== null);

    if (!hasPermissionFields) {
      return true;
    }

    return permissionKeys.some((key: string) => this.isTruthyPermission(child?.[key]));
  }

  private isTruthyPermission(value: any): boolean {
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'number') {
      return value === 1;
    }

    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      return ['1', 'true', 'yes', 'y'].includes(normalized);
    }

    return false;
  }
}
