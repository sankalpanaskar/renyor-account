import { NbMenuItem } from '@nebular/theme';

/** ---------- Menu Factory ---------- */
export function getMenuItems(roleId: number, userCode?: string): NbMenuItem[] {  

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isSystemSuperAdmin = user?.is_system_super_admin === 1 || user?.is_system_super_admin === '1';

  const menu: NbMenuItem[] = [
    // Dashboard
    {
      title: 'Dashboard',
      icon: 'home-outline',
      link: '/pages/custom-dashboard',
    },
    // { title: 'FEATURES', group: true },
  ];

  // Add Users & Roles menu - visible to all users
  menu.push(
    { title: 'Users & Roles', group: true },
    {
      title: 'Users',
      icon: 'people-outline',
      children: [
        {
          title: 'Add Users',
          link: '/pages/organization-setting/add-user',
        },
        {
          title: 'User List',
          link: '/pages/organization-setting/user-list',
        }
      ],
    },
    {
      title: 'Roles',
      icon: 'checkmark-circle-outline',
      children: [
        {
          title: 'Add Roles',
          link: '/pages/organization-setting/add-roles',
        },
        {
          title: 'Roles',
          link: '/pages/organization-setting/roles',
        }
      ],
    },
    { title: 'Organization Settings', group: true },
    {
      title: 'Organization',
      icon: 'award-outline',
      children: [
        {
          title: 'Company Profile',
          link: '/pages/organization-setting/orgprofile',
        },
        {
          title: 'Manage Subscription',
          link: '/pages/organization-setting/package-list',
        },
      ],
    }
  );

  // Add admin-only menus if user is system super admin
  if (isSystemSuperAdmin) {
    menu.push(
      { title: 'Admin Settings', group: true },
      {
        title: 'Package & Module',
        icon: 'options-2-outline',
        children: [
          {
            title: 'Menu/Module',
            link: '/pages/admin-setting/setup-menu',
          },
          {
            title: 'Add Package',
            link: '/pages/admin-setting/add-package',
          },
          {
            title: 'Package List',
            link: '/pages/admin-setting/package-list',
          },
          {
            title: 'Assign Module Into Package',
            link: '/pages/admin-setting/assign-module',
          },
        ],
      },
      {
        title: 'Company',
        icon: 'bookmark-outline',
        children: [
          {
            title: 'Add Company',
            link: '/pages/admin-setting/add-company',
          },
          {
            title: 'Company List',
            link: '/pages/admin-setting/company-list',
          }
        ],
      },
      {
        title: 'Custom Field',
        icon: 'options-outline',
        children: [
          {
            title: 'Add Custom Field',
            link: '/pages/admin-setting/add-custom-field',
          },
          {
            title: 'Custom Field List',
            link: '/pages/admin-setting/custom-field-list',
          }
        ],
      },
      {
        title: 'Configure Chart Of Account',
        icon: 'activity-outline',
        children: [
          {
            title: 'Account Type',
            link: '/pages/accountant/chart-of-account-type',
          }
        ],
      },
      {
        title: 'Setup',
        icon: 'settings-2-outline',
        children: [
          {
            title: 'General',
            link: '/pages/organization-setting/profile',
          }
        ],
      },
    );
  }

  return menu;
}
