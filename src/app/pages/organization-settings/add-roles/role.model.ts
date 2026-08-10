/**
 * Role and Permission Models
 */

export interface Permission {
  id?: number;
  name: string;
  key: 'create' | 'view' | 'edit' | 'delete';
}

export type PermissionKey = 'create' | 'view' | 'edit' | 'delete';

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

export interface MenuModule {
  id: number;
  title: string;
  parent_id?: number;
  icon?: string;
  link?: string;
}

export interface MenuCategory {
  id: number;
  title: string;
  modules: MenuModule[];
}

export interface ParentMenu {
  id: number;
  title: string;
  name?: string;
}
