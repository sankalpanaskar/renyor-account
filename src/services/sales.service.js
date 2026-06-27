// services/menu.service.js
const db = require('../config/db');
const handleCustomFields= require('../utils/custom_field');

const formatDateForDb = (dateValue) => {
  if (!dateValue) {
    return null;
  }

  const value = String(dateValue).trim();

  if (!value) {
    return null;
  }

  const isoMatch = value.match(/^\d{4}-\d{2}-\d{2}$/);
  if (isoMatch) {
    return value;
  }

  const dmyMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmyMatch) {
    const [, day, month, year] = dmyMatch;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  return value;
};
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

exports.fetchVendors = async (tenant_id, module_id) => {
  const [vendors] = await db.query(
    "SELECT * FROM vendor_master WHERE tenant_id = ? ORDER BY id DESC",
    [tenant_id]
  );

  if (!vendors.length) {
    return [];
  }

  const vendorIds = vendors.map((v) => v.id);

  const [vendorRows] = await db.query(
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
    [module_id, tenant_id, vendorIds]
  );
  console.log(vendorRows,module_id, vendorIds);

  const customFieldMap = {};

  for (const row of vendorRows) {
    if (!customFieldMap[row.record_id]) {
      customFieldMap[row.record_id] = {};
    }
    customFieldMap[row.record_id][row.field_name] = row.field_value;
  }

  return vendors.map((vendor) => ({
    ...vendor,
    custom_field: customFieldMap[vendor.id] || {}
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
      dob,
      doi,
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
        dob,
        doi,
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
      ) VALUES (?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        formatDateForDb(dob),
        formatDateForDb(doi),
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

exports.createItem = async (
  data,
  tenant_id,
  user_id,
  item_image = null
) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const {
      type,
      unit,
      hsn_code,
      sac,
      tax_preference,
      gst_rates_id,
      tax_rate_id,
      selling_price,
      sales_account_id,
      chartofaccounts_name_id_sales,
      sales_account_description,
      cost_price,
      purchase_account_id,
      chartofaccounts_name_id_purchase,
      purchase_account_description,
      prefered_vendor_id,
      vendor_master_id,
      name,
      enable_sales_information,
      enable_purchase_information,
      item_image,
      custom_field,
      module_id
    } = data || {};

    const normalizedData = {
      type: type ?? null,
      unit: unit ?? null,
      hsn_code: hsn_code ?? null,
      sac: sac ?? null,
      tax_preference: tax_preference ?? null,
      tax_rate_id: gst_rates_id ?? tax_rate_id ?? null,
      selling_price: selling_price ?? 0,
      chartofaccounts_name_id_sales: sales_account_id ?? chartofaccounts_name_id_sales ?? null,
      sales_account_description: sales_account_description ?? null,
      cost_price: cost_price ?? 0,
      chartofaccounts_name_id_purchase: purchase_account_id ?? chartofaccounts_name_id_purchase ?? null,
      purchase_account_description: purchase_account_description ?? null,
      vendor_master_id: prefered_vendor_id ?? vendor_master_id ?? null,
      name: name ?? null,
      enable_sales_information: enable_sales_information ? 1 : 0,
      enable_purchase_information: enable_purchase_information ? 1 : 0,
      item_image: item_image ?? item_image ?? null,
      tenant_id,
      user_id,
      custom_field
    };

    if (!normalizedData.name) {
      throw new Error('name is required');
    }

    const columns = [
      'type',
      'unit',
      'hsn_code',
      'sac',
      'tax_preference',
      'tax_rate_id',
      'selling_price',
      'chartofaccounts_name_id_sales',
      'sales_account_description',
      'cost_price',
      'chartofaccounts_name_id_purchase',
      'purchase_account_description',
      'vendor_master_id',
      'name',
      'enable_sales_information',
      'enable_purchase_information',
      'item_image',
      'tenant_id',
      'user_id'
    ];

    const values = columns.map((column) => normalizedData[column]);

    const [result] = await connection.query(
      `INSERT INTO items (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
      values
    );

    const recordId = result.insertId;

    const customFieldValues =
      typeof custom_field === 'string' ? JSON.parse(custom_field) : custom_field;

    if (customFieldValues) {
      await handleCustomFields({
        connection,
        custom_field: customFieldValues,
        module_id,
        tenant_id,
        record_id: recordId
      });
    }

    const [rows] = await connection.query(
      `SELECT * FROM items WHERE id = ? AND tenant_id = ?`,
      [recordId, tenant_id]
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

exports.fetchItems = async (tenant_id, item_id = null, module_id) => {
  const conditions = ['i.tenant_id = ?'];
  const params = [tenant_id];

  if (item_id) {
    conditions.push('i.id = ?');
    params.push(item_id);
  }

  const [items] = await db.query(
    `SELECT
        i.*,
        tr.tax_rate_name,
        tr.tax_rate_percentage,
        coa.account_name AS sales_chartofaccounts_name,
        coa.account_item AS sales_chartofaccounts_item,
        cop.account_name AS purchase_chartofaccounts_name,
        cop.account_item AS purchase_chartofaccounts_item
      FROM items i
      LEFT JOIN tax_rate tr
        ON tr.id = i.tax_rate_id
      LEFT JOIN chartofaccounts_name coa
        ON coa.id = i.chartofaccounts_name_id_sales
      LEFT JOIN chartofaccounts_name cop
        ON cop.id = i.chartofaccounts_name_id_purchase
      WHERE ${conditions.join(' AND ')}
      ORDER BY i.id DESC`,
    params
  );

  if (!items.length) {
    return [];
  }

  if (!module_id) {
    return items;
  }

  const itemIds = items.map((item) => item.id);

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
    [module_id, tenant_id, itemIds]
  );

  const customFieldMap = {};

  for (const row of customRows) {
    if (!customFieldMap[row.record_id]) {
      customFieldMap[row.record_id] = {};
    }
    customFieldMap[row.record_id][row.field_name] = row.field_value;
  }

  return items.map((item) => ({
    ...item,
    custom_field: customFieldMap[item.id] || {}
  }));
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

exports.createTds = async (data, tenant_id, user_id) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { name, tds_percentage } = data;

    if (!name) {
      throw new Error('name is required');
    }

    if (tds_percentage === undefined || tds_percentage === null) {
      throw new Error('tds_percentage is required');
    }

    const [result] = await connection.query(
      `INSERT INTO tds (tds_name, tds_percentage, tenant_id, user_id)
       VALUES (?, ?, ?, ?)`,
      [name, tds_percentage, tenant_id, user_id]
    );

    const [rows] = await connection.query(
      `SELECT * FROM tds WHERE id = ?`,
      [result.insertId]
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

exports.createPaymentTerm = async (data, tenant_id, user_id) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { name, no_of_days } = data;

    

    if (name === undefined || name === null) {
      throw new Error('term_name is required');
    }

    if (no_of_days === undefined || no_of_days === null) {
      throw new Error('no_of_days is required');
    }

    const [result] = await connection.query(
      `INSERT INTO payment_terms (term_name, no_of_days, tenant_id, user_id)
       VALUES (?, ?, ?, ?)`,
      [name, no_of_days, tenant_id, user_id]
    );

    const [rows] = await connection.query(
      `SELECT * FROM payment_terms WHERE id = ?`,
      [result.insertId]
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

exports.createAccountsheadtype = async (data, tenant_id, user_id) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { account_type, account_head } = data;

    if (!account_head) {
      throw new Error('account_head is required');
    }

    if (!account_type) {
      throw new Error('account_type is required');
    }

    // Find or create the parent account head in chartofaccounts_head_type
    const [parentRows] = await connection.query(
      `SELECT id FROM chartofaccounts_head_type WHERE group_name = ? LIMIT 1`,
      [account_head]
    );

    let parentId;

    if (parentRows.length > 0) {
      parentId = parentRows[0].id;
    } else {
      const [parentResult] = await connection.query(
        `INSERT INTO chartofaccounts_head_type (group_name, parent_id, status)
         VALUES (?, 0, 1)`,
        [account_head]
      );
      parentId = parentResult.insertId;
    }

    // Find duplicate account type under the same parent account head
    const [typeRows] = await connection.query(
      `SELECT id FROM chartofaccounts_head_type WHERE group_name = ? AND parent_id = ? LIMIT 1`,
      [account_type, parentId]
    );

    if (typeRows.length > 0) {
      throw new Error('account_type already exists under this account_head');
    }

    const [typeResult] = await connection.query(
      `INSERT INTO chartofaccounts_head_type (group_name, parent_id, status)
       VALUES (?, ?, 1)`,
      [account_type, parentId]
    );

    const typeId = typeResult.insertId;

    const [rows] = await connection.query(
      `SELECT id, group_name, parent_id, status FROM chartofaccounts_head_type WHERE id = ?`,
      [typeId]
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

exports.getchartofaccountsItem = async (tenant_id) => {
  try {

    const [rows] = await db.query(`
    SELECT id, account_name, account_item
    FROM chartofaccounts_name
    WHERE status = 1 AND tenant_id = ?
    ORDER BY id
  `,[tenant_id]);
    //const groups = await exports.fetchGroups();
    //const tree = buildTree(rows, null); // root = NULL

    return rows

  } catch (error) {
    
  }
};

exports.createTaxRate = async (data, tenant_id, user_id) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { name, tax_rate_percentage } = data;

    if (!name) {
      throw new Error('name is required');
    }

    if (tax_rate_percentage === undefined || tax_rate_percentage === null) {
      throw new Error('tax_rate_percentage is required');
    }

    const [result] = await connection.query(
      `INSERT INTO tax_rate (tax_rate_name, tax_rate_percentage, tenant_id, user_id)
       VALUES (?, ?, ?, ?)`,
      [name, tax_rate_percentage, tenant_id, user_id]
    );

    const [rows] = await connection.query(
      `SELECT * FROM tax_rate WHERE id = ?`,
      [result.insertId]
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

exports.fetchTaxRate = async (tenant_id) => {
  const [rows] = await db.query(
    "SELECT * FROM tax_rate WHERE tenant_id = ? ORDER BY id DESC",
    [tenant_id]
  );

  return rows;
};

exports.documentNumberSettings = async (data, tenant_id, user_id) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { document_type, prefix, current_number, suffix, increment_by } = data;

    if (!document_type) {
      throw new Error('document_type is required');
    }

    if (prefix === undefined || prefix === null) {
      throw new Error('prefix is required');
    }

    if (current_number === undefined || current_number === null) {
      throw new Error('current_number is required');
    }

    if (suffix === undefined || suffix === null) {
      throw new Error('suffix is required');
    }

    if (increment_by === undefined || increment_by === null) {
      throw new Error('increment_by is required');
    }

    const [result] = await connection.query(
      `INSERT INTO document_number_settings (document_type, prefix, current_number, suffix, increment_by, tenant_id, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)` ,
      [document_type, prefix, current_number, suffix, increment_by, tenant_id, user_id]
    );

    const [rows] = await connection.query(
      `SELECT * FROM document_number_settings WHERE id = ?`,
      [result.insertId]
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

exports.fetchDocumentNumberSettings = async (tenant_id, document_type) => {
  const [rows] = await db.query(
    "SELECT * FROM document_number_settings WHERE tenant_id = ? AND document_type = ? ORDER BY id DESC",
    [tenant_id, document_type]
  );

  return rows;
};







        








