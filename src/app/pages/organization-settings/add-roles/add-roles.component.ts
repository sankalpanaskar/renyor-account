import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { GlobalService } from '../../../services/global.service';
import { MenuCategory, MenuModule, ModulePermission, PermissionKey } from './role.model';

@Component({
  selector: 'ngx-add-roles',
  templateUrl: './add-roles.component.html',
  styleUrls: ['./add-roles.component.scss']
})
export class AddRolesComponent implements OnInit, OnDestroy {
  readonly permissionTypes: Array<{
    key: PermissionKey;
    label: string;
    description: string;
  }> = [
    { key: 'create', label: 'Create', description: 'Add new records' },
    { key: 'view', label: 'View', description: 'View records' },
    { key: 'edit', label: 'Edit', description: 'Modify records' },
    { key: 'delete', label: 'Delete', description: 'Remove records' },
  ];

  model = {
    role_name: '',
    remarks: '',
    permissions: [] as ModulePermission[],
  };

  modulePermissions: ModulePermission[] = [];
  menuStructure: MenuCategory[] = [];
  isSubmitting = false;
  isLoading = false;
  loadError = '';
  isEditMode = false;
  roleId: string | null = null;

  private destroy$ = new Subject<void>();
  private roleAccessMenus: any[] = [];

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  get totalModuleCount(): number {
    return this.menuStructure.reduce(
      (total: number, category: MenuCategory) => total + category.modules.length,
      0,
    );
  }

  get selectedModuleCount(): number {
    return this.modulePermissions.filter((permission: ModulePermission) =>
      this.hasAnyPermission(permission.module_id)
    ).length;
  }

