import { NbMenuItem } from '@nebular/theme';

/** ---------- Role Sets ---------- */
const DASHBOARD_ROLES = new Set([
  7, 10, 11, 14, 15, 17, 18, 23, 24, 26, 27, 28, 29, 30,
  32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45,
  46, 47, 48, 49, 50, 51,
]);
const COMMON_ROLES = DASHBOARD_ROLES;

// Assets
const BULK_UPLOAD_ROLES = new Set([39, 35]);      // keep as is for other uses if needed
const ADD_ASSET_ROLES   = BULK_UPLOAD_ROLES;
const ASSET_LIST_ROLES  = new Set([35, 39, 14]);
const PENDING_ASSET_ROLES     = new Set([35, 39, 14]);
const ASSET_TRANSFER_ROLES    = DASHBOARD_ROLES;
const STATUS_CHANGE_ROLES     = new Set([39,35]);
const ASSET_HISTORY_ROLES     = new Set([35, 39, 14]);
const ASSET_OWNER_CHANGE      = BULK_UPLOAD_ROLES;
const APPROVE_SCRAP_REQUEST_ROLES = new Set([39, 18, 14]);
const BUYER_MENU_ROLES = new Set([25,35,39,14]);
const SCRAP_MENU_ROLES = new Set([25,35,39,14]);
const REPORT_ROLES = new Set([25,35,39,14]);


// Approve
const APPROVE_CENTER_TO_CENTER_ROLES = COMMON_ROLES;

/** ---------- Allow-lists by user code ---------- */
const APPROVE_SCRAP_USERS = new Set(['ANP-0011', 'ADI-0001']);
const BRAND_MENU_USERS    = new Set(['ANP-0011']);
const SCRAP_MENU_USERS    = new Set(['ANP-0011', 'ANP-2770', 'ADI-0001', 'ANP-1697']);
const TRANS_SCRAP_USERS    = new Set(['ANP-0011', 'ANP-2770']);
const APPROVE_SCRAP_USER    = new Set(['ADI-0001', 'ANP-1697']);
const DISPOSAL_MENU_USERS = new Set(['ANP-0011']);
const CENTER_TO_HO_USER = new Set(['ANP-0011','ANP-0191','ANP-1648','ANP-1756','ANP-0185','ANP-3540','ANP-3270']); // <-- only these for role 39
const ADD_BUYER_USER = new Set(['ANP-0011', 'ANP-3540']); // <-- only these for role 39
const BULK_UPLOAD_ROLE39_USERS = new Set(['ANP-0011','ANP-2770']); // <-- only these for role 39
const ADD_ASSET_ROLE39_USERS = new Set(['ANP-0011']); // <-- only these for role 39
const ITEM_ROLE39_USERS = new Set(['ANP-0011','ANP-2770']); // <-- only these for role 39





/** ---------- Helpers ---------- */
const hasRole = (roleId: number, allowed: ReadonlySet<number>) => allowed.has(roleId);
const hasUser = (userCode?: string, allowed?: ReadonlySet<string>) =>
  !!userCode && !!allowed && allowed.has(userCode.toUpperCase());

const show = (cond: boolean, item: NbMenuItem): NbMenuItem[] => (cond ? [item] : []);
const showMany = (cond: boolean, items: NbMenuItem[]): NbMenuItem[] => (cond ? items : []);

