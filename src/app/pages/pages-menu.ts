import { NbMenuItem } from '@nebular/theme';

export function getMenuItems(roleId: any): NbMenuItem[] {
  const menu: NbMenuItem[] = [
    {
      title: 'E-commerce',
      icon: 'shopping-cart-outline',
      link: '/pages/dashboard',
      home: true,
    },
    {
      title: 'IoT Dashboard',
      icon: 'home-outline',
      link: '/pages/iot-dashboard',
    },
    // ...(roleId === 34 || roleId === 11 || roleId === 15 || roleId === 17 || roleId === 18 || roleId === 43 || roleId === 45 || roleId === 44 || roleId === 46 || roleId === 10 || roleId === 26 || roleId === 37 || roleId === 42 || roleId === 7 || roleId === 23 || roleId === 23 || roleId === 44
    //   ? [
    //     {
    //       title: 'Follow-up Dashboard',
    //       icon: 'home-outline',
    //       link: '/pages/custom-dashboard',
    //     },
    //   ]
    //   : []),
    // ...(roleId === 34 || roleId === 11 || roleId === 15 || roleId === 17 || roleId === 18 || roleId === 43 || roleId === 45 || roleId === 44 || roleId === 46 || roleId === 10 || roleId === 26 || roleId === 37 || roleId === 42
    //   ? [
    //     {
    //       title: 'Dashboard',
    //       icon: 'keypad-outline',
    //       link: '/pages/admin-dashboard',
    //     },
    //   ]
    //   : []),
    // ...(roleId === 34 || roleId === 51
    //   ? [
    //     {
    //       title: 'Marcom Dashboard',
    //       icon: 'layers-outline',
    //       link: '/pages/marcom/marcom-dashboard',
    //     },
    //   ]
    //   : []),


    // {
    //   title: 'FEATURES',
    //   group: true,
    // },
    // ...(roleId === 34 || roleId === 14
    //   ? [
    //     {
    //       title: 'Donor',
    //       icon: 'layout-outline',
    //       children: [
    //         ...(roleId === 14 || roleId === 34 ? [{ title: 'Add Donor', link: '/pages/accounts/add-donor' }] : []),
    //         ...(roleId === 14 || roleId === 34 ? [{ title: 'Donor List', link: '/pages/accounts/donor-list' }] : []),
    //         ...(roleId === 14 || roleId === 34 ? [{ title: 'Add Donor Account', link: '/pages/accounts/add-donor-account' }] : []),
    //         ...(roleId === 14 || roleId === 34 ? [{ title: 'Donor Account List', link: '/pages/accounts/donor-account-list' }] : []),
    //         // { title: 'Manage', link: '/pages/manage-lead' },
    //       ],
    //     },
    //   ]
    //   : []),
    // ...(roleId === 34 || roleId === 14
    //   ? [
    //     {
    //       title: 'Budget',
    //       icon: 'layout-outline',
    //       children: [
    //         ...(roleId === 14 || roleId === 34 ? [{ title: 'Add Category', link: '/pages/accounts/add-budget-category' }] : []),
    //         ...(roleId === 14 || roleId === 34 ? [{ title: 'Add Budget', link: '/pages/accounts/add-budget' }] : []),
    //         ...(roleId === 14 || roleId === 34 ? [{ title: 'Budget List', link: '/pages/accounts/budget-list' }] : []),
    //         ...(roleId === 14 || roleId === 34 ? [{ title: 'Upload Budget Allotment', link: '/pages/accounts/budget-allotment-upload' }] : []),
    //         ...(roleId === 14 || roleId === 34 ? [{ title: 'Add Received Amount', link: '/pages/accounts/received-amount-from-donor' }] : []),
    //         ...(roleId === 14 || roleId === 34 ? [{ title: 'Upload Budget Expenses', link: '/pages/accounts/budget-expenses-upload' }] : []),
            

    //         // { title: 'Manage', link: '/pages/manage-lead' },
    //       ],
    //     },
    //   ]
    //   : []),

   
  ];

  return menu;
}
