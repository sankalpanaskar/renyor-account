import { NbMenuItem } from '@nebular/theme';

/** ---------- Menu Factory ---------- */
export function getMenuItems(roleId: number, userCode?: string): NbMenuItem[] {  

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isSystemSuperAdmin = user?.is_system_super_admin === 1 || user?.is_system_super_admin === '1';
  const isCompanySuperAdmin = user?.is_company_super_admin === 1 || user?.is_company_super_admin === '1';

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
          icon: 'plus-square-outline',
          link: '/pages/organization-setting/add-user',
        },
        {
          title: 'User List',
          icon: 'list-outline',
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
          icon: 'plus-square-outline',
          link: '/pages/organization-setting/add-roles',
        },
        {
          title: 'Roles',
          icon: 'list-outline',
          link: '/pages/organization-setting/roles',
        }
      ],
    },
    { title: 'Settings', group: true },
    {
      title: 'Organization',
      icon: 'award-outline',
      children: [
        {
          title: 'Company Profile',
          icon: 'person-outline',
          link: '/pages/organization-setting/orgprofile',
        },
        {
          title: 'Subscription',
          icon: 'credit-card-outline',
          link: '/pages/organization-setting/subscriptions',
        },
        {
          title: 'Document Formats',
          icon: 'file-text-outline',
          link: '/pages/document-format-configuration',
        },
      ],
    },
    {
        title: 'Custom Field',
        icon: 'options-outline',
        children: [
          {
            title: 'Add Custom Field',
            icon: 'plus-square-outline',
            link: '/pages/admin-setting/add-custom-field',
          },
          {
            title: 'Custom Field List',
            icon: 'list-outline',
            link: '/pages/admin-setting/custom-field-list',
          }
        ],
      },
  );

  if (isCompanySuperAdmin || isSystemSuperAdmin) {
    menu.push({ title: 'Menu Setup', group: true }, {
      title: 'Setup Menu',
      icon: 'menu-outline',
      link: '/pages/admin-setting/setup-menu',
    });
  }

  // Add admin-only menus if user is system super admin
  if (isSystemSuperAdmin) {
    menu.push(
      // { title: 'Admin Settings', group: true },
      {
        title: 'Package & Module',
        icon: 'options-2-outline',
        children: [
          // {
          //   title: 'Add Package',
          //   link: '/pages/admin-setting/add-package',
          // },
          {
            title: 'Packages',
            icon: 'credit-card-outline',
            link: '/pages/admin-setting/package-list',
          },
          {
            title: 'Package Module',
            icon: 'checkmark-square-outline',
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
            icon: 'plus-square-outline',
            link: '/pages/admin-setting/add-company',
          },
          {
            title: 'Company List',
            icon: 'list-outline',
            link: '/pages/admin-setting/company-list',
          }
        ],
      },
      {
        title: 'Configure Chart Of Account',
        icon: 'activity-outline',
        children: [
          {
            title: 'Account Type',
            icon: 'plus-square-outline',
            link: '/pages/accountant/chart-of-account-type',
          }
        ],
      },
    );
  }

  return menu;
}
