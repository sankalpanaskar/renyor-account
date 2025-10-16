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
    {
      title: 'FEATURES',
      group: true,
    },
    ...(roleId === 34 || roleId === 15 || roleId === 7 || roleId === 23 || roleId === 17 
      ? [
        {
          title: 'Assets',
          icon: 'layout-outline',
          children: [
            ...(roleId === 15 || roleId === 23 || roleId === 7 || roleId === 34 ? [{ title: 'Bulk Upload', link: '/pages/assets/bulk-upload' }] : []),
            ...(roleId === 15 || roleId === 23 || roleId === 7 || roleId === 34 ? [{ title: 'Add Asset', link: '/pages/assets/add-asset' }] : []),
            ...(roleId === 15 || roleId === 23 || roleId === 7 || roleId === 34 ? [{ title: 'Asset List', link: '/pages/assets/asset-list' }] : []),
            ...(roleId === 15 || roleId === 23 || roleId === 7 || roleId === 34 ? [{ title: 'Asset Transfer', link: '/pages/assets/asset-transfer' }] : []),
            // { title: 'Manage', link: '/pages/manage-lead' },

            // ...(roleId === 15 || roleId === 23 || roleId === 7 || roleId === 17 ||  roleId === 34 ? [{ title: 'Transfer Leads', link: '/pages/lead/lead-center-transfer' }] : []),
            // ...(roleId === 15 || roleId === 23 || roleId === 7 || roleId === 34 ? [{ title: 'Not Interested Lead', link: '/pages/lead/not-interested-lead' }] : []),
          ],
        },
      ]
      : []),

    

   
  ];

  return menu;
}