  ngOnInit(): void {
    this.roleId = this.route.snapshot.paramMap.get('role_id');
    this.isEditMode = this.roleId !== null;

    if (this.roleId !== null) {
      this.fetchRoleAccess(this.roleId);
    }

    this.loadMenuStructure();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Load the modules available in the current user's package. */
  loadMenuStructure(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const packageId = user?.package_id;

    if (packageId === undefined || packageId === null || packageId === '') {
      this.loadError = 'No package is assigned to the current user.';
      this.toastrService.danger(this.loadError, 'Error!');
      return;
    }

    this.isLoading = true;
    this.loadError = '';

    this.globalService.getMenuByPackage(packageId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.extractModulesFromMenuStructure(res?.data || []);
          this.isLoading = false;
        },
        error: (err: any) => {
          this.loadError = err?.error?.message || err?.message || 'Failed to load module permissions.';
          this.toastrService.danger(this.loadError, 'Error!');
          this.isLoading = false;
        },
      });
  }

  /** Convert the API parent/children tree into the permission matrix. */
  extractModulesFromMenuStructure(menuItems: any[]): void {
    this.menuStructure = [];
    this.modulePermissions = [];

    if (!Array.isArray(menuItems)) {
      return;
    }

    const seenModuleIds = new Set<string>();
    const standaloneModules: MenuModule[] = [];

    const addModule = (item: any, parentId: any, modules: MenuModule[]): void => {
      const rawId = item?.id ?? item?.module_id ?? item?.menu_id;
      const title = item?.title || item?.module_name || item?.menu_name || item?.name;
      const normalizedId = Number(rawId);
      const dedupeKey = String(rawId);

      if (rawId === undefined || rawId === null || rawId === '' || !title || seenModuleIds.has(dedupeKey)) {
        return;
      }

      seenModuleIds.add(dedupeKey);
      modules.push({
        id: normalizedId,
        title,
        parent_id: item?.parent_id ?? parentId,
        icon: item?.icon,
        link: item?.link || item?.url || item?.route || '',
      });
      this.modulePermissions.push({
        module_id: normalizedId,
        module_name: title,
        create: false,
        view: false,
        edit: false,
        delete: false,
      });
    };

    menuItems.forEach((parent: any) => {
      const children = this.getChildren(parent);
      const modules: MenuModule[] = [];

      children.forEach((child: any) => {
        addModule(child, parent?.id, modules);
      });

      if (modules.length > 0) {
        this.menuStructure.push({
          id: Number(parent?.id),
          title: parent?.title || parent?.menu_name || parent?.name || 'Modules',
          modules,
        });
      }

      if (children.length === 0 && this.hasNavigableMenuLink(parent)) {
        addModule(parent, parent?.parent_id ?? 0, standaloneModules);
      }
    });

    if (standaloneModules.length > 0) {
      this.menuStructure.push({
        id: -1,
        title: 'Standalone Modules',
        modules: standaloneModules,
      });
    }

    this.applyRoleAccessPermissions();
  }

  getModulePermission(moduleId: number): ModulePermission | undefined {
    return this.modulePermissions.find((permission: ModulePermission) =>
      permission.module_id === moduleId
    );
  }

  updatePermission(moduleId: number, permissionType: PermissionKey, value: boolean): void {
    const permission = this.getModulePermission(moduleId);
    if (permission) {
      permission[permissionType] = value;
    }
  }

  hasAnyPermission(moduleId: number): boolean {
    const permission = this.getModulePermission(moduleId);
    return !!permission && this.permissionTypes.some(({ key }) => permission[key]);
  }

  hasAllPermissions(moduleId: number): boolean {
    const permission = this.getModulePermission(moduleId);
    return !!permission && this.permissionTypes.every(({ key }) => permission[key]);
  }

  toggleAllPermissions(moduleId: number): void {
    this.setModulePermissions(moduleId, !this.hasAllPermissions(moduleId));
  }

  hasAnyCategoryPermission(category: MenuCategory): boolean {
    return category.modules.some((module: MenuModule) => this.hasAnyPermission(module.id));
  }

  hasAllCategoryPermissions(category: MenuCategory): boolean {
    return category.modules.length > 0 && category.modules.every(
      (module: MenuModule) => this.hasAllPermissions(module.id)
    );
  }

  toggleCategoryPermissions(category: MenuCategory): void {
    const enable = !this.hasAllCategoryPermissions(category);
    category.modules.forEach((module: MenuModule) => this.setModulePermissions(module.id, enable));
  }

  trackByCategory(index: number, category: MenuCategory): number {
    return category.id || index;
  }

  trackByModule(index: number, module: MenuModule): number {
    return module.id || index;
  }

  /** Render API icons using the matching Google ligature font. */
  getApiMenuIcon(value: any, fallback: string = 'grid-outline'): any {
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

  cancel(): void {
    this.router.navigate(['/pages/organization-setting/roles']);
  }

  onSubmit(fm: any): void {
    if (!fm.valid || !this.model.role_name) {
      this.toastrService.danger('Role name is required', 'Validation Error!');
      return;
    }

    const selectedPermissions = this.modulePermissions.filter((permission: ModulePermission) =>
      this.hasAnyPermission(permission.module_id)
    );

    if (selectedPermissions.length === 0) {
      this.toastrService.danger('Please select at least one permission for a module', 'Validation Error!');
      return;
    }

    const payload: any = {
      role_name: this.model.role_name.trim(),
      remarks: this.model.remarks || '',
      permissions: selectedPermissions,
    };

    if (this.isEditMode && this.roleId !== null) {
      const numericRoleId = Number(this.roleId);
      payload.role_id = Number.isNaN(numericRoleId) ? this.roleId : numericRoleId;
    }

    this.isSubmitting = true;
    const request$ = this.isEditMode
      ? this.globalService.editRole(payload)
      : this.globalService.addRole(payload);

    request$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          fm.resetForm();
          const successMessage = this.isEditMode
            ? 'Role updated successfully!'
            : 'Role created successfully!';
          this.toastrService.success(res?.message || successMessage, 'Success!');
          this.isSubmitting = false;
          this.router.navigate(['/pages/organization-setting/roles']);
        },
        error: (err: any) => {
          const errorMessage = this.isEditMode
            ? 'Failed to update role'
            : 'Failed to create role';
          this.toastrService.danger(
            err?.error?.message || err?.message || errorMessage,
            'Error!',
          );
          this.isSubmitting = false;
        },
      });
  }

  private setModulePermissions(moduleId: number, value: boolean): void {
    const permission = this.getModulePermission(moduleId);
    if (!permission) {
      return;
    }

    this.permissionTypes.forEach(({ key }) => permission[key] = value);
  }

  private fetchRoleAccess(roleId: string): void {
    this.globalService.fetchRoleAccessByRoleId(roleId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log('Role access response:', response);
          const role = response?.data || response;

          this.model.role_name = role?.role_name || '';
          this.model.remarks = role?.remarks || '';
          this.roleAccessMenus = Array.isArray(role?.menus) ? role.menus : [];
          this.applyRoleAccessPermissions();
        },
        error: (error: any) => {
          console.error('Failed to fetch role access:', error);
          this.toastrService.danger(
            error?.error?.message || error?.message || 'Failed to fetch role access',
            'Error!',
          );
        },
      });
  }

  private applyRoleAccessPermissions(): void {
    if (!this.roleAccessMenus.length || !this.modulePermissions.length) {
      return;
    }

    this.modulePermissions.forEach((permission: ModulePermission) => {
      const menuAccess = this.roleAccessMenus.find((menu: any) =>
        String(menu?.menu_id) === String(permission.module_id)
      );

      permission.create = this.isPermissionEnabled(menuAccess?.can_create);
      permission.view = this.isPermissionEnabled(menuAccess?.can_view);
      permission.edit = this.isPermissionEnabled(menuAccess?.can_edit);
      permission.delete = this.isPermissionEnabled(menuAccess?.can_delete);
    });
  }

  private isPermissionEnabled(value: any): boolean {
    const normalizedValue = `${value}`.trim().toLowerCase();
    return value === 1 || value === true || normalizedValue === '1' || normalizedValue === 'true';
  }

  private hasNavigableMenuLink(item: any): boolean {
    const link = `${item?.link || item?.url || item?.route || ''}`.trim();
    const normalizedLink = link.toUpperCase();

    return !!link && normalizedLink !== 'NA' && normalizedLink !== 'N/A' && normalizedLink !== 'NULL';
  }

  private getChildren(item: any): any[] {
    const children = [item?.children, item?.modules, item?.submenus, item?.submenu, item?.sub_menu]
      .find((candidate: any) => Array.isArray(candidate));
    return children || [];
  }
}
