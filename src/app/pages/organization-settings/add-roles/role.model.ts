/**
 * Role and Permission Models
 */

export interface Permission {
  id?: number;
  name: string;
  key: 'create' | 'view' | 'edit' | 'delete';
}

export interface ModulePermission {
  module_id: number;
  module_name: string;
  create: boolean;
  view: boolean;
  edit: boolean;
  delete: boolean;
}

export interface RoleModel {
  role_name: string;
  remarks?: string;
  permissions: ModulePermission[];
}

export interface Module {
  id: number;
  name?: string;
  title?: string;
  module_name?: string;
  children?: Module[];
}

export interface ParentMenu {
  id: number;
  title: string;
  name?: string;
}
