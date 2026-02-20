import { Component, OnInit, OnDestroy } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';
import { ModulePermission, ParentMenu, Module } from './role.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-add-roles',
  templateUrl: './add-roles.component.html',
  styleUrls: ['./add-roles.component.scss']
})
export class AddRolesComponent implements OnInit, OnDestroy {

  model: any = {
    role_name: '',
    remarks: '',
    permissions: []
  };

  parentMenuList: ParentMenu[] = [];
  modulesList: Module[] = [];
  modulePermissions: ModulePermission[] = [];
  menuStructure: any[] = []; // Organized menu with parent → children structure
  isSubmitting: boolean = false;
  isLoading: boolean = false;
  expandedModules: Set<number> = new Set();
  expandedCategories: Set<string> = new Set(); // Track expanded parent categories
  
  private destroy$ = new Subject<void>();

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadMenuStructure();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load Menu Structure and Extract Modules
   */
  loadMenuStructure() {
    // Get package_id from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const packageId = user?.package_id;

    if (!packageId) {
      this.toastrService.danger('No package_id found in localStorage', 'Error!');
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.globalService.getMenuByPackage(packageId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          console.log('✅ Menu Structure Response:', res);
          
          if (res.data) {
            // Extract all modules from the menu structure
            this.extractModulesFromMenuStructure(res.data);
          }
          this.isLoading = false;
        },
        error: (err: any) => {
          this.toastrService.danger(err.message || 'Failed to load menu structure', 'Error!');
          this.isLoading = false;
        },
      });
  }

  /**
   * Extract modules from menu structure - only from children
   */
  extractModulesFromMenuStructure(menuItems: any[]) {
    if (!Array.isArray(menuItems)) {
      return;
    }

    // Reset structures
    this.menuStructure = [];
    this.modulePermissions = [];

    menuItems.forEach((item: any) => {
      const parentName = item.title || item.name;
      console.log('📌 Processing Category:', parentName, 'has children:', !!item.children);
      
      // Only process items that have children
      if (item.children && Array.isArray(item.children) && item.children.length > 0) {
        const categoryModules: any[] = [];

        item.children.forEach((child: any) => {
          console.log('✨ Child Module:', child);
          
          // Extract module name from child item
          const moduleName = child.module_name || child.name || child.title;
          const moduleId = child.id;

          if (moduleId && moduleName) {
            // Add to permissions array
            if (!this.modulePermissions.find(p => p.module_id === moduleId)) {
              this.modulePermissions.push({
                module_id: moduleId,
                module_name: moduleName,
                create: false,
                view: false,
                edit: false,
                delete: false
              });
            }

            // Add to category structure
            categoryModules.push({
              id: moduleId,
              name: moduleName,
              ...child
            });
          }
        });

        // Add category to menu structure if it has modules
        if (categoryModules.length > 0) {
          this.menuStructure.push({
            id: item.id,
            category: parentName,
            modules: categoryModules
          });
        }
      }
    });

    console.log('📋 Total Modules Loaded:', this.modulePermissions.length);
    console.log('📊 Menu Structure:', this.menuStructure);
    console.log('🔍 Final Modules:', this.modulePermissions);
  }

  /**
   * Toggle category expansion
   */
  toggleCategory(categoryName: string) {
    if (this.expandedCategories.has(categoryName)) {
      this.expandedCategories.delete(categoryName);
    } else {
      this.expandedCategories.add(categoryName);
    }
  }

  /**
   * Check if category is expanded
   */
  isCategoryExpanded(categoryName: string): boolean {
    return this.expandedCategories.has(categoryName);
  }

  /**
   * Get module permission by module id
   */
  getModulePermission(moduleId: number): ModulePermission | undefined {
    return this.modulePermissions.find(p => p.module_id === moduleId);
  }

  /**
   * Toggle module expansion
   */
  toggleModule(moduleId: number) {
    if (this.expandedModules.has(moduleId)) {
      this.expandedModules.delete(moduleId);
    } else {
      this.expandedModules.add(moduleId);
    }
  }

  /**
   * Check if module is expanded
   */
  isModuleExpanded(moduleId: number): boolean {
    return this.expandedModules.has(moduleId);
  }

  /**
   * Update permission for a module
   */
  updatePermission(moduleId: number, permissionType: 'create' | 'view' | 'edit' | 'delete', value: boolean) {
    const permission = this.getModulePermission(moduleId);
    if (permission) {
      permission[permissionType] = value;
    }
  }

  /**
   * Check if at least one permission is selected for a module
   */
  hasAnyPermission(moduleId: number): boolean {
    const permission = this.getModulePermission(moduleId);
    return permission ? (permission.create || permission.view || permission.edit || permission.delete) : false;
  }

  /**
   * Select/Deselect all permissions for a module
   */
  toggleAllPermissions(moduleId: number) {
    const permission = this.getModulePermission(moduleId);
    if (permission) {
      const hasAny = this.hasAnyPermission(moduleId);
      permission.create = !hasAny;
      permission.view = !hasAny;
      permission.edit = !hasAny;
      permission.delete = !hasAny;
    }
  }

  /**
   * Cancel and go back
   */
  cancel() {
    this.router.navigate(['/pages/organization-setting/roles']);
  }

  /**
   * Submit role with permissions
   */
  onSubmit(fm: any) {
    if (!fm.valid || !this.model.role_name) {
      this.toastrService.danger('Role name is required', 'Validation Error!');
      return;
    }

    // Filter permissions to only include modules with at least one permission
    const selectedPermissions = this.modulePermissions.filter(p => this.hasAnyPermission(p.module_id));

    if (selectedPermissions.length === 0) {
      this.toastrService.danger('Please select at least one permission for a module', 'Validation Error!');
      return;
    }

    const payload = {
      role_name: this.model.role_name,
      remarks: this.model.remarks || '',
      permissions: selectedPermissions
    };

    this.isSubmitting = true;
    this.globalService.addRole(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          fm.resetForm();
          this.toastrService.success(res.message || 'Role created successfully!', 'Success!');
          this.isSubmitting = false;
          // Navigate back to roles list
          this.router.navigate(['/pages/organization-setting/roles']);
        },
        error: (err) => {
          this.toastrService.danger(err.message || 'Failed to create role', 'Error!');
          this.isSubmitting = false;
        },
      });
  }

}


