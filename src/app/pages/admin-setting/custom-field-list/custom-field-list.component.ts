import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { GlobalService } from '../../../services/global.service';

@Component({
  selector: 'ngx-custom-field-list',
  templateUrl: './custom-field-list.component.html',
  styleUrls: ['./custom-field-list.component.scss']
})
export class CustomFieldListComponent implements OnInit {
  loading = false;
  isSubmitting = false;
  allCustomFields: any[] = [];
  apiData: any[] = [];
  lastSearchForm = '';
  allModuleList: any[] = [];
  moduleList: any[] = [];
  showAssignPopup = false;
  selectedFieldForAssign: any = null;
  selectedAssignModules: any[] = [];
  selectedAssignModuleId: any = '';

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.getCustomFields();
  }

  get activeCustomFieldsCount(): number {
    return this.allCustomFields.filter((field: any) => this.isActiveStatus(field)).length;
  }

  get inactiveCustomFieldsCount(): number {
    return this.allCustomFields.length - this.activeCustomFieldsCount;
  }

  private getModuleOptionLabel(module: any): string {
    return (
      module?.menu_name ||
      module?.module_name ||
      module?.name ||
      module?.title ||
      ''
    ).toString().trim();
  }

  private parseAssignedModules(field: any): any[] {
    const moduleIds = `${field?.module_id || ''}`
      .split(',')
      .map((value: string) => Number(value.trim()))
      .filter((value: number) => !Number.isNaN(value));

    const moduleNames = `${field?.menu_name || field?.module_name || ''}`
      .split(',')
      .map((value: string) => value.trim())
      .filter(Boolean);

    return moduleIds.map((id: number, index: number) => ({
      id,
      menu_name: moduleNames[index] || `Module ${id}`,
    }));
  }

  private refreshAvailableModuleList(): void {
    const selectedIds = new Set(
      this.selectedAssignModules
        .map((module: any) => Number(module?.id))
        .filter((id: number) => !Number.isNaN(id))
    );

    this.moduleList = this.allModuleList.filter((module: any) => !selectedIds.has(Number(module?.id)));
  }

  getAllModule(): void {
    this.isSubmitting = true;
    this.globalService.getAllModule().subscribe({
      next: (res: any) => {
        const modules = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];

        const normalizedModules = modules
          .map((item: any) => ({
            ...item,
            menu_name: this.getModuleOptionLabel(item),
          }))
          .filter((item: any) => !!item.menu_name);

        const addModules = normalizedModules.filter((item: any) =>
          item.menu_name.toLowerCase().startsWith('add')
        );

        this.allModuleList = addModules.length ? addModules : normalizedModules;
        this.selectedAssignModules = this.selectedAssignModules.map((selectedModule: any) => {
          const matchedModule = this.allModuleList.find((module: any) => Number(module?.id) === Number(selectedModule?.id));
          return matchedModule || selectedModule;
        });
        this.refreshAvailableModuleList();
        this.isSubmitting = false;
      },
      error: (err: any) => {
        this.toastrService.danger(err?.error?.message || 'Failed to load modules', 'Modules');
        this.isSubmitting = false;
      },
    });
  }

  private getModuleDisplayName(field: any): string {
    return (
      field?.menu_name ||
      field?.module?.menu_name ||
      field?.module?.module_name ||
      field?.module?.name ||
      field?.module_name ||
      field?.module ||
      `Module ${field?.module_id || ''}`
    ).toString().trim();
  }

  private formatFieldType(fieldType: any): string {
    const normalized = `${fieldType || ''}`.trim();
    if (!normalized) {
      return '-';
    }

    return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
  }

  private normalizeFields(res: any): any[] {
    const fields = Array.isArray(res?.data)
      ? res.data
      : Array.isArray(res)
        ? res
        : [];

    return fields.map((field: any) => ({
      name: field?.field_label || field?.field_name || '-',
      type: this.formatFieldType(field?.field_type),
      module: this.getModuleDisplayName(field),
      status: Number(field?.status ?? 0),
      isActive: Number(field?.status ?? 0) === 1,
      fullData: field,
    }));
  }

  getCustomFields(): void {
    this.loading = true;
    this.globalService.fetchCustomFieldsByModule().subscribe({
      next: (res: any) => {
        this.allCustomFields = this.normalizeFields(res);
        this.apiData = [...this.allCustomFields];
        this.onSearch(this.lastSearchForm);
        this.loading = false;
      },
      error: (err: any) => {
        const errorMessage =
          err?.error?.message ||
          err?.message ||
          'Custom field list failed. Please try again.';

        this.toastrService.danger(errorMessage, 'Custom Field List Failed');
        this.loading = false;
      },
    });
  }

  onSearch(query: string = ''): void {
    this.lastSearchForm = query || '';
    const searchText = this.lastSearchForm.trim().toLowerCase();

    if (!searchText) {
      this.apiData = [...this.allCustomFields];
      return;
    }

    this.apiData = this.allCustomFields.filter((field: any) => {
      const searchableValues = [
        field?.name,
        field?.type,
        field?.module,
        field?.fullData?.field_name,
        field?.fullData?.field_label,
      ];

      return searchableValues.some((value: any) =>
        String(value || '').toLowerCase().includes(searchText)
      );
    });
  }

  clearSearch(): void {
    this.onSearch('');
  }

  trackByCustomField(index: number, field: any): any {
    return field?.fullData?.id ?? field?.fullData?.field_id ?? field?.name ?? index;
  }

  getStatusLabel(status: any): string {
    return Number(status) === 1 ? 'Active' : 'Not Active';
  }

  isActiveStatus(item: any): boolean {
    return !!item?.isActive;
  }

  onAssign(field: any, event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    this.selectedFieldForAssign = field;
    this.showAssignPopup = true;
    this.selectedAssignModules = this.parseAssignedModules(field?.fullData);
    this.allModuleList = [];
    this.moduleList = [];
    this.getAllModule();
  }

  onEdit(field: any, event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    const queryParams: any = {};
    const fieldId = field?.fullData?.id;
    const moduleId = field?.fullData?.module_id || field?.fullData?.module?.id;

    if (fieldId) {
      queryParams.field_id = fieldId;
    }

    if (moduleId) {
      queryParams.module_id = moduleId;
    }

    this.router.navigate(['pages/admin-setting/add-custom-field'], {
      queryParams
    });
  }

  onDeactive(field: any, event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    const fieldName = field?.name || 'Custom field';
    this.toastrService.warning(`${fieldName} deactive action is not connected yet.`, 'Custom Field');
  }

  closeAssignPopup(): void {
    this.showAssignPopup = false;
    this.selectedFieldForAssign = null;
    this.selectedAssignModules = [];
    this.allModuleList = [];
    this.moduleList = [];
    this.selectedAssignModuleId = '';
  }

  onAssignModuleSelected(moduleId: any): void {
    this.selectedAssignModuleId = '';
    const matchedModule = this.moduleList.find((module: any) => Number(module?.id) === Number(moduleId));
    if (!matchedModule) {
      return;
    }

    const alreadySelected = this.selectedAssignModules.some((module: any) => Number(module?.id) === Number(matchedModule.id));
    if (!alreadySelected) {
      this.selectedAssignModules = [...this.selectedAssignModules, matchedModule];
      this.refreshAvailableModuleList();
    }
  }

  removeAssignedModule(moduleId: any): void {
    const customFieldId = this.selectedFieldForAssign?.fullData?.id;
    const normalizedModuleId = Number(moduleId);

    if (!customFieldId || Number.isNaN(normalizedModuleId)) {
      this.toastrService.danger('Custom field or module id is missing.', 'Deassign Module');
      return;
    }

    const payload = {
      custom_field_id: Number(customFieldId),
      module_id: normalizedModuleId,
    };

    this.isSubmitting = true;
    this.globalService.deassignCustomFieldModules(payload).subscribe({
      next: (res: any) => {
        this.selectedAssignModules = this.selectedAssignModules.filter((module: any) => Number(module?.id) !== normalizedModuleId);
        this.refreshAvailableModuleList();
        this.getCustomFields();
        this.toastrService.success(res?.message || 'Module deassigned successfully.', 'Deassign Module');
        this.isSubmitting = false;
      },
      error: (err: any) => {
        this.toastrService.danger(err?.error?.message || 'Failed to deassign module.', 'Deassign Module');
        this.isSubmitting = false;
      },
    });
  }

  saveAssignedModules(): void {
    if (!this.selectedAssignModules.length) {
      this.toastrService.warning('Please select at least one module.', 'Assign Module');
      return;
    }

    const customFieldId = this.selectedFieldForAssign?.fullData?.id;
    if (!customFieldId) {
      this.toastrService.danger('Custom field id is missing.', 'Assign Module');
      return;
    }

    const payload = {
      custom_field_id: Number(customFieldId),
      modules: this.selectedAssignModules
        .map((module: any) => Number(module?.id))
        .filter((moduleId: number) => !Number.isNaN(moduleId)),
    };

    if (!payload.modules.length) {
      this.toastrService.warning('Please select at least one valid module.', 'Assign Module');
      return;
    }

    this.isSubmitting = true;
    this.globalService.assignCustomField(payload).subscribe({
      next: (res: any) => {
        this.toastrService.success(res?.message || 'Custom field assigned successfully.', 'Assign Module');
        this.closeAssignPopup();
        this.getCustomFields();
        this.isSubmitting = false;
      },
      error: (err: any) => {
        this.toastrService.danger(err?.error?.message || 'Failed to assign custom field.', 'Assign Module');
        this.isSubmitting = false;
      },
    });
  }

  gotoAddCustomField(): void {
    this.router.navigate(['pages/admin-setting/add-custom-field']);
  }
}
