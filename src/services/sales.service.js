// services/menu.service.js
const db = require('../config/db');
const handleCustomFields= require('../utils/custom_field');
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





exports.createCustomer = async (
  data,
  tenant_id,
  user_id,
  uploaded_file_name_1 = null,
  uploaded_file_name_2 = null
) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

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
      source_of_supply,
      pan,
      tax_preference,
      payment_terms,
      department,
      designation,
      exemption_reason,
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

    const [result] = await connection.query(
      `INSERT INTO customers (
        tenant_id,
        user_id,
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
        source_of_supply,
        pan,
        tax_preference,
        payment_terms,
        department,
        designation,
        document_1_name,
        document_2_name,
        exemption_reason,
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
        shipping_pin
      ) VALUES (?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tenant_id,
        user_id,
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
        source_of_supply,
        pan,
        tax_preference,
        payment_terms,
        department,
        designation,
        uploaded_file_name_1 || null,
        uploaded_file_name_2 || null,
        exemption_reason,
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
        shipping_pin
      ]
    );

    // let customFieldObj = {};

    // if (custom_field) {
    //   try {
    //     customFieldObj =
    //       typeof custom_field === "string"
    //         ? JSON.parse(custom_field)
    //         : custom_field;
    //   } catch (err) {
    //     throw new Error("Invalid custom_field JSON");
    //   }
    // }

    // if (Object.keys(customFieldObj).length > 0) {
    //   if (!module_id) {
    //     throw new Error("module_id is required when custom_field is provided");
    //   }

    //   for (const key of Object.keys(customFieldObj)) {
    //     const [fieldRows] = await connection.query(
    //       `SELECT id FROM custom_fields WHERE field_name = ? AND module_id = ?`,
    //       [key, module_id]
    //     );

    //     if (fieldRows.length > 0) {
    //       const fieldId = fieldRows[0].id;
    //       const value = customFieldObj[key];

    //       await connection.query(
    //         `INSERT INTO custom_field_values
    //          (module_id, tenant_id, record_id, field_id, field_value)
    //          VALUES (?, ?, ?, ?, ?)`,
    //         [module_id, tenant_id, result.insertId, fieldId, value]
    //       );
    //     }
    //   }
    // }

    if (custom_field) {
      await handleCustomFields({
        connection,
        custom_field,
        module_id,
        tenant_id,
        record_id: result.insertId,
      });
    }

    const [rows] = await connection.query(
      `SELECT * FROM customers WHERE id = ? AND tenant_id = ?`,
      [result.insertId, tenant_id]
    );

    await connection.commit();

    return rows[0];
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};


