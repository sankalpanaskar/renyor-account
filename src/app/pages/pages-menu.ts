import { NbMenuItem } from '@nebular/theme';

export function getMenuItems(roleId: any): NbMenuItem[] {
  const menu: NbMenuItem[] = [
    // {
    //   title: 'E-commerce',
    //   icon: 'shopping-cart-outline',
    //   link: '/pages/dashboard',
    //   home: true,
    // },
    // {
    //   title: 'IoT Dashboard',
    //   icon: 'home-outline',
    //   link: '/pages/iot-dashboard',
    // },
    ...(roleId === 34 || roleId === 11 || roleId === 7 || roleId === 15 || roleId === 23 || roleId === 17
      ? [
        {
          title: 'Follow-up Dashboard',
          icon: 'home-outline',
          link: '/pages/custom-dashboard',
        },
      ]
      : []),
    ...(roleId === 34 || roleId === 11 || roleId === 15 || roleId === 17 || roleId === 18 || roleId === 43 || roleId === 45
      ? [
        {
          title: 'Dashboard',
          icon: 'keypad-outline',
          link: '/pages/admin-dashboard',
        },
      ]
      : []),
    ...(roleId === 34 || roleId === 51
      ? [
        {
          title: 'Marcom Dashboard',
          icon: 'layers-outline',
          link: '/pages/marcom/marcom-dashboard',
        },
      ]
      : []),
    {
      title: 'FEATURES',
      group: true,
    },
    ...(roleId === 34 || roleId === 15 || roleId === 7 || roleId === 23
      ? [
        {
          title: 'Lead',
          icon: 'layout-outline',
          children: [
            ...(roleId === 15 || roleId === 23 || roleId === 7 || roleId === 34 ? [{ title: 'Add', link: '/pages/add-lead' }] : []),
            ...(roleId === 15 || roleId === 23 || roleId === 7 || roleId === 34 ? [{ title: 'Bulk Upload', link: '/pages/upload-lead' }] : []),
            { title: 'Manage', link: '/pages/manage-lead' },
          ],
        },
      ]
      : []),

    ...(roleId === 34 || roleId === 15 || roleId === 51
      ? [
        {
          title: 'Marcom',
          icon: 'browser-outline',
          children: [
            ...(roleId === 51 || roleId === 34 ? [{ title: 'Centerwise Bulk Upload', link: '/pages/marcom/center-bulk-lead' }] : []),
            ...(roleId === 51 || roleId === 34 ? [{ title: 'Statewise Bulk Upload', link: '/pages/marcom/state-bulk-lead' }] : []),
            ...(roleId === 15 || roleId === 34 ? [{ title: 'Marcom Leads', link: '/pages/marcom/manage-marcom-lead' }] : []),
          ],
        },
      ]
      : []),

    ...(roleId === 777 || roleId === 34 || roleId === 15 || roleId === 23 || roleId === 34 || roleId === 7 || roleId === 11 || roleId === 17 || roleId === 10 || roleId === 14 || roleId === 18 || roleId === 26 || roleId === 43 || roleId === 37 || roleId === 42 || roleId === 45 || roleId === 44 || roleId === 46
      ? [
        {
          title: 'Students',
          icon: 'person-outline',
          children: [
            ...(roleId === 777 ? [{ title: 'Counseling Details', link: '/pages/student/student-details' }] : []),
            ...(roleId === 777 ? [{ title: 'Student Form', link: '/pages/student/student-form' }] : []),
            ...(roleId === 34 || roleId === 15 || roleId === 23 || roleId === 34 || roleId === 7 || roleId === 11 || roleId === 17 || roleId === 10 || roleId === 14 || roleId === 18 || roleId === 26 || roleId === 43 || roleId === 37 || roleId === 42 || roleId === 45 || roleId === 44 || roleId === 46 ? [{ title: 'Search Student', link: '/pages/lead/student-flow-data' }] : [])
          ],
        },
      ]
      : []),
    ...(roleId === 34 || roleId === 11
      ? [
        {
          title: 'Student Counseling',
          icon: 'edit-2-outline',
          children: [
            // {
            //   title: 'Students List',
            //   link: '/pages/placement-officer/students-list',
            // },
            // {
            //   title: 'Interview Form',
            //   link: '/pages/placement-officer/interview-questions',
            // },
            // {
            //   title: 'Student Answer',
            //   link: '/pages/placement-officer/student-answers',
            // },
            {
              title: 'Manage Counseling',
              link: '/pages/placement-officer/manage-counseling',
            },
            {
              title: 'Rejected Students',
              link: '/pages/placement-officer/rejected-counseling',
            },
          ],
        },
      ]
      : []),

       ...(roleId === 34 || roleId === 15 || roleId === 23 || roleId === 34 || roleId === 7 || roleId === 11 || roleId === 17 || roleId === 10 || roleId === 14 || roleId === 18 || roleId === 26 || roleId === 43 || roleId === 37 || roleId === 42 || roleId === 45 || roleId === 44 || roleId === 46
      ? [
        {
          title: 'My Reports',
          icon: 'clipboard-outline',
          link: '/pages/report/lead-crm-report',
        },
      ]
      : []),

    // {
    //   title: 'Layout',
    //   icon: 'layout-outline',
    //   children: [
    //     { title: 'Stepper', link: '/pages/layout/stepper' },
    //     { title: 'List', link: '/pages/layout/list' },
    //     { title: 'Infinite List', link: '/pages/layout/infinite-list' },
    //     { title: 'Accordion', link: '/pages/layout/accordion' },
    //     { title: 'Tabs', pathMatch: 'prefix', link: '/pages/layout/tabs' },
    //   ],
    // },
    // {
    //   title: 'Forms',
    //   icon: 'edit-2-outline',
    //   children: [
    //     { title: 'Form Inputs', link: '/pages/forms/inputs' },
    //     { title: 'Form Layouts', link: '/pages/forms/layouts' },
    //     { title: 'Buttons', link: '/pages/forms/buttons' },
    //     { title: 'Datepicker', link: '/pages/forms/datepicker' },
    //   ],
    // },
    // {
    //   title: 'UI Features',
    //   icon: 'keypad-outline',
    //   link: '/pages/ui-features',
    //   children: [
    //     { title: 'Grid', link: '/pages/ui-features/grid' },
    //     { title: 'Icons', link: '/pages/ui-features/icons' },
    //     { title: 'Typography', link: '/pages/ui-features/typography' },
    //     { title: 'Animated Searches', link: '/pages/ui-features/search-fields' },
    //   ],
    // },
    // {
    //   title: 'Modal & Overlays',
    //   icon: 'browser-outline',
    //   children: [
    //     { title: 'Dialog', link: '/pages/modal-overlays/dialog' },
    //     { title: 'Window', link: '/pages/modal-overlays/window' },
    //     { title: 'Popover', link: '/pages/modal-overlays/popover' },
    //     { title: 'Toastr', link: '/pages/modal-overlays/toastr' },
    //     { title: 'Tooltip', link: '/pages/modal-overlays/tooltip' },
    //   ],
    // },
    // {
    //   title: 'Extra Components',
    //   icon: 'message-circle-outline',
    //   children: [
    //     { title: 'Calendar', link: '/pages/extra-components/calendar' },
    //     { title: 'Progress Bar', link: '/pages/extra-components/progress-bar' },
    //     { title: 'Spinner', link: '/pages/extra-components/spinner' },
    //     { title: 'Alert', link: '/pages/extra-components/alert' },
    //     { title: 'Calendar Kit', link: '/pages/extra-components/calendar-kit' },
    //     { title: 'Chat', link: '/pages/extra-components/chat' },
    //   ],
    // },
    // {
    //   title: 'Maps',
    //   icon: 'map-outline',
    //   children: [
    //     { title: 'Google Maps', link: '/pages/maps/gmaps' },
    //     { title: 'Leaflet Maps', link: '/pages/maps/leaflet' },
    //     { title: 'Bubble Maps', link: '/pages/maps/bubble' },
    //     { title: 'Search Maps', link: '/pages/maps/searchmap' },
    //   ],
    // },
    // {
    //   title: 'Charts',
    //   icon: 'pie-chart-outline',
    //   children: [
    //     { title: 'Echarts', link: '/pages/charts/echarts' },
    //     { title: 'Charts.js', link: '/pages/charts/chartjs' },
    //     { title: 'D3', link: '/pages/charts/d3' },
    //   ],
    // },
    // {
    //   title: 'Editors',
    //   icon: 'text-outline',
    //   children: [
    //     { title: 'TinyMCE', link: '/pages/editors/tinymce' },
    //     { title: 'CKEditor', link: '/pages/editors/ckeditor' },
    //   ],
    // },
    // {
    //   title: 'Tables & Data',
    //   icon: 'grid-outline',
    //   children: [
    //     { title: 'Smart Table', link: '/pages/tables/smart-table' },
    //     { title: 'Tree Grid', link: '/pages/tables/tree-grid' },
    //   ],
    // },
    // {
    //   title: 'Miscellaneous',
    //   icon: 'shuffle-2-outline',
    //   children: [{ title: '404', link: '/pages/miscellaneous/404' }],
    // },
    // {
    //   title: 'Auth',
    //   icon: 'lock-outline',
    //   children: [
    //     { title: 'Login', link: '/auth/login' },
    //     { title: 'Register', link: '/auth/register' },
    //     { title: 'Request Password', link: '/auth/request-password' },
    //     { title: 'Reset Password', link: '/auth/reset-password' },
    //   ],
    // },
  ];

  return menu;
}
