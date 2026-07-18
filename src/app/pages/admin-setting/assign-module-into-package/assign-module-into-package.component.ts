import { Component, OnInit } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { GlobalService } from '../../../services/global.service';

@Component({
  selector: 'ngx-assign-module-into-package',
  templateUrl: './assign-module-into-package.component.html',
  styleUrls: ['./assign-module-into-package.component.scss']
})
export class AssignModuleIntoPackageComponent implements OnInit {
  model: any = this.createEmptyModel();
  parentMenuList: any[] = [];
  moduleList: any[] = [];
  allParentModules: any[] = [];
  packageList: any[] = [];
  apiData: any[] = [];
  selectedPackageId: any = null;
  assignedModuleCount = 0;
  loadingList = false;
  isSubmitting = false;
  isLoadingModules = false;
  isLoadingAssignedModules = false;
  showAssignPopup = false;
  private popupAssignedModuleIds = new Set<string>();

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
  ) {}

  get areAllModulesSelected(): boolean {
    return this.availableModules.length > 0 && this.availableModules.every((module: any) =>
      this.model.module_id.includes(module.id)
    );
  }

  get availableModules(): any[] {
    return this.moduleList.filter((module: any) => !this.isModuleAlreadyAssigned(module.id));
  }

  ngOnInit(): void {
    this.getPackage();
    this.getParentMenu();
  }

  private createEmptyModel(packageId: any = null): any {
    return {
      package_id: packageId,
      parent_id: null,
      module_id: [],
    };
  }

  getPackage(): void {
    this.loadingList = true;
    this.globalService.gePackageList().subscribe({
      next: (res: any) => {
        const packages = res?.data || res || [];
        this.packageList = Array.isArray(packages) ? packages : [];

        if (this.packageList.length > 0) {
          const selectedStillExists = this.packageList.some((item: any) => item.id === this.selectedPackageId);
          this.selectedPackageId = selectedStillExists ? this.selectedPackageId : this.packageList[0].id;
          this.loadAssignedModules(this.selectedPackageId);
        } else {
          this.apiData = [];
          this.assignedModuleCount = 0;
          this.loadingList = false;
        }
      },
      error: (err: any) => {
        this.toastrService.danger(err?.message || err, 'Failed');
        this.loadingList = false;
      },
    });
  }

  onPackageChange(value: any): void {
    this.selectedPackageId = value;

    if (!value) {
      this.apiData = [];
      this.assignedModuleCount = 0;
      return;
    }

    this.loadAssignedModules(value);
  }

  private loadAssignedModules(packageId: any): void {
    this.loadingList = true;
    this.globalService.getMenuByPackage(packageId).subscribe({
      next: (res: any) => {
        const menuData = res?.data || res || [];
        this.apiData = Array.isArray(menuData)
          ? menuData.map((menu: any) => this.normalizeMenu(menu))
          : [];
        this.assignedModuleCount = this.apiData.reduce(
          (total: number, menu: any) => total + menu._children.length,
          0
        );
        this.loadingList = false;
      },
      error: (err: any) => {
        this.toastrService.danger(err?.message || err, 'Failed');
        this.loadingList = false;
      },
    });
  }

  private normalizeMenu(menu: any): any {
    const children = menu?.children || menu?.items || menu?.submenus || [];

    return {
      ...menu,
      _title: menu?.title || menu?.menu_name || menu?.name || 'Untitled Menu',
      _link: menu?.link || menu?.url || 'No route configured',
      _children: Array.isArray(children)
        ? children.map((child: any) => ({
            ...child,
            _title: child?.title || child?.menu_name || child?.name || 'Untitled Module',
            _link: child?.link || child?.url || 'No route configured',
          }))
        : [],
    };
  }

  getParentMenu(): void {
    this.globalService.getParentMenuList().subscribe({
      next: (res: any) => {
        const parents = res?.data || res || [];
        this.parentMenuList = Array.isArray(parents) ? parents : [];
      },
      error: (err: any) => {
        this.toastrService.danger(err?.message || 'Unable to load parent menus', 'Error!');
      }
    });
  }

  onParentMenuChange(value: any): void {
    this.model.module_id = [];
    this.moduleList = [];
    this.allParentModules = [];

    if (!value) {
      return;
    }

    this.isLoadingModules = true;
    this.globalService.getModuleByParentMenuID(value).subscribe({
      next: (res: any) => {
        const modules = res?.data || res || [];
        this.allParentModules = Array.isArray(modules)
          ? modules.map((module: any) => ({
              ...module,
              id: this.getModuleId(module),
            }))
          : [];
        this.filterAvailableModules();
        this.isLoadingModules = false;
      },
      error: (err: any) => {
        this.toastrService.danger(err?.message || 'Unable to load modules', 'Error!');
        this.isLoadingModules = false;
      }
    });
  }

  openAssignPopup(): void {
    this.model = this.createEmptyModel(this.selectedPackageId || this.packageList[0]?.id || null);
    this.moduleList = [];
    this.allParentModules = [];
    this.showAssignPopup = true;
    this.loadPopupAssignedModules(this.model.package_id);
  }

  closeAssignPopup(form?: any): void {
    if (this.isSubmitting) {
      return;
    }

    form?.resetForm(this.createEmptyModel(this.selectedPackageId));
    this.model = this.createEmptyModel(this.selectedPackageId);
    this.moduleList = [];
    this.allParentModules = [];
    this.popupAssignedModuleIds.clear();
    this.isLoadingModules = false;
    this.isLoadingAssignedModules = false;
    this.showAssignPopup = false;
  }

  onAssignPackageChange(packageId: any): void {
    this.model.module_id = [];
    this.moduleList = [];
    this.popupAssignedModuleIds.clear();

    if (!packageId) {
      return;
    }

    this.loadPopupAssignedModules(packageId);
  }

  private loadPopupAssignedModules(packageId: any): void {
    if (!packageId) {
      this.popupAssignedModuleIds.clear();
      this.filterAvailableModules();
      return;
    }

    this.isLoadingAssignedModules = true;
    this.globalService.getMenuByPackage(packageId).subscribe({
      next: (res: any) => {
        const assignedMenus = res?.data || res || [];
        const assignedIds = new Set<string>();

        if (Array.isArray(assignedMenus)) {
          assignedMenus.forEach((menu: any) => {
            const children = menu?.children || menu?.items || menu?.submenus || [];
            if (Array.isArray(children)) {
              children.forEach((module: any) => {
                const moduleId = this.getModuleId(module);
                if (moduleId !== null) {
                  assignedIds.add(String(moduleId));
                }
              });
            }
          });
        }

        this.popupAssignedModuleIds = assignedIds;
        this.filterAvailableModules();
        this.isLoadingAssignedModules = false;
      },
      error: (err: any) => {
        this.toastrService.danger(err?.message || 'Unable to check assigned modules', 'Error!');
        this.popupAssignedModuleIds.clear();
        this.filterAvailableModules();
        this.isLoadingAssignedModules = false;
      },
    });
  }

  private filterAvailableModules(): void {
    this.moduleList = this.allParentModules.filter((module: any) => this.getModuleId(module) !== null);

    const availableIds = new Set(this.availableModules.map((module: any) => String(this.getModuleId(module))));
    this.model.module_id = this.model.module_id.filter((id: any) => availableIds.has(String(id)));
  }

  private getModuleId(module: any): any {
    return module?.id ?? module?.module_id ?? module?.menu_id ?? null;
  }

  getModuleEmptyMessage(): string {
    if (!this.model.parent_id) {
      return 'Select a parent menu to load modules.';
    }

    if (this.isLoadingModules || this.isLoadingAssignedModules) {
      return 'Checking available modules...';
    }

    return 'No modules available for this menu.';
  }

  isModuleSelected(moduleId: any): boolean {
    return this.model.module_id.includes(moduleId);
  }

  isModuleAlreadyAssigned(moduleId: any): boolean {
    return this.popupAssignedModuleIds.has(String(moduleId));
  }

  toggleModule(moduleId: any, checked: boolean): void {
    if (this.isModuleAlreadyAssigned(moduleId)) {
      return;
    }

    if (checked && !this.isModuleSelected(moduleId)) {
      this.model.module_id = [...this.model.module_id, moduleId];
    } else if (!checked) {
      this.model.module_id = this.model.module_id.filter((id: any) => id !== moduleId);
    }
  }

  toggleAllModules(): void {
    this.model.module_id = this.areAllModulesSelected
      ? []
      : this.availableModules.map((module: any) => module.id);
  }

  onSubmit(form: any): void {
    if (form.invalid || this.model.module_id.length === 0 || this.isSubmitting) {
      return;
    }

    const assignedPackageId = this.model.package_id;
    this.isSubmitting = true;
    this.globalService.assignModuleIntoPackage({ ...this.model }).subscribe({
      next: (res: any) => {
        this.toastrService.success(res?.message || 'Modules assigned successfully', 'Success!');
        this.isSubmitting = false;
        form.resetForm(this.createEmptyModel(assignedPackageId));
        this.showAssignPopup = false;
        this.moduleList = [];
        this.selectedPackageId = assignedPackageId;
        this.loadAssignedModules(assignedPackageId);
      },
      error: (err: any) => {
        this.toastrService.danger(err?.message || 'Unable to assign modules', 'Error!');
        this.isSubmitting = false;
      },
    });
  }
}
