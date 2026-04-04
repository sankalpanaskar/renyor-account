// services/menu.service.js
const db = require('../config/db');

// exports.fetchMenu = async (packageId, roleId = null) => {
//   let rows;

//   // 🔵 CASE 1: Package-only (Company Super Admin)
//   if (!roleId) {
//     [rows] = await db.query(
//       `
//       SELECT DISTINCT
//         m.id,
//         m.menu_name,
//         m.parent_id,
//         m.menu_pic,
//         m.link
//       FROM package_modules p
//       INNER JOIN menu_modules m
//         ON m.id = p.menu_id
//       WHERE p.package_id = ?
//         AND p.status = 1
//         AND m.status = 1
//       ORDER BY m.parent_id, m.id
//       `,
//       [packageId]
//     );
//   }

//   // 🔵 CASE 2: Package + Role (Company User)
//   else {
//     const sql = `
//           SELECT DISTINCT
//             m.id,
//             m.menu_name,
//             m.parent_id,
//             m.menu_pic,
//             m.link
//           FROM package_modules p
//           INNER JOIN menu_modules m
//             ON m.id = p.menu_id
//           INNER JOIN role_menu_access rma
//             ON rma.menu_id = m.id
//           WHERE p.package_id = 20
//             AND p.status = 1
//             AND m.status = 1
//             AND rma.role_id = 6
//             AND rma.can_view = 1
//           ORDER BY m.parent_id, m.id
//         `;

//         const [rows] = await db.query(sql);
//         console.log(rows);
//   }

//   // 🌳 Build menu tree
//   const map = {};
//   const menu = [];

//   rows.forEach(row => {
//     map[row.id] = {
//       id: row.id,
//       title: row.menu_name,
//       parent_id: row.parent_id,
//       icon: row.menu_pic,
//       link: row.link,
//       children: []
//     };
//   });

//   rows.forEach(row => {
//     if (row.parent_id === 0) {
//       menu.push(map[row.id]);
//     } else if (map[row.parent_id]) {
//       map[row.parent_id].children.push(map[row.id]);
//     }
//   });

//   return menu;
// };

exports.fetchAllCustomers = async (tenant_id, module_id) => {
  const [customers] = await db.query(
    "SELECT * FROM customers WHERE tenant_id = ? ORDER BY id DESC",
    [tenant_id]
  );

  if (!customers.length) {
    return [];
  }

  const customerIds = customers.map((c) => c.id);

  const [customRows] = await db.query(
    `SELECT 
        cfv.record_id,
        cf.field_name,
        cfv.field_value
     FROM custom_field_values cfv
     INNER JOIN custom_fields cf 
       ON cf.id = cfv.field_id
     WHERE cfv.module_id = ?
     AND cfv.tenant_id = ?
       AND cfv.record_id IN (?)`,
    [module_id, tenant_id, customerIds]
  );
  console.log(customRows,module_id, customerIds);

  const customFieldMap = {};

  for (const row of customRows) {
    if (!customFieldMap[row.record_id]) {
      customFieldMap[row.record_id] = {};
    }
    customFieldMap[row.record_id][row.field_name] = row.field_value;
  }

  return customers.map((customer) => ({
    ...customer,
    custom_field: customFieldMap[customer.id] || {}
  }));
};

exports.createCustomer = async (data, tenant_id,userId) => {
  const {
    customer_type,
    primary_contact_f_name,
    primary_contact_l_name,
    company_name,
    display_name,
    email,
    work_phone,
    mobile_no,
    website,
    group,
    gst_treatment,
    opening_balance,
    billing_address,
    billing_country,
    billing_city,
    billing_state,
    billing_pin,
    shipping_address,
    shipping_country,
    shipping_city,
    shipping_state,
    shipping_pin,
    custom_field,
    module_id
  } = data;

  const [result] = await db.query(
    `INSERT INTO customers (
      tenant_id,
      customer_type,
      primary_contact_f_name,
      primary_contact_l_name,
      company_name,
      display_name,
      email,
      work_phone,
      mobile_no,
      website,
      customer_group,
      gst_treatment,
      opening_balance,
      billing_address,
      billing_country,
      billing_city,
      billing_state,
      billing_pin,
      shipping_address,
      shipping_country,
      shipping_city,
      shipping_state,
      shipping_pin,
      gst_no
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

    [
      tenant_id,
      customer_type,
      primary_contact_f_name,
      primary_contact_l_name,
      company_name,
      display_name,
      email,
      work_phone,
      mobile_no,
      website,
      group,
      gst_treatment,
      opening_balance,
      billing_address,
      billing_country,
      billing_city,
      billing_state,
      billing_pin,
      shipping_address,
      shipping_country,
      shipping_city,
      shipping_state,
      shipping_pin,
      custom_field?.gst_no
    ]
  );
   console.log(result);
  const [rows] = await db.query(
    'SELECT * FROM customers WHERE id = ?',
    [result.insertId]
  );

  if (custom_field) {

      for (const key in custom_field) {

        // Get field id
        const [field] = await db.query(
          "SELECT id FROM custom_fields WHERE field_name=? AND module_id=?",
          [key, module_id]
        );
        console.log(field,key, module_id);

        if(field.length){

          const fieldId = field[0].id;
          const value = custom_field[key];

          await db.query(
            `INSERT INTO custom_field_values 
            (module_id,tenant_id,record_id,field_id,field_value) 
            VALUES (?,?,?,?,?)`,
            [module_id, tenant_id, result.insertId, fieldId, value]
          );

        }

      }

  }

  return rows[0];
};





