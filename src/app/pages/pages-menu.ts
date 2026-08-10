import { NbMenuItem } from '@nebular/theme';

/** ---------- Menu Factory ---------- */
export function getMenuItems(roleId: number, userCode?: string): NbMenuItem[] {  

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isSystemSuperAdmin = user?.is_system_super_admin === 1 || user?.is_system_super_admin === '1';
  const isCompanySuperAdmin = user?.is_company_super_admin === 1 || user?.is_company_super_admin === '1';

  const menu: NbMenuItem[] = [

    //visible to all users

    {
      title: 'Dashboard',
      icon: 'home-outline',
      link: '/pages/custom-dashboard',
    },
    // { title: 'FEATURES', group: true },
  ];
  
  if (isCompanySuperAdmin || isSystemSuperAdmin) {
    menu.push(
    { title: 'Users & Roles', group: true },
    {
      title: 'Users',
      icon: { icon: 'people', pack: 'material-icons' },
      link: '/pages/organization-setting/user-list',
    },
    {
      title: 'Roles',
      icon: { icon: 'settings_b_roll', pack: 'material-icons' },
      link: '/pages/organization-setting/roles',
    },
    { title: 'Settings', group: true },
    {
      title: 'Company Profile',
      icon: { icon: 'person', pack: 'material-icons' },
      link: '/pages/organization-setting/orgprofile',
    },
    {
      title: 'Subscription',
      icon: { icon: 'subscriptions', pack: 'material-icons' },
      link: '/pages/organization-setting/subscriptions',
    },
    {
      title: 'Report Configuration',
      icon: { icon: 'article', pack: 'material-icons' },
      link: '/pages/document-format-configuration',
    },
    {
      title: 'Custom Field',
      icon: { icon: 'tune', pack: 'material-icons' },
      link: '/pages/admin-setting/custom-field-list'
    }
  );
  }

  // Add admin-only menus if user is system super admin
  if (isSystemSuperAdmin) {
    menu.push(
      // { title: 'Admin Settings', group: true },
      {
        title: 'Menu',
        icon: { icon: 'display_settings', pack: 'material-icons' },
        link: '/pages/admin-setting/setup-menu',
      },  
     {
        title: 'Package & Module',
        icon: { icon: 'inventory_2', pack: 'material-icons' },
        children: [
          {
            title: 'Packages',
            icon: { icon: 'credit_card', pack: 'material-icons' },
            link: '/pages/admin-setting/package-list',
          },
          {
            title: 'Package Module',
            icon: { icon: 'admin_panel_settings', pack: 'material-icons' },
            link: '/pages/admin-setting/assign-module',
          },
        ],
      },
      {
        title: 'Company',
        icon: { icon: 'add_business', pack: 'material-icons' },
        link: '/pages/admin-setting/company-list',
      },
      {
        title: 'Chart Of Account',
        icon: { icon: 'account_tree', pack: 'material-icons' },
        children: [
          {
            title: 'Account Type',
            icon: { icon: 'add_chart', pack: 'material-icons' },
            link: '/pages/accountant/chart-of-account-type',
          }
        ],
      },
    );
  }

  return menu;
}
