// pages.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { getMenuItems } from './pages-menu';
import { GlobalService } from '../services/global.service';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, combineLatest } from 'rxjs';
import { filter } from 'rxjs/operators';
import { NbMenuService, NbToastrService } from '@nebular/theme';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'ngx-pages',
  styleUrls: ['pages.component.scss'],
  animations: [
    trigger('navigationSwitch', [
      transition('main => settings', [
        style({ opacity: 0, transform: 'translateX(-34px) scale(0.97)' }),
        animate(
          '300ms cubic-bezier(0.22, 1, 0.36, 1)',
          style({ opacity: 1, transform: 'translateX(0) scale(1)' })
        )
      ]),
      transition('settings => main', [
        style({ opacity: 0, transform: 'translateX(-34px) scale(0.97)' }),
        animate(
          '300ms cubic-bezier(0.22, 1, 0.36, 1)',
          style({ opacity: 1, transform: 'translateX(0) scale(1)' })
        )
      ])
    ])
  ],
  template: `
    <ngx-one-column-layout>
      <nb-menu
        tag="pages-navigation"
        [items]="menu"
        [autoCollapse]="true"
        class="navigation-transition"
        [class.settings-navigation]="isSettingsMenuOpen"
        [class.main-navigation]="!isSettingsMenuOpen"
        [@navigationSwitch]="isSettingsMenuOpen ? 'settings' : 'main'">
      </nb-menu>
      <router-outlet></router-outlet>
    </ngx-one-column-layout>
  `,
})
export class PagesComponent implements OnInit, OnDestroy {

  menu: any[] = [];
  isSettingsMenuOpen = false;
  isSubmitting: boolean = false;
  private mainMenu: any[] = [];
  private settingsMenu: any[] = [];
  private subscription?: Subscription;
  private routerSubscription?: Subscription;
  private menuClickSubscription?: Subscription;

