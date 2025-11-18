import { NbMenuItem } from '@nebular/theme';

/** ---------- Role Sets ---------- */
const DASHBOARD_ROLES = new Set([
  7,10,11,14,15,17,18,23,24,26,27,28,29,30,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,
]);
const COMMON_ROLES = DASHBOARD_ROLES;

// Assets
const BULK_UPLOAD_ROLES           = new Set([34, 39, 35]);
const ADD_ASSET_ROLES             = BULK_UPLOAD_ROLES;
const ASSET_LIST_ROLES            = new Set([35, 39, 14]);
const PENDING_ASSET_ROLES         = new Set([35, 39, 14]);
const ASSET_TRANSFER_ROLES        = new Set([35, 39, 14]);
const STATUS_CHANGE_ROLES         = BULK_UPLOAD_ROLES;
const ASSET_HISTORY_ROLES         = new Set([35, 39, 14]);
const ASSET_OWNER_CHANGE          = BULK_UPLOAD_ROLES;
const TRANSFER_TO_SCRAP_ROLES     = BULK_UPLOAD_ROLES;
const APPROVE_SCRAP_REQUEST_ROLES = new Set([39, 18,14]);

// Approve
const APPROVE_CENTER_TO_CENTER_ROLES = COMMON_ROLES;
const APPROVE_CENTER_TO_HO_ROLES     = COMMON_ROLES;

/** ---------- Allow-lists by user code ---------- */
const APPROVE_SCRAP_USERS = new Set(['ANP-0011', 'ANP-0049','ADI-0001']);
const BRAND_MENU_USERS    = new Set(['ANP-0011', 'ANP-0049']);   // ✅ only these can see “Brand”

/** ---------- Helpers ---------- */
const hasRole = (roleId: number, allowed: ReadonlySet<number>) => allowed.has(roleId);
const hasUser = (userCode?: string, allowed?: ReadonlySet<string>) =>
  !!userCode && !!allowed && allowed.has(userCode.toUpperCase());

const show     = (cond: boolean, item: NbMenuItem): NbMenuItem[]   => (cond ? [item] : []);
const showMany = (cond: boolean, items: NbMenuItem[]): NbMenuItem[] => (cond ? items : []);

/** ---------- Menu Factory ---------- */
// Be sure PagesComponent calls getMenuItems(roleId, userCode)
export function getMenuItems(roleId: number, userCode?: string): NbMenuItem[] {
  const canSeeApproveScrap = hasRole(roleId, APPROVE_SCRAP_REQUEST_ROLES) && hasUser(userCode, APPROVE_SCRAP_USERS);
  const canSeeBrand        = hasUser(userCode, BRAND_MENU_USERS); // ✅ user-code gate

  const menu: NbMenuItem[] = [
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
          ...show(hasRole(roleId, BULK_UPLOAD_ROLES),           { title: 'Bulk Upload',            link: '/pages/assets/bulk-upload' }),
          ...show(hasRole(roleId, ADD_ASSET_ROLES),             { title: 'Add Asset',              link: '/pages/assets/add-asset' }),
          ...show(hasRole(roleId, ASSET_LIST_ROLES),            { title: 'Asset List',             link: '/pages/assets/asset-list' }),
          ...show(hasRole(roleId, PENDING_ASSET_ROLES),         { title: 'Pending Asset List',     link: '/pages/assets/pending-asset-list' }),
          ...show(hasRole(roleId, ASSET_TRANSFER_ROLES),        { title: 'Asset Transfer',         link: '/pages/assets/asset-transfer' }),
          ...show(hasRole(roleId, STATUS_CHANGE_ROLES),         { title: 'Asset Status Change',    link: '/pages/assets/asset-status-change' }),
          ...show(hasRole(roleId, ASSET_HISTORY_ROLES),         { title: 'Asset History',          link: '/pages/assets/asset-history' }),
          ...show(hasRole(roleId, ASSET_OWNER_CHANGE),          { title: 'Asset Owner Change',     link: '/pages/assets/asset-owner-change' }),
          ...show(hasRole(roleId, TRANSFER_TO_SCRAP_ROLES),     { title: 'Transfer To Scrap',      link: '/pages/assets/transfer-to-scrap' }),
          ...show(canSeeApproveScrap,                            { title: 'Approve Scrap Request',  link: '/pages/assets/approve-scrap-request' }),
          ...show(canSeeApproveScrap,                            { title: 'Add Buyer Form',  link: '/pages/assets/add-buyer-form' }),
        ],
      },
    ]),

    // Approve
    ...showMany(hasRole(roleId, COMMON_ROLES), [
      {
        title: 'Approve',
        icon: 'checkmark-square-outline',
        children: [
          ...show(hasRole(roleId, APPROVE_CENTER_TO_CENTER_ROLES), { title: 'Center To Center', link: '/pages/assets/center-to-center' }),
          ...show(hasRole(roleId, APPROVE_CENTER_TO_HO_ROLES),     { title: 'Center To HO',     link: '/pages/assets/center-to-ho' }),
        ],
      },
    ]),

    // Brand — ✅ only when userCode is ANP-0011 / ANP-0049
    ...showMany(canSeeBrand, [
      {
        title: 'Brand',
        icon: 'keypad-outline',
        children: [
          { title: 'Add Brand', link: '/pages/brand/add-brand' },
        ],
      },
    ]),

    ...showMany(hasRole(roleId, COMMON_ROLES), [
      {
        title: 'Reports',
        icon: 'layout-outline',
        children: [
          ...show(hasRole(roleId, BULK_UPLOAD_ROLES),           { title: 'Assets Report',               link: '/pages/report/assets-report' }),
          ...show(hasRole(roleId, ADD_ASSET_ROLES),             { title: 'Asset Assigned To Me',        link: '/pages/report/assets-report' }),
          ...show(hasRole(roleId, ASSET_LIST_ROLES),            { title: 'Depriciation Assets',         link: '/pages/report/assets-report' }),
          ...show(hasRole(roleId, PENDING_ASSET_ROLES),         { title: 'Not Working Assets',          link: '/pages/report/assets-report' }),
          ...show(hasRole(roleId, ASSET_TRANSFER_ROLES),        { title: 'Scrap Approval Pending',      link: '/pages/report/assets-report' }),
          ...show(hasRole(roleId, STATUS_CHANGE_ROLES),         { title: 'Scrap Asset',                 link: '/pages/report/assets-report' }),
          ...show(hasRole(roleId, ASSET_HISTORY_ROLES),         { title: 'Disposed Approval Pending',   link: '/pages/report/assets-report' }),
          ...show(hasRole(roleId, ASSET_OWNER_CHANGE),          { title: 'Disposed Asset',              link: '/pages/report/assets-report' })
        ],
      },
    ]),
  ];

  return menu;
}
