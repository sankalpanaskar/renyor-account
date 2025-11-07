import { NbMenuItem } from '@nebular/theme';

/** ---------- Role Sets (edit in one place) ---------- */
const DASHBOARD_ROLES = new Set([
  7,10,11,15,17,18,23,24,26,27,28,29,30,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,
]);

// These big “common” sets look identical in your code;
// keep one source of truth and reuse it.
const COMMON_ROLES = DASHBOARD_ROLES;
  
//Asset Menu

// Feature-specific role sets
const BULK_UPLOAD_ROLES = new Set([34, 39, 35]);
const ADD_ASSET_ROLES   = BULK_UPLOAD_ROLES;
const ASSET_LIST_ROLES =  new Set([35,39,14]);
const PENDING_ASSET_ROLES = new Set([35,39,14]);
const ASSET_TRANSFER_ROLES = new Set([35,39,14]);
const STATUS_CHANGE_ROLES = BULK_UPLOAD_ROLES;
const ASSET_HISTORY_ROLES = new Set([35,39,14]);
const ASSET_OWNER_CHANGE = BULK_UPLOAD_ROLES;
const TRANSFER_TO_SCRAP_ROLES = BULK_UPLOAD_ROLES;
const APPROVE_SCRAP_REQUEST_ROLES = new Set([14, 18]);

//Approve Menu

const APPROVE_CENTER_TO_CENTER_ROLES = COMMON_ROLES;
const APPROVE_CENTER_TO_HO_ROLES = COMMON_ROLES;

//Brand Menu
const ADD_BRAND_ROLES = BULK_UPLOAD_ROLES;

/** ---------- Small Helpers ---------- */
const has = (roleId: number, allowed: ReadonlySet<number>) => allowed.has(roleId);

// Conditionally include a single menu item
const show = (condition: boolean, item: NbMenuItem): NbMenuItem[] => (condition ? [item] : []);

// Conditionally include a list (children)
const showMany = (condition: boolean, items: NbMenuItem[]): NbMenuItem[] => (condition ? items : []);

/** ---------- Menu Factory ---------- */
export function getMenuItems(roleId: number): NbMenuItem[] {
  const menu: NbMenuItem[] = [
    // Dashboard
    ...show(has(roleId, DASHBOARD_ROLES), {
      title: 'Dashboard',
      icon: 'home-outline',
      link: '/pages/custom-dashboard',
    }),

    { title: 'FEATURES', group: true },

    // Assets
    ...showMany(has(roleId, COMMON_ROLES), [
      {
        title: 'Assets',
        icon: 'layout-outline',
        children: [
          ...show(has(roleId, BULK_UPLOAD_ROLES), {
            title: 'Bulk Upload',
            link: '/pages/assets/bulk-upload',
          }),
          ...show(has(roleId, ADD_ASSET_ROLES), {
            title: 'Add Asset',
            link: '/pages/assets/add-asset',
          }),
          ...show(has(roleId, ASSET_LIST_ROLES), {
            title: 'Asset List',
            link: '/pages/assets/asset-list',
          }),
          ...show(has(roleId, PENDING_ASSET_ROLES), {
            title: 'Pending Asset List',
            link: '/pages/assets/pending-asset-list',
          }),
          ...show(has(roleId, ASSET_TRANSFER_ROLES), {
            title: 'Asset Transfer',
            link: '/pages/assets/asset-transfer',
          }),
          ...show(has(roleId, STATUS_CHANGE_ROLES), {
            title: 'Asset Status Change',
            link: '/pages/assets/asset-status-change',
          }),
          ...show(has(roleId, ASSET_HISTORY_ROLES), {
            title: 'Asset History',
            link: '/pages/assets/asset-history',
          }),
          ...show(has(roleId, ASSET_OWNER_CHANGE), {
            title: 'Asset Owner Change',
            link: '/pages/assets/asset-owner-change',
          }),
          ...show(has(roleId, TRANSFER_TO_SCRAP_ROLES), {
            title: 'Transfer To Scrap',
            link: '/pages/assets/transfer-to-scrap',
          }),
          ...show(has(roleId, APPROVE_SCRAP_REQUEST_ROLES), {
            title: 'Approve Scrap Request',
            link: '/pages/assets/approve-scrap-request',
          }),
        ],
      },
    ]),

    // Approve
    ...showMany(has(roleId, COMMON_ROLES), [
      {
        title: 'Approve',
        icon: 'checkmark-square-outline',
        children: [
          ...show(has(roleId, APPROVE_CENTER_TO_CENTER_ROLES), {
            title: 'Center To Center',
            link: '/pages/assets/center-to-center',
          }),
          ...show(has(roleId, APPROVE_CENTER_TO_HO_ROLES), {
            title: 'Center To HO',
            link: '/pages/assets/center-to-ho',
          }),
        ],
      },
    ]),

    // Brand
    ...showMany(has(roleId, COMMON_ROLES), [
      {
        title: 'Brand',
        icon: 'keypad-outline',
        children: [
          ...show(has(roleId, ADD_BRAND_ROLES), {
            title: 'Add Brand',
            link: '/pages/brand/add-brand',
          }),
        ],
      },
    ]),
  ];

  return menu;
}