  // Manual grouping for API-driven menus. Add more groups or parent menu titles here.
  private dynamicMenuGroups: Array<{ groupTitle: string; parentTitles: string[]; linkPrefixes: string[] }> = [
    {
      groupTitle: 'Items',
      parentTitles: ['Items'],
      linkPrefixes: ['/pages/items/'],
    },
    {
      groupTitle: 'Sales',
      parentTitles: ['Customers','Estimates','Sales Order','Invoices'] ,
      linkPrefixes: ['/pages/sales/'],
    },
    {
      groupTitle: 'Purchases',
      parentTitles: ['Vendors'],
      linkPrefixes: ['/pages/purchase/'],
    },
    {
      groupTitle: 'Accountant',
      parentTitles: ['Chart Of Account'],
      linkPrefixes: ['/pages/accountant/'],
    },
  ];

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
    private router: Router,
    private menuService: NbMenuService,
  ) {}

  ngOnInit() {
    // Load static menus first
    this.subscription = combineLatest([
      this.globalService.roleId$,
      this.globalService.userCode$ ?? this.globalService.roleId$,
    ]).subscribe(([roleId]) => {
      const userCode = this.globalService.user_code;
      this.configureNavigationMenus(getMenuItems(roleId, userCode));
      console.log('✅ Static menu loaded for role:', roleId, 'user:', userCode);
      this.syncMenuModeForRoute(this.router.url);
      
      // Load dynamic menus from API
      this.loadDynamicMenus();
    });

    this.menuClickSubscription = this.menuService.onItemClick()
      .pipe(filter((event) => event.tag === 'pages-navigation'))
      .subscribe(({ item }) => {
        if (item?.data?.navigationAction === 'open-settings') {
          this.openSettingsMenu();
        } else if (item?.data?.navigationAction === 'close-settings') {
          this.closeSettingsMenu();
        }
      });

    this.routerSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.syncMenuModeForRoute(event.urlAfterRedirects);
      });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
    this.routerSubscription?.unsubscribe();
    this.menuClickSubscription?.unsubscribe();
  }

  openSettingsMenu(): void {
    if (this.isSettingsMenuOpen) {
      return;
    }

    this.isSettingsMenuOpen = true;
    this.refreshDisplayedMenu();
  }

  closeSettingsMenu(): void {
    if (!this.isSettingsMenuOpen) {
      return;
    }

    this.isSettingsMenuOpen = false;
    this.refreshDisplayedMenu();
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
          this.globalService.setMenuPermissions(res.data);
          
          // Convert API menu structure to NbMenuItem format
          const dynamicMenuItems = this.convertMenuStructure(res.data);
          const groupedDynamicMenuItems = this.applyManualDynamicGroups(dynamicMenuItems);
          
          // Find FEATURES group and insert after it
          const featuresIndex = this.mainMenu.findIndex(item => item.title === 'FEATURES' && item.group === true);
          
          if (featuresIndex !== -1) {
            // Insert after FEATURES group
            this.mainMenu.splice(featuresIndex + 1, 0, ...groupedDynamicMenuItems);
          } else {
            // If FEATURES group not found, insert after Dashboard (index 1)
            this.mainMenu.splice(1, 0, ...groupedDynamicMenuItems);
          }
          
          console.log('📋 Final main menu with dynamic items:', this.mainMenu);
          this.assignMenuParents(this.mainMenu);
          this.refreshDisplayedMenu();
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
        icon: this.getApiMenuIcon(item.icon, 'layers-outline'),
      };

      const itemChildren = this.extractChildren(item);

      // If item has children, add them as sub-menu.  A child is included
      // if explicit permission fields are present, it must satisfy at least
      // one permission. If no permission fields are present, include it.
      if (itemChildren.length > 0) {
        const childrenMenu = itemChildren.filter((child: any) => this.canShowChild(child)).map((child: any) => ({
          title: child.title || child.name,
          link: this.normalizeMenuLink(child.link || child.url || child.route),
          icon: this.getApiMenuIcon(child.icon, 'list-outline'),
        }));

        // Do not render an empty parent menu when every child has all
        // permissions disabled.
        if (childrenMenu.length === 0) {
          return;
        }

        menuItem.children = childrenMenu;
      } else if (item.link || item.url || item.route) {
        if (!this.canShowChild(item)) {
          return;
        }

        // If item has direct link, add it
        menuItem.link = this.normalizeMenuLink(item.link || item.url || item.route);
      } else {
        return;
      }

      // Skip group items unless explicitly needed
      if (item.group !== true) {
        nbMenuItems.push(menuItem);
      }
    });

    return nbMenuItems;
  }

  private applyManualDynamicGroups(dynamicItems: any[]): any[] {
    const remainingItems = [...dynamicItems];
    const groupedItems: any[] = [];

    this.dynamicMenuGroups.forEach((groupConfig: { groupTitle: string; parentTitles: string[]; linkPrefixes: string[] }) => {
      const groupMenus: any[] = [];

      for (let index = remainingItems.length - 1; index >= 0; index--) {
        const item = remainingItems[index];
        if (this.matchesGroup(item, groupConfig)) {
          groupMenus.unshift(item);
          remainingItems.splice(index, 1);
        }
      }

      if (groupMenus.length > 0) {
        groupedItems.push({ title: groupConfig.groupTitle, group: true }, ...groupMenus);
      }
    });

    return [...groupedItems, ...remainingItems];
  }

  private normalizeTitle(value: any): string {
    return `${value || ''}`.trim().toLowerCase();
  }

  private normalizeMenuLink(value: any): string {
    const link = `${value || ''}`.trim();
    if (!link) {
      return '';
    }

    // Keep external links unchanged; API application routes are normalized
    // to the absolute route used by PagesRoutingModule.
    if (/^(https?:)?\/\//i.test(link) || /^(mailto:|tel:)/i.test(link)) {
      return link;
    }

    const route = link.replace(/^\/+/, '');
    return route === 'pages' || route.startsWith('pages/')
      ? `/${route}`
      : `/pages/${route}`;
  }

  /** API icons can contain Material Symbols or legacy Material Icons ligatures. */
  private getApiMenuIcon(value: any, fallback: string): any {
    const icon = `${value || ''}`.trim();
    const normalizedIcon = icon.toUpperCase();

    if (!icon || normalizedIcon === 'NA' || normalizedIcon === 'N/A' || normalizedIcon === 'NULL') {
      return fallback;
    }

    const pack = icon === 'settings_b_roll'
      ? 'material-icons'
      : 'material-symbols-outlined';

    return { icon, pack };
  }

  private matchesGroup(item: any, groupConfig: { parentTitles: string[]; linkPrefixes: string[] }): boolean {
    const itemTitle = this.normalizeTitle(item?.title);

    const titleMatched = groupConfig.parentTitles.some((title: string) => {
      const normalizedTitle = this.normalizeTitle(title);
      return itemTitle === normalizedTitle || itemTitle.includes(normalizedTitle) || normalizedTitle.includes(itemTitle);
    });

    if (titleMatched) {
      return true;
    }

    const links: string[] = [];
    if (item?.link) {
      links.push(`${item.link}`);
    }
    if (Array.isArray(item?.children)) {
      item.children.forEach((child: any) => {
        if (child?.link) {
          links.push(`${child.link}`);
        }
      });
    }

    return groupConfig.linkPrefixes.some((prefix: string) =>
      links.some((link: string) => `${link}`.toLowerCase().startsWith(prefix.toLowerCase()))
    );
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
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (this.isTruthyPermission(user?.is_system_super_admin)) {
      return true;
    }

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

  private assignMenuParents(items: any[], parent: any = null): void {
    items.forEach((item: any) => {
      if (parent) {
        item.parent = parent;
      } else if (item.parent) {
        delete item.parent;
      }

      if (Array.isArray(item?.children)) {
        this.assignMenuParents(item.children, item);
      }
    });
  }

  private configureNavigationMenus(staticMenu: any[]): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isCompanySuperAdmin = this.isTruthyPermission(user?.is_company_super_admin);
    const isSystemSuperAdmin = this.isTruthyPermission(user?.is_system_super_admin);
    const canAccessSetup = isCompanySuperAdmin || isSystemSuperAdmin;
    const dashboardItem = staticMenu.find((item: any) => this.normalizeTitle(item?.title) === 'dashboard');
    const settingsItems = staticMenu.filter((item: any) => {
      const title = this.normalizeTitle(item?.title);
      return title !== 'dashboard' && title !== 'setup';
    });

    const setupLauncher = {
      title: 'Settings',
      icon: 'settings-2-outline',
      ariaRole: 'button',
      data: { navigationAction: 'open-settings' }
    };

    const closeSettingsItem = {
      title: 'Back to main menu',
      icon: 'arrow-back-outline',
      ariaRole: 'button',
      data: { navigationAction: 'close-settings' }
    };

    this.mainMenu = [
      ...(dashboardItem ? [dashboardItem] : []),
      ...(canAccessSetup ? [setupLauncher] : []),
    ];
    this.settingsMenu = canAccessSetup ? [closeSettingsItem, ...settingsItems] : [];

    if (!canAccessSetup) {
      this.isSettingsMenuOpen = false;
    }

    this.assignMenuParents(this.mainMenu);
    this.assignMenuParents(this.settingsMenu);
    this.refreshDisplayedMenu();
  }

  private refreshDisplayedMenu(): void {
    const activeMenu = this.isSettingsMenuOpen ? this.settingsMenu : this.mainMenu;
    this.menu = [...activeMenu];
    this.syncMenuSelection();
  }

  private syncMenuModeForRoute(url: string): void {
    const shouldShowSettings = this.containsMatchingRoute(this.settingsMenu, this.normalizeUrl(url));
    if (this.isSettingsMenuOpen !== shouldShowSettings) {
      this.isSettingsMenuOpen = shouldShowSettings;
    }

    this.refreshDisplayedMenu();
  }

  private containsMatchingRoute(items: any[], currentUrl: string): boolean {
    return items.some((item: any) => {
      const itemLink = this.normalizeUrl(item?.link);
      if (itemLink && this.urlMatches(currentUrl, itemLink)) {
        return true;
      }

      return Array.isArray(item?.children)
        ? this.containsMatchingRoute(item.children, currentUrl)
        : false;
    });
  }

  private syncMenuSelection(): void {
    if (!Array.isArray(this.menu) || this.menu.length === 0) {
      return;
    }

    const currentUrl = this.normalizeUrl(this.router.url);
    this.clearMenuState(this.menu);

    const selectedByLink = this.selectByLink(this.menu, currentUrl);
    if (!selectedByLink) {
      this.selectByRoutePrefix(this.menu, currentUrl);
    }
  }

  private clearMenuState(items: any[]): void {
    items.forEach((item: any) => {
      item.selected = false;
      item.expanded = false;

      if (Array.isArray(item?.children)) {
        this.clearMenuState(item.children);
      }
    });
  }

  private selectByLink(items: any[], currentUrl: string): boolean {
    for (const item of items) {
      const itemLink = this.normalizeUrl(item?.link);

      if (Array.isArray(item?.children) && this.selectByLink(item.children, currentUrl)) {
        item.selected = true;
        item.expanded = true;
        return true;
      }

      if (itemLink && this.urlMatches(currentUrl, itemLink)) {
        item.selected = true;
        return true;
      }
    }

    return false;
  }

  private selectByRoutePrefix(items: any[], currentUrl: string): boolean {
    const matchingGroup = this.dynamicMenuGroups.find((groupConfig) =>
      groupConfig.linkPrefixes.some((prefix) => currentUrl.startsWith(prefix))
    );

    if (!matchingGroup) {
      return false;
    }

    const targetTitle = matchingGroup.parentTitles
      .map((title) => this.normalizeTitle(title))
      .find(Boolean);

    if (!targetTitle) {
      return false;
    }

    const matchedItem = this.findMenuItemByTitle(items, targetTitle);
    if (!matchedItem) {
      return false;
    }

    matchedItem.selected = true;
    matchedItem.expanded = true;
    return true;
  }

  private findMenuItemByTitle(items: any[], title: string): any | null {
    for (const item of items) {
      if (this.normalizeTitle(item?.title) === title) {
        return item;
      }

      if (Array.isArray(item?.children)) {
        const match = this.findMenuItemByTitle(item.children, title);
        if (match) {
          return match;
        }
      }
    }

    return null;
  }

  private normalizeUrl(url: any): string {
    return `${url || ''}`.split('?')[0].split('#')[0].replace(/\/+$/, '');
  }

  private urlMatches(currentUrl: string, itemUrl: string): boolean {
    return currentUrl === itemUrl || currentUrl.startsWith(`${itemUrl}/`);
  }
}