exports.createVendor = async (
  data,
  tenant_id,
  user_id,
  uploaded_file_name_1 = null,
  uploaded_file_name_2 = null
) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    let {
      module_id,
      primary_contact_f_name,
      primary_contact_l_name,
      company_name,
      display_name,
      email,
      work_phone,
      mobile_no,
      group,
      gst_treatment,
      source_of_supply,
      pan,
      opening_balance,
      payment_terms,
      tds,
      website,
      department,
      designation,
      document_1_name,
      document_2_name,
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
      msme_registration_type,
      msme_registration_number,
      bank_accounts = [],
      custom_field
    } = data;

    if (!module_id) {
      throw new Error("module_id is required");
    }

    if (typeof bank_accounts === "string") {
      bank_accounts = JSON.parse(bank_accounts);
    }

    if (typeof custom_field === "string") {
      custom_field = JSON.parse(custom_field);
    }

    if (!Array.isArray(bank_accounts)) {
      bank_accounts = [];
    }

    const gst_no = custom_field?.gst_no || null;

    const [result] = await connection.query(
      `INSERT INTO vendor_master (
        tenant_id,
        user_id,
        primary_contact_f_name,
        primary_contact_l_name,
        company_name,
        display_name,
        email,
        work_phone,
        mobile_no,
        group_name,
        gst_treatment,
        source_of_supply,
        pan,
        opening_balance,
        payment_terms,
        tds,
        website,
        department,
        designation,
        document_1_name,
        document_2_name,
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
        msme_registration_type,
        msme_registration_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tenant_id,
        user_id,
        primary_contact_f_name || null,
        primary_contact_l_name || null,
        company_name || null,
        display_name || null,
        email || null,
        work_phone || null,
        mobile_no || null,
        group || null,
        gst_treatment || null,
        source_of_supply || null,
        pan || null,
        opening_balance || 0,
        payment_terms || null,
        tds || null,
        website || null,
        department || null,
        designation || null,
        document_1_name || null,
        document_2_name || null,
        billing_address || null,
        billing_country || null,
        billing_city || null,
        billing_state || null,
        billing_pin || null,
        shipping_address || null,
        shipping_country || null,
        shipping_city || null,
        shipping_state || null,
        shipping_pin || null,
        msme_registration_type || null,
        msme_registration_number || null,
      ]
    );

    const vendor_master_id = result.insertId;

    if (bank_accounts.length > 0) {
      for (const bank of bank_accounts) {
        if (
          bank.account_number &&
          bank.re_enter_account_number &&
          bank.account_number !== bank.re_enter_account_number
        ) {
          throw new Error("Bank account number mismatch");
        }
      }

      const bankValues = bank_accounts.map((bank) => [
        vendor_master_id,
        bank.account_holder_name || null,
        bank.bank_name || null,
        bank.account_number || null,
        bank.re_enter_account_number || null,
        bank.ifsc || null
      ]);

      await connection.query(
        `INSERT INTO vendor_bank_accounts (
          vendor_master_id,
          account_holder_name,
          bank_name,
          account_number,
          re_enter_account_number,
          ifsc
        ) VALUES ?`,
        [bankValues]
      );
    }

    if (custom_field) {
      await handleCustomFields({
        connection,
        custom_field,
        module_id,
        tenant_id,
        record_id: vendor_master_id
      });
    }

    const [vendorRows] = await connection.query(
      `SELECT * FROM vendor_master WHERE id = ? AND tenant_id = ?`,
      [vendor_master_id, tenant_id]
    );

    const [bankRows] = await connection.query(
      `SELECT * FROM vendor_bank_accounts WHERE vendor_master_id = ?`,
      [vendor_master_id]
    );

    await connection.commit();

    return {
      ...vendorRows[0],
      bank_accounts: bankRows,
      uploaded_file_name_1,
      uploaded_file_name_2
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};




exports.getchartofaccountsHeadType = async (req, res) => {
  try {

    const [rows] = await db.query(`
    SELECT id, group_name, parent_id, status
    FROM chartofaccounts_head_type
    WHERE status = 1
    ORDER BY id
  `);
    //const groups = await exports.fetchGroups();
    //const tree = buildTree(rows, null); // root = NULL

    return rows

  } catch (error) {
    
  }
};

exports.fetchTds = async (req, res) => {
  try {

    const [rows] = await db.query(`
    SELECT *
    FROM tds
    WHERE status = 1
    ORDER BY id
  `);
    //const groups = await exports.fetchGroups();
    //const tree = buildTree(rows, null); // root = NULL

    return rows

  } catch (error) {
    
  }
};


exports.fetchPaymentTerms = async (tenant_id) => {
 
    const [rows] = await db.query(
      "SELECT * FROM payment_terms WHERE tenant_id = ? ORDER BY id DESC",
      [tenant_id]
    );

   

    return rows;
  
};




exports.createchartofaccounts = async (data, tenant_id, user_id) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const {
      account_name,
      account_item,
      chartofaccounts_head_type_id,
      custom_field,
      module_id,
    } = data;

    // Check if account_name already exists for this tenant
    const [existingRows] = await connection.query(
      `SELECT id
       FROM chartofaccounts_name
       WHERE account_name = ? AND tenant_id = ?
       LIMIT 1`,
      [account_name, tenant_id]
    );

    let recordId;

    if (existingRows.length > 0) {
      // If exists, update account_item
      recordId = existingRows[0].id;

      await connection.query(
        `UPDATE chartofaccounts_name
         SET account_item = ?
         WHERE id = ?`,
        [account_item, recordId]
      );
    } else {
      // If not exists, insert new row
      const [result] = await connection.query(
        `INSERT INTO chartofaccounts_name (
          account_name,
          account_item,
          chartofaccounts_head_type_id,
          tenant_id,
          user_id
        ) VALUES (?, ?, ?, ?, ?)`,
        [
          account_name,
          account_item,
          chartofaccounts_head_type_id,
          tenant_id,
          user_id,
        ]
      );

      recordId = result.insertId;
    }

    // Handle custom fields
    if (custom_field && module_id) {
      for (const key in custom_field) {
        const [field] = await connection.query(
          `SELECT id
           FROM custom_fields
           WHERE field_name = ? AND module_id = ?`,
          [key, module_id]
        );

        if (field.length) {
          const fieldId = field[0].id;
          const value = custom_field[key];

          await connection.query(
            `DELETE FROM custom_field_values
             WHERE module_id = ? AND tenant_id = ? AND record_id = ? AND field_id = ?`,
            [module_id, tenant_id, recordId, fieldId]
          );

          await connection.query(
            `INSERT INTO custom_field_values
             (module_id, tenant_id, record_id, field_id, field_value)
             VALUES (?, ?, ?, ?, ?)`,
            [module_id, tenant_id, recordId, fieldId, value]
          );
        }
      }
    }

    const [rows] = await connection.query(
      `SELECT * FROM chartofaccounts_name WHERE id = ?`,
      [recordId]
    );

    await connection.commit();
    return rows[0];
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};







        