/** ---------- Menu Factory ---------- */
export function getMenuItems(roleId: number, userCode?: string): NbMenuItem[] {
  // const canSeeApproveScrap =
  //   hasRole(roleId, APPROVE_SCRAP_REQUEST_ROLES) && hasUser(userCode, APPROVE_SCRAP_USERS);

  const canSeeBrand    = hasUser(userCode, BRAND_MENU_USERS);
  const canSeeDisposal = hasUser(userCode, DISPOSAL_MENU_USERS);
  const canSeeScrapMenu    = hasUser(userCode, SCRAP_MENU_USERS);
  const canSeeTransferScrap    = hasUser(userCode, TRANS_SCRAP_USERS);
  const canSeeApproveScrap    = hasUser(userCode, APPROVE_SCRAP_USER);
  const canSeeAddBuyer    = hasUser(userCode, ADD_BUYER_USER);
  const centerToHoApprove    = hasUser(userCode, CENTER_TO_HO_USER);


  // ✅ Bulk Upload visibility rule:
  // - role 35 -> always
  // - role 39 -> only if userCode is ANP-0011
  const canSeeBulkUpload =
    roleId === 35 ||
    (roleId === 39 && hasUser(userCode, BULK_UPLOAD_ROLE39_USERS));

  // ✅ Add Asset visibility rule:
  // - role 35 -> always
  // - role 39 -> only if userCode is ANP-0011
  const canSeeAddAsset =
    roleId === 35 ||
    (roleId === 39 && hasUser(userCode, ADD_ASSET_ROLE39_USERS));

  // ✅ Item Menu visibility rule:
  // - role 35 -> always
  // - role 39 -> only if userCode is ANP-0011
  const canSeeItem =
    roleId === 35 ||
    (roleId === 39 && hasUser(userCode, ITEM_ROLE39_USERS));    

  const menu: NbMenuItem[] = [
    // Dashboard
    ...show(hasRole(roleId, DASHBOARD_ROLES), {
      title: 'Dashboard',
      icon: 'home-outline',
      link: '/pages/custom-dashboard',
    }),

    { title: 'FEATURES', group: true },

    // Assets
    ...showMany(hasRole(roleId, COMMON_ROLES), [
      {
        title: 'Assets',
        icon: 'layout-outline',
        children: [
          // 🔹 Bulk Upload: special rule
          ...show(canSeeBulkUpload, {
            title: 'Bulk Upload',
            link: '/pages/assets/bulk-upload',
          }),

          // other items keep your original role logic
          ...show(canSeeAddAsset, {
            title: 'Add Asset',
            link: '/pages/assets/add-asset',
          }),
          ...show(hasRole(roleId, ASSET_LIST_ROLES), {
            title: 'Asset List',
            link: '/pages/assets/asset-list',
          }),
          ...show(hasRole(roleId, PENDING_ASSET_ROLES), {
            title: 'Pending Asset List',
            link: '/pages/assets/pending-asset-list',
          }),
          ...show(hasRole(roleId, ASSET_TRANSFER_ROLES), {
            title: 'Asset Transfer',
            link: '/pages/assets/asset-transfer',
          }),
          ...show(hasRole(roleId, STATUS_CHANGE_ROLES), {
            title: 'Asset Status Change',
            link: '/pages/assets/asset-status-change',
          }),
          ...show(hasRole(roleId, ASSET_HISTORY_ROLES), {
            title: 'Asset History',
            link: '/pages/assets/asset-history',
          }),
          ...show(hasRole(roleId, ASSET_OWNER_CHANGE), {
            title: 'Asset Owner Change',
            link: '/pages/assets/asset-owner-change',
          }),
        ],
      },
    ]),

    // Approve
    ...showMany(hasRole(roleId, COMMON_ROLES), [
      {
        title: 'Approve',
        icon: 'checkmark-square-outline',
        children: [
          ...show(hasRole(roleId, APPROVE_CENTER_TO_CENTER_ROLES), {
            title: 'Center To Center',
            link: '/pages/assets/center-to-center',
          }),
          ...show(centerToHoApprove, {
            title: 'Center To HO',
            link: '/pages/assets/center-to-ho',
          }),
        ],
      },
    ]),

    // Item
    ...showMany(canSeeItem, [
      {
        title: 'Item',
        icon: 'grid-outline',
        children: [
          { title: 'Category List', link: '/pages/item/category-list' },
          { title: 'Item List', link: '/pages/item/item-list' },
        ],
      },
    ]),

    // Scrap
    ...showMany(hasRole(roleId, SCRAP_MENU_ROLES), [
      {
        title: 'Scrap',
        icon: 'car-outline',
        children: [
          ...show(canSeeTransferScrap, {
            title: 'Transfer To Scrap',
            link: '/pages/assets/transfer-to-scrap',
          }),
          ...show(canSeeApproveScrap, {
            title: 'Approve Scrap Request',
            link: '/pages/assets/approve-scrap-request',
          }),
          ...show(canSeeScrapMenu, {
            title: 'Scrap Sell Form',
            link: '/pages/assets/scrap-sale-form',
          }),
           ...show(canSeeScrapMenu, {
            title: 'Scrap Sell Details',
            link: '/pages/assets/scrap-sale-details',
          }),
        ],
      },
    ]),

    // Buyer
    ...showMany(hasRole(roleId, BUYER_MENU_ROLES), [
      {
        title: 'Buyer',
        icon: 'people-outline',
        children: [
          ...show(canSeeAddBuyer, {
            title: 'Add Buyer Form',
            link: '/pages/assets/add-buyer-form',
          }),
          ...show(hasRole(roleId, BUYER_MENU_ROLES), {
            title: 'Buyer List',
            link: '/pages/assets/buyer-list',
          }),
        ],
      },
    ]),

    // Disposal
    // ...showMany(canSeeDisposal, [
    //   {
    //     title: 'Disposal',
    //     icon: 'trash-2-outline',
    //   },
    // ]),

    // Brand
    ...showMany(canSeeBrand, [
      {
        title: 'Brand',
        icon: 'keypad-outline',
        children: [
          { title: 'Brand List', link: '/pages/brand/brand-list' },
        ],
      },
    ]),

    // Reports
    ...showMany(hasRole(roleId, COMMON_ROLES), [
      {
        title: 'Reports',
        icon: 'layout-outline',
        children: [
          ...show(hasRole(roleId, REPORT_ROLES), {
            title: 'Assets Report',
            link: '/pages/report/assets-report',
          }),
          ...show(hasRole(roleId, COMMON_ROLES), {
            title: 'Asset Assigned To Me',
            link: '/pages/report/assign-to-me-report',
          }),
         ...show(hasRole(roleId, REPORT_ROLES), {
            title: 'Assets Transfer Pending',
            link: '/pages/report/transfer-approval-report',
          }),
          ...show(hasRole(roleId, REPORT_ROLES), {
            title: 'Depriciation Assets',
            link: '/pages/report/depriciation-report',
          }),
          ...show(hasRole(roleId, REPORT_ROLES), {
            title: 'Not Working Assets',
            link: '/pages/report/not-working-asset-report',
          }),
          ...show(hasRole(roleId, REPORT_ROLES), {
            title: 'Scrap Approval Pending',
            link: '/pages/report/scrap-approval-pending-report',
          }),
          ...show(hasRole(roleId, REPORT_ROLES), {
            title: 'Scrap Asset',
            link: '/pages/report/scrap-asset-report',
          }),
          // ...show(hasRole(roleId, REPORT_ROLES), {
          //   title: 'Disposed Approval Pending',
          //   link: '/pages/report/assets-report',
          // }),
          // ...show(hasRole(roleId, REPORT_ROLES), {
          //   title: 'Disposed Asset',
          //   link: '/pages/report/assets-report',
          // }),
        ],
      },
    ]),

    {
      title: 'Sales',
      icon: 'people-outline',
      children: [
        {
          title: 'Customers',
          link: '/pages/sales/customer-list',
        },
        {
          title: 'Quotes',
          link: '/pages/assets/buyer-list',
        },
      ],
    },
    {
      title: 'Item',
      icon: 'people-outline',
      children: [
        {
          title: 'Item',
          link: '/pages/sales/item-list',
        }
      ],
    },
    { title: 'Organization Settings', group: true },
    {
      title: 'Organization',
      icon: 'people-outline',
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
    },
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
      icon: 'people-outline',
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
    {
      title: 'Setup & Configurations',
      icon: 'people-outline',
      children: [
        {
          title: 'General',
          link: '/pages/organization-setting/profile',
        }
      ],
    },
    { title: 'Module Settings', group: true },
    { title: 'Admin Settings', group: true },
     // Dashboard
     {
      title: 'Package & Module',
      icon: 'people-outline',
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
      icon: 'people-outline',
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
      icon: 'people-outline',
      children: [
        {
          title: 'Add Custom Field',
          link: '/pages/admin-setting/add-custom-field',
        },
        {
          title: 'Custom Field List',
          link: '/pages/admin-setting/custom-field',
        }
      ],
    },
    
  ];

  return menu;
}
