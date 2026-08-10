import { Component, OnInit } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { Router } from '@angular/router';
import { GlobalService } from '../../../services/global.service';

@Component({
  selector: 'ngx-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
  readonly permissionTypes = [
    { key: 'can_view', label: 'View', icon: 'eye-outline' },
    { key: 'can_create', label: 'Create', icon: 'plus-outline' },
    { key: 'can_edit', label: 'Edit', icon: 'edit-2-outline' },
    { key: 'can_delete', label: 'Delete', icon: 'trash-2-outline' },
  ];

  allRoles: any[] = [];
  roleList: any[] = [];
  searchText = '';
  loading = false;
  showRolePopup = false;
  selectedRole: any = null;

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
    private router: Router,
  ) {}

  get activeRolesCount(): number {
    return this.allRoles.filter((role: any) => this.isRoleActive(role)).length;
  }

  get inactiveRolesCount(): number {
    return this.allRoles.length - this.activeRolesCount;
  }

  ngOnInit(): void {
    this.getRolesByCompany();
  }

  getRolesByCompany(): void {
    this.loading = true;
    this.globalService.fetchRoles().subscribe({
      next: (res: any) => {
        this.allRoles = res?.data || res || [];
        this.roleList = [...this.allRoles];
        this.onSearch(this.searchText);
        this.loading = false;
      },
      error: (err: any) => {
        this.toastrService.danger(err?.message || 'Failed', 'Error');
        this.loading = false;
      },
    });
  }

  onSearch(query: string = ''): void {
    this.searchText = query || '';
    const searchValue = this.searchText.trim().toLowerCase();

    if (!searchValue) {
      this.roleList = [...this.allRoles];
      return;
    }

    this.roleList = this.allRoles.filter((role: any) => {
      const values = [role?.role_name, role?.remarks, this.getRoleStatus(role)];
      return values.some((value: any) => String(value ?? '').toLowerCase().includes(searchValue));
    });
  }

  clearSearch(): void {
    this.onSearch('');
  }

  isRoleActive(role: any): boolean {
    const status = role?.status;
    return status === 1 || status === true || `${status}`.trim().toLowerCase() === 'active';
  }

  getRoleStatus(role: any): string {
    return this.isRoleActive(role) ? 'Active' : 'Inactive';
  }

  getPermissionCount(role: any): number {
    const menus = this.getRoleMenus(role);

    if (menus.length) {
      return menus.reduce((total: number, menu: any) => total + this.getMenuPermissionCount(menu), 0);
    }

    const permissions = role?.permissions || role?.module_permissions || [];

    if (Array.isArray(permissions)) {
      return permissions.length;
    }

    if (permissions && typeof permissions === 'object') {
      return Object.keys(permissions).length;
    }

    return 0;
  }

  getRoleMenus(role: any): any[] {
    return Array.isArray(role?.menus) ? role.menus : [];
  }

  getMenuCount(role: any): number {
    return this.getRoleMenus(role).length;
  }

  getMenuPermissionCount(menu: any): number {
    return this.permissionTypes.filter((permission: any) =>
      this.hasMenuPermission(menu, permission.key)
    ).length;
  }

  hasMenuPermission(menu: any, permissionKey: string): boolean {
    const value = menu?.[permissionKey];
    return value === 1 || value === true || `${value}`.trim().toLowerCase() === 'true';
  }

  trackByMenu(index: number, menu: any): number | string {
    return menu?.role_menu_access_id ?? menu?.menu_id ?? index;
  }

  trackByRole(index: number, role: any): number | string {
    return role?.id ?? role?.role_id ?? index;
  }

  openRolePopup(role: any): void {
    this.selectedRole = role;
    this.showRolePopup = true;
  }

  closeRolePopup(): void {
    this.showRolePopup = false;
    this.selectedRole = null;
  }

  gotoAddRole(): void {
    this.router.navigate(['/pages/organization-setting/add-roles']);
  }

  editRole(role: any): void {
    const roleId = role?.role_id ?? role?.id;

    if (roleId === undefined || roleId === null || roleId === '') {
      this.toastrService.danger('Role ID is missing', 'Error');
      return;
    }

    this.router.navigate(['/pages/organization-setting/add-roles', roleId]);
  }
}
