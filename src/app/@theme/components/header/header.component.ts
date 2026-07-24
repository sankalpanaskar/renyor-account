import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbMediaBreakpointsService, NbMenuService, NbSidebarService, NbThemeService } from '@nebular/theme';

import { UserData } from '../../../@core/data/users';
import { LayoutService } from '../../../@core/utils';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {

  private destroy$: Subject<void> = new Subject<void>();
  userPictureOnly: boolean = false;
  user: any;

  themes = [
    {
      value: 'default',
      name: 'Light',
    },
    {
      value: 'dark',
      name: 'Dark',
    },
    {
      value: 'cosmic',
      name: 'Cosmic',
    },
    {
      value: 'corporate',
      name: 'Corporate',
    },
  ];

  currentTheme = 'default';

  userMenu = [ { title: 'Profile' }, { title: 'Log out' } ];

  constructor(private sidebarService: NbSidebarService,
              private menuService: NbMenuService,
              private themeService: NbThemeService,
              private userService: UserData,
              private layoutService: LayoutService,
              private router: Router,
              private breakpointService: NbMediaBreakpointsService) {
  }

  public user_image = 'https://cmis4api.anudip.org/public/'+'uploads/user_image/';


  ngOnInit() {
    this.currentTheme = this.themeService.currentTheme;
  
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const member = parsedUser?.member;
  
      const userImagePath = parsedUser?.user_image
        ? this.user_image + parsedUser.user_image
        : 'assets/images/profile.png';

      const role = this.getUserRole(parsedUser);
  
      this.user = {
        name: `${member?.first_name ?? ''} ${member?.last_name ?? ''}`.trim()
          || parsedUser?.name
          || parsedUser?.display_name
          || parsedUser?.email
          || 'User',
        role,
        picture: userImagePath,
      };
  
      console.log('HeaderComponent User:', this.user); // ✅ Full path will be shown
      console.log('HeaderComponent image path:', userImagePath); // ✅ Full path will be shown

    }
  
    const { sm } = this.breakpointService.getBreakpointsMap();
    this.themeService.onMediaQueryChange()
      .pipe(
        map(([, currentBreakpoint]) => currentBreakpoint.width < sm),
        takeUntil(this.destroy$),
      )
      .subscribe((isLessThanXl: boolean) => this.userPictureOnly = isLessThanXl);
  
    this.themeService.onThemeChange()
      .pipe(
        map(({ name }) => name),
        takeUntil(this.destroy$),
      )
      .subscribe(themeName => this.currentTheme = themeName);

      //menu options  profile

      this.menuService.onItemClick()
  .pipe(takeUntil(this.destroy$))
  .subscribe(({ item: { title } }) => {
    if (title === 'Log out') {
      this.logout();
    } else if (title === 'Profile') {
      console.log("profile calling");
      this.goToProfile(); // optional
    }
  });


  }

  private getUserRole(user: any): string {
    const directRole = user?.role_name
      || user?.role?.role_name
      || user?.role?.name
      || (typeof user?.role === 'string' ? user.role : '');

    if (`${directRole || ''}`.trim()) {
      return `${directRole}`.trim();
    }

    if (Array.isArray(user?.roles)) {
      const roleNames = user.roles
        .map((role: any) => role?.role_name || role?.name || (typeof role === 'string' ? role : ''))
        .filter(Boolean);

      if (roleNames.length) {
        return roleNames.join(', ');
      }
    }

    if (user?.is_system_super_admin === 1 || user?.is_system_super_admin === '1') {
      return 'Super Admin';
    }

    return user?.role_id ? `Role ${user.role_id}` : 'User';
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/auth/login']); // change path if needed
  }
  
  goToProfile() {
    this.router.navigate(['/pages/profile']); // ✅ correct route
  }
  

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  changeTheme(themeName: string) {
    this.themeService.changeTheme(themeName);
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    this.layoutService.changeLayoutSize();

    return false;
  }

  navigateHome() {
    this.menuService.navigateHome();
    return false;
  }
}
