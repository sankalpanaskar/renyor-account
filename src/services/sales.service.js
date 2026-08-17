// services/menu.service.js
const db = require('../config/db');
const handleCustomFields= require('../utils/custom_field');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const DOCUMENT_PDF_FOLDER = {
  invoice: 'invoices',
  quotation: 'quotations',
  workorder: 'workorders'
};

const hasOwn = (object, key) =>
  Object.prototype.hasOwnProperty.call(object || {}, key);

const normalizeFormValue = (value) => {
  if (!Array.isArray(value)) {
    return value;
  }

  const nonEmptyValues = value.filter(
    (item) => item !== undefined && item !== null && String(item).trim() !== ""
  );

  return nonEmptyValues.length ? nonEmptyValues[nonEmptyValues.length - 1] : "";
};

const formatDateForDb = (dateValue) => {
  dateValue = normalizeFormValue(dateValue);

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

const parseCustomFieldForUpdate = (custom_field) => {
  custom_field = normalizeFormValue(custom_field);

  if (custom_field === undefined || custom_field === null || custom_field === "") {
    return undefined;
  }

  if (typeof custom_field === "string") {
    try {
      return JSON.parse(custom_field);
    } catch (err) {
      throw new Error("Invalid custom_field JSON");
    }
  }

  return custom_field;
};

const parseBankAccountsForUpdate = (bank_accounts) => {
  const normalized = normalizeFormValue(bank_accounts);

  if (normalized === undefined || normalized === null || normalized === "") {
    return [];
  }

  if (typeof normalized === "string") {
    try {
      const parsed = JSON.parse(normalized);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      throw new Error("Invalid bank_accounts JSON");
    }
  }

  return Array.isArray(normalized) ? normalized : [];
};

const parseInvoiceItems = (items) => {
  const normalized = normalizeFormValue(items);

  if (normalized === undefined || normalized === null || normalized === "") {
    return [];
  }

  if (typeof normalized === "string") {
    try {
      const parsed = JSON.parse(normalized);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      throw new Error("Invalid items JSON");
    }
  }

  return Array.isArray(normalized) ? normalized : [];
};

const buildInvoiceItemValues = (invoiceMasterId, item, tenant_id, user_id) => {
  return [
    invoiceMasterId,
    normalizeFormValue(item?.item_id) ?? null,
    normalizeFormValue(item?.item_name) ?? null,
    normalizeFormValue(item?.item_description) ?? null,
    normalizeFormValue(item?.item_type) ?? null,
    normalizeFormValue(item?.hsn_sac) ?? null,
    normalizeFormValue(item?.quantity) ?? 0,
    normalizeFormValue(item?.rate) ?? 0,
    normalizeFormValue(item?.tax) ?? null,
    normalizeFormValue(item?.unit) ?? null,
    normalizeFormValue(item?.amount) ?? 0,
    tenant_id,
    user_id
  ];
};

const buildQuotationItemValues = (quotationMasterId, item, tenant_id, user_id) => {
  return [
    quotationMasterId,
    normalizeFormValue(item?.item_id) ?? null,
    normalizeFormValue(item?.item_name) ?? null,
    normalizeFormValue(item?.item_description) ?? null,
    normalizeFormValue(item?.item_type) ?? null,
    normalizeFormValue(item?.hsn_sac) ?? null,
    normalizeFormValue(item?.quantity) ?? 0,
    normalizeFormValue(item?.rate) ?? 0,
    normalizeFormValue(item?.tax) ?? null,
    normalizeFormValue(item?.unit) ?? null,
    normalizeFormValue(item?.amount) ?? 0,
    tenant_id,
    user_id
  ];
};

const buildSalesOrderItemValues = (salesOrderMasterId, item, tenant_id, user_id) => {
  return [
    salesOrderMasterId,
    normalizeFormValue(item?.item_id) ?? null,
    normalizeFormValue(item?.item_name) ?? null,
    normalizeFormValue(item?.item_description) ?? null,
    normalizeFormValue(item?.item_type) ?? null,
    normalizeFormValue(item?.hsn_sac) ?? null,
    normalizeFormValue(item?.quantity) ?? 0,
    normalizeFormValue(item?.rate) ?? 0,
    normalizeFormValue(item?.tax) ?? null,
    normalizeFormValue(item?.unit) ?? null,
    normalizeFormValue(item?.amount) ?? 0,
    tenant_id,
    user_id
  ];
};



exports.createDocumentPdf = async (
  tenant_id,
  user_id,
  document_type,
  html,
  requestedFileName = null
) => {
  const normalizedType = String(document_type || 'invoice').toLowerCase().replace(/\s+/g, '');
  const folder = DOCUMENT_PDF_FOLDER[normalizedType] || DOCUMENT_PDF_FOLDER.invoice;

  let browser = null;

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    const publicInvoicesDir = path.join(process.cwd(), 'public', 'uploads', folder, String(tenant_id || 'common'));

    await fs.promises.mkdir(publicInvoicesDir, { recursive: true });

    const fallbackFileName = `${normalizedType}-${String(tenant_id || 'common')}-${Date.now()}.pdf`;
    const fileName = path.basename(requestedFileName || fallbackFileName);
    const filePath = path.join(publicInvoicesDir, fileName);

    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: filePath,
      format: 'A4',
      printBackground: true
    });

    return {
      document_type: normalizedType,
      file_name: fileName,
      file_path: filePath,
      pdf_url: `/uploads/${folder}/${String(tenant_id || 'common')}/${fileName}`,
      created_by: user_id || null
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
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

exports.createInvoice = async (data, tenant_id, user_id, uploaded_invoice_attachment = null) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const {
      customer_id,
      invoice_no,
      document_type,
      current_number,
      order_no,
      invoice_date,
      term,
      due_date,
      salesperson,
      subject,
      customer_notes,
      terms_and_conditions,
      sub_total,
      tax_amount,
      cgst_amount,
      sgst_amount,
      igst_amount,
      tax_mode,
      customer_state,
      total,
      adjustment_value,
      custom_field,
      module_id,
      items
    } = data || {};
    

    const invoiceItems = parseInvoiceItems(items);

    if (customer_id === undefined || customer_id === null || customer_id === "") {
      throw new Error("customer_id is required");
    }

    if (!invoice_no) {
      throw new Error("invoice_no is required");
    }

    const normalizedDocumentType = String(normalizeFormValue(document_type) || 'invoice')
      .toLowerCase()
      .replace(/\s+/g, '');
    const nextCurrentNumber = normalizeFormValue(current_number);

    if (nextCurrentNumber === undefined || nextCurrentNumber === null || nextCurrentNumber === "") {
      throw new Error("current_number is required");
    }

    if (!invoiceItems.length) {
      throw new Error("items are required");
    }

    const invoiceMasterColumns = [
      "customer_id",
      "invoice_no",
      "order_no",
      "invoice_date",
      "term",
      "due_date",
      "salesperson",
      "subject",
      "customer_notes",
      "terms_and_conditions",
      "sub_total",
      "tax_amount",
      "cgst_amount",
      "sgst_amount",
      "igst_amount",
      "tax_mode",
      "customer_state",
      "total",
      "adjustment_value",
      "invoice_attachment",
      "tenant_id",
      "user_id"
    ];

    const invoiceMasterValues = [
      customer_id,
      invoice_no,
      order_no ?? null,
      formatDateForDb(invoice_date),
      term ?? null,
      formatDateForDb(due_date),
      salesperson ?? null,
      subject ?? null,
      customer_notes ?? null,
      terms_and_conditions ?? null,
      sub_total ?? 0,
      tax_amount ?? 0,
      cgst_amount ?? 0,
      sgst_amount ?? 0,
      igst_amount ?? 0,
      tax_mode ?? null,
      customer_state ?? null,
      total ?? 0,
      adjustment_value ?? 0,
      uploaded_invoice_attachment ?? null,
      tenant_id,
      user_id
    ];

    const [masterResult] = await connection.query(
      `INSERT INTO invoice_master (${invoiceMasterColumns.join(", ")})
       VALUES (${invoiceMasterColumns.map(() => "?").join(", ")})`,
      invoiceMasterValues
    );

    const invoiceMasterId = masterResult.insertId;
    for (const item of invoiceItems) {
      await connection.query(
        `INSERT INTO invoice_items (
          invoice_master_id,
          item_id,
          item_name,
          item_description,
          item_type,
          hsn_sac,
          quantity,
          rate,
          tax,
          unit,
          amount,
          tenant_id,
          user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        buildInvoiceItemValues(invoiceMasterId, item, tenant_id, user_id)
      );
    }

    const customFieldValues = parseCustomFieldForUpdate(custom_field);

    if (customFieldValues && Object.keys(customFieldValues).length > 0) {
      const moduleId = normalizeFormValue(module_id);

      if (!moduleId) {
        throw new Error("module_id is required when custom_field is provided");
      }

      await handleCustomFields({
        connection,
        custom_field: customFieldValues,
        module_id: moduleId,
        tenant_id,
        record_id: invoiceMasterId
      });
    }

    const [settingsResult] = await connection.query(
      `UPDATE document_number_settings
       SET current_number = ?
       WHERE tenant_id = ? AND document_type = ?`,
      [nextCurrentNumber, tenant_id, normalizedDocumentType]
    );

    if (settingsResult.affectedRows === 0) {
      throw new Error("Document number settings not found");
    }

    const [masterRows] = await connection.query(
      `SELECT * FROM invoice_master WHERE id = ? AND tenant_id = ?`,
      [invoiceMasterId, tenant_id]
    );

    const [itemRows] = await connection.query(
      `SELECT * FROM invoice_items WHERE invoice_master_id = ? AND tenant_id = ? ORDER BY id ASC`,
      [invoiceMasterId, tenant_id]
    );

    await connection.commit();

    return {
      ...masterRows[0],
      items: itemRows
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

exports.createQuotation = async (data, tenant_id, user_id, uploaded_quotation_attachment = null) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const {
      customer_id,
      quotation_no,
      document_type,
      current_number,
      ref_no,
      quotation_date,
      term,
      expiry_date,
      salesperson,
      project_name,
      subject,
      customer_notes,
      terms_and_conditions,
      sub_total,
      tax_amount,
      cgst_amount,
      sgst_amount,
      igst_amount,
      tax_mode,
      customer_state,
      total,
      adjustment_value,
      custom_field,
      module_id,
      items
    } = data || {};

    const quotationItems = parseInvoiceItems(items);

    if (customer_id === undefined || customer_id === null || customer_id === "") {
      throw new Error("customer_id is required");
    }

    if (!quotation_no) {
      throw new Error("quotation_no is required");
    }

    const normalizedDocumentType = String(normalizeFormValue(document_type) || 'quotation')
      .toLowerCase()
      .replace(/\s+/g, '');
    const nextCurrentNumber = normalizeFormValue(current_number);

    if (nextCurrentNumber === undefined || nextCurrentNumber === null || nextCurrentNumber === "") {
      throw new Error("current_number is required");
    }

    if (!quotationItems.length) {
      throw new Error("items are required");
    }

    const quotationMasterColumns = [
      "customer_id",
      "quotation_no",
      "ref_no",
      "quotation_date",
      "term",
      "expiry_date",
      "salesperson",
      "project_name",
      "subject",
      "customer_notes",
      "terms_and_conditions",
      "sub_total",
      "tax_amount",
      "cgst_amount",
      "sgst_amount",
      "igst_amount",
      "tax_mode",
      "customer_state",
      "total",
      "adjustment_value",
      "quotation_attachment",
      "tenant_id",
      "user_id"
    ];

    const quotationMasterValues = [
      customer_id,
      quotation_no,
      ref_no ?? null,
      formatDateForDb(quotation_date),
      term ?? null,
      formatDateForDb(expiry_date),
      salesperson ?? null,
      project_name ?? null,
      subject ?? null,
      customer_notes ?? null,
      terms_and_conditions ?? null,
      sub_total ?? 0,
      tax_amount ?? 0,
      cgst_amount ?? 0,
      sgst_amount ?? 0,
      igst_amount ?? 0,
      tax_mode ?? null,
      customer_state ?? null,
      total ?? 0,
      adjustment_value ?? 0,
      uploaded_quotation_attachment ?? null,
      tenant_id,
      user_id
    ];

    
    const [masterResult] = await connection.query(
      `INSERT INTO quotation_master (${quotationMasterColumns.join(", ")})
       VALUES (${quotationMasterColumns.map(() => "?").join(", ")})`,
      quotationMasterValues
    );

    const quotationMasterId = masterResult.insertId;
    for (const item of quotationItems) {
      await connection.query(
        `INSERT INTO quotation_items (
          quotation_master_id,
          item_id,
          item_name,
          item_description,
          item_type,
          hsn_sac,
          quantity,
          rate,
          tax,
          unit,
          amount,
          tenant_id,
          user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        buildQuotationItemValues(quotationMasterId, item, tenant_id, user_id)
      );
    }

    const customFieldValues = parseCustomFieldForUpdate(custom_field);

    if (customFieldValues && Object.keys(customFieldValues).length > 0) {
      const moduleId = normalizeFormValue(module_id);

      if (!moduleId) {
        throw new Error("module_id is required when custom_field is provided");
      }

      await handleCustomFields({
        connection,
        custom_field: customFieldValues,
        module_id: moduleId,
        tenant_id,
        record_id: quotationMasterId
      });
    }

    const [settingsResult] = await connection.query(
      `UPDATE document_number_settings
       SET current_number = ?
       WHERE tenant_id = ? AND document_type = ?`,
      [nextCurrentNumber, tenant_id, normalizedDocumentType]
    );

    if (settingsResult.affectedRows === 0) {
      throw new Error("Document number settings not found");
    }

    const [masterRows] = await connection.query(
      `SELECT * FROM quotation_master WHERE id = ? AND tenant_id = ?`,
      [quotationMasterId, tenant_id]
    );

    const [itemRows] = await connection.query(
      `SELECT * FROM quotation_items WHERE quotation_master_id = ? AND tenant_id = ? ORDER BY id ASC`,
      [quotationMasterId, tenant_id]
    );

    await connection.commit();

    return {
      ...masterRows[0],
      items: itemRows
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

exports.createSalesOrder = async (data, tenant_id, user_id, uploaded_sales_order_attachment = null) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const {
      customer_id,
      sales_order_no,
      document_type,
      current_number,
      ref_no,
      sales_order_date,
      expected_shipment_date,
      payment_terms,
      delivery_method,
      salesperson,
      project_name,
      subject,
      customer_notes,
      terms_and_conditions,
      sub_total,
      tax_amount,
      cgst_amount,
      sgst_amount,
      igst_amount,
      tax_mode,
      customer_state,
      adjustment_value,
      total,
      custom_field,
      module_id,
      items
    } = data || {};

    const salesOrderItems = parseInvoiceItems(items);

    if (customer_id === undefined || customer_id === null || customer_id === "") {
      throw new Error("customer_id is required");
    }

    if (!sales_order_no) {
      throw new Error("sales_order_no is required");
    }

    const normalizedDocumentType = String(normalizeFormValue(document_type) || 'Sales Order')
      .toLowerCase()
      .replace(/\s+/g, '');
    const nextCurrentNumber = normalizeFormValue(current_number);

    if (nextCurrentNumber === undefined || nextCurrentNumber === null || nextCurrentNumber === "") {
      throw new Error("current_number is required");
    }

    if (!salesOrderItems.length) {
      throw new Error("items are required");
    }

    const salesOrderMasterColumns = [
      "customer_id",
      "sales_order_no",
      "ref_no",
      "sales_order_date",
      "expected_shipment_date",
      "payment_terms",
      "delivery_method",
      "salesperson",
      "project_name",
      "subject",
      "customer_notes",
      "terms_and_conditions",
      "sub_total",
      "tax_amount",
      "cgst_amount",
      "sgst_amount",
      "igst_amount",
      "tax_mode",
      "customer_state",
      "adjustment_value",
      "total",
      "sales_order_attachment",
      "tenant_id",
      "user_id"
    ];

    const salesOrderMasterValues = [
      customer_id,
      sales_order_no,
      ref_no ?? null,
      formatDateForDb(sales_order_date),
      formatDateForDb(expected_shipment_date),
      payment_terms ?? null,
      delivery_method ?? null,
      salesperson ?? null,
      project_name ?? null,
      subject ?? null,
      customer_notes ?? null,
      terms_and_conditions ?? null,
      sub_total ?? 0,
      tax_amount ?? 0,
      cgst_amount ?? 0,
      sgst_amount ?? 0,
      igst_amount ?? 0,
      tax_mode ?? null,
      customer_state ?? null,
      adjustment_value ?? 0,
      total ?? 0,
      uploaded_sales_order_attachment ?? null,
      tenant_id,
      user_id
    ];

    const [masterResult] = await connection.query(
      `INSERT INTO sales_order_master (${salesOrderMasterColumns.join(", ")})
       VALUES (${salesOrderMasterColumns.map(() => "?").join(", ")})`,
      salesOrderMasterValues
    );

    const salesOrderMasterId = masterResult.insertId;
    for (const item of salesOrderItems) {
      await connection.query(
        `INSERT INTO sales_order_items (
          sales_order_master_id,
          item_id,
          item_name,
          item_description,
          item_type,
          hsn_sac,
          quantity,
          rate,
          tax,
          unit,
          amount,
          tenant_id,
          user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        buildSalesOrderItemValues(salesOrderMasterId, item, tenant_id, user_id)
      );
    }

    const customFieldValues = parseCustomFieldForUpdate(custom_field);

    if (customFieldValues && Object.keys(customFieldValues).length > 0) {
      const moduleId = normalizeFormValue(module_id);

      if (!moduleId) {
        throw new Error("module_id is required when custom_field is provided");
      }

      await handleCustomFields({
        connection,
        custom_field: customFieldValues,
        module_id: moduleId,
        tenant_id,
        record_id: salesOrderMasterId
      });
    }

    const [settingsResult] = await connection.query(
      `UPDATE document_number_settings
       SET current_number = ?
       WHERE tenant_id = ? AND document_type = ?`,
      [nextCurrentNumber, tenant_id, normalizedDocumentType]
    );

    if (settingsResult.affectedRows === 0) {
      throw new Error("Document number settings not found");
    }

    const [masterRows] = await connection.query(
      `SELECT * FROM sales_order_master WHERE id = ? AND tenant_id = ?`,
      [salesOrderMasterId, tenant_id]
    );

    const [itemRows] = await connection.query(
      `SELECT * FROM sales_order_items WHERE sales_order_master_id = ? AND tenant_id = ? ORDER BY id ASC`,
      [salesOrderMasterId, tenant_id]
    );

    await connection.commit();

    return {
      ...masterRows[0],
      items: itemRows
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

exports.fetchInvoice = async (tenant_id, invoice_id = null, module_id = null) => {
  const masterParams = [tenant_id];
  let masterWhereClause = "WHERE im.tenant_id = ?";

  if (invoice_id !== undefined && invoice_id !== null && invoice_id !== "") {
    masterWhereClause += " AND im.id = ?";
    masterParams.push(invoice_id);
  }

  const [masterRows] = await db.query(
    `SELECT
        im.*,
        im.status AS status,
        c.display_name AS customer_display_name,
        c.company_name AS customer_company_name,
        c.primary_contact_f_name AS customer_first_name,
        c.primary_contact_l_name AS customer_last_name,
        c.billing_address AS billing_address,
        c.billing_country AS billing_country,
        c.billing_city AS billing_city,
        c.billing_state AS billing_state,
        c.billing_pin AS billing_pin,
        c.shipping_address AS shipping_address,
        c.shipping_country AS shipping_country,
        c.shipping_city AS shipping_city,
        c.shipping_state AS shipping_state,
        c.shipping_pin AS shipping_pin

     FROM invoice_master im
     LEFT JOIN customers c
       ON c.id = im.customer_id
      AND c.tenant_id = im.tenant_id
     ${masterWhereClause}
     ORDER BY im.id DESC`,
    masterParams
  );

  if (!masterRows.length) {
    return invoice_id ? null : [];
  }

  const invoiceMasterIds = masterRows.map((row) => row.id);
  const [itemRows] = await db.query(
    `SELECT *
     FROM invoice_items
     WHERE tenant_id = ?
       AND invoice_master_id IN (?)
     ORDER BY invoice_master_id ASC, id ASC`,
    [tenant_id, invoiceMasterIds]
  );

  const itemsByInvoiceId = itemRows.reduce((acc, item) => {
    if (!acc[item.invoice_master_id]) {
      acc[item.invoice_master_id] = [];
    }

    acc[item.invoice_master_id].push(item);
    return acc;
  }, {});

  const invoices = masterRows.map((row) => {
    const {
      customer_display_name,
      customer_company_name,
      customer_first_name,
      customer_last_name,
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
      ...invoice
    } = row;

    return {
      ...invoice,
      customer: {
        display_name: customer_display_name || null,
        company_name: customer_company_name || null,
        first_name: customer_first_name || null,
        last_name: customer_last_name || null,
        billing_address: billing_address || null,
        billing_country: billing_country || null,
        billing_city: billing_city || null,
        billing_state: billing_state || null,
        billing_pin: billing_pin || null,
        shipping_address: shipping_address || null,
        shipping_country: shipping_country || null,
        shipping_city: shipping_city || null,
        shipping_state: shipping_state || null,
        shipping_pin: shipping_pin || null
      },
      items: itemsByInvoiceId[row.id] || []
    };
  });

  if (!module_id) {
    return invoice_id ? invoices[0] : invoices;
  }

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
    [module_id, tenant_id, invoiceMasterIds]
  );

  const customFieldMap = {};

  for (const row of customRows) {
    if (!customFieldMap[row.record_id]) {
      customFieldMap[row.record_id] = {};
    }

    customFieldMap[row.record_id][row.field_name] = row.field_value;
  }

  const invoicesWithCustomFields = invoices.map((invoice) => ({
    ...invoice,
    custom_field: customFieldMap[invoice.id] || {}
  }));

  return invoice_id ? invoicesWithCustomFields[0] : invoicesWithCustomFields;
};

exports.fetchQuotation = async (tenant_id, quotation_id = null, module_id = null) => {
  const masterParams = [tenant_id];
  let masterWhereClause = "WHERE qm.tenant_id = ?";

  if (quotation_id !== undefined && quotation_id !== null && quotation_id !== "") {
    masterWhereClause += " AND qm.id = ?";
    masterParams.push(quotation_id);
  }

  const [masterRows] = await db.query(
    `SELECT
        qm.*,
        qm.status AS status,
        c.display_name AS customer_display_name,
        c.company_name AS customer_company_name,
        c.primary_contact_f_name AS customer_first_name,
        c.primary_contact_l_name AS customer_last_name,
        c.billing_address AS billing_address,
        c.billing_country AS billing_country,
        c.billing_city AS billing_city,
        c.billing_state AS billing_state,
        c.billing_pin AS billing_pin,
        c.shipping_address AS shipping_address,
        c.shipping_country AS shipping_country,
        c.shipping_city AS shipping_city,
        c.shipping_state AS shipping_state,
        c.shipping_pin AS shipping_pin

     FROM quotation_master qm
     LEFT JOIN customers c
       ON c.id = qm.customer_id
      AND c.tenant_id = qm.tenant_id
     ${masterWhereClause}
     ORDER BY qm.id DESC`,
    masterParams
  );

  if (!masterRows.length) {
    return quotation_id ? null : [];
  }

  const quotationMasterIds = masterRows.map((row) => row.id);
  const [itemRows] = await db.query(
    `SELECT *
     FROM quotation_items
     WHERE tenant_id = ?
       AND quotation_master_id IN (?)
     ORDER BY quotation_master_id ASC, id ASC`,
    [tenant_id, quotationMasterIds]
  );

  const itemsByQuotationId = itemRows.reduce((acc, item) => {
    if (!acc[item.quotation_master_id]) {
      acc[item.quotation_master_id] = [];
    }

    acc[item.quotation_master_id].push(item);
    return acc;
  }, {});

  const quotations = masterRows.map((row) => {
    const {
      customer_display_name,
      customer_company_name,
      customer_first_name,
      customer_last_name,
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
      ...quotation
    } = row;

    return {
      ...quotation,
      customer: {
        display_name: customer_display_name || null,
        company_name: customer_company_name || null,
        first_name: customer_first_name || null,
        last_name: customer_last_name || null,
        billing_address: billing_address || null,
        billing_country: billing_country || null,
        billing_city: billing_city || null,
        billing_state: billing_state || null,
        billing_pin: billing_pin || null,
        shipping_address: shipping_address || null,
        shipping_country: shipping_country || null,
        shipping_city: shipping_city || null,
        shipping_state: shipping_state || null,
        shipping_pin: shipping_pin || null
      },
      items: itemsByQuotationId[row.id] || []
    };
  });

  if (!module_id) {
    return quotation_id ? quotations[0] : quotations;
  }

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
    [module_id, tenant_id, quotationMasterIds]
  );

  const customFieldMap = {};

  for (const row of customRows) {
    if (!customFieldMap[row.record_id]) {
      customFieldMap[row.record_id] = {};
    }

    customFieldMap[row.record_id][row.field_name] = row.field_value;
  }

  const quotationsWithCustomFields = quotations.map((quotation) => ({
    ...quotation,
    custom_field: customFieldMap[quotation.id] || {}
  }));

  return quotation_id ? quotationsWithCustomFields[0] : quotationsWithCustomFields;
};

exports.fetchSalesOrder = async (tenant_id, sales_order_id = null, module_id = null) => {
  const masterParams = [tenant_id];
  let masterWhereClause = "WHERE som.tenant_id = ?";

  if (sales_order_id !== undefined && sales_order_id !== null && sales_order_id !== "") {
    masterWhereClause += " AND som.id = ?";
    masterParams.push(sales_order_id);
  }

  const [masterRows] = await db.query(
    `SELECT
        som.*,
        som.status AS status,
        c.display_name AS customer_display_name,
        c.company_name AS customer_company_name,
        c.primary_contact_f_name AS customer_first_name,
        c.primary_contact_l_name AS customer_last_name,
        c.billing_address AS billing_address,
        c.billing_country AS billing_country,
        c.billing_city AS billing_city,
        c.billing_state AS billing_state,
        c.billing_pin AS billing_pin,
        c.shipping_address AS shipping_address,
        c.shipping_country AS shipping_country,
        c.shipping_city AS shipping_city,
        c.shipping_state AS shipping_state,
        c.shipping_pin AS shipping_pin

     FROM sales_order_master som
     LEFT JOIN customers c
       ON c.id = som.customer_id
      AND c.tenant_id = som.tenant_id
     ${masterWhereClause}
     ORDER BY som.id DESC`,
    masterParams
  );

  if (!masterRows.length) {
    return sales_order_id ? null : [];
  }

  const salesOrderMasterIds = masterRows.map((row) => row.id);
  const [itemRows] = await db.query(
    `SELECT *
     FROM sales_order_items
     WHERE tenant_id = ?
       AND sales_order_master_id IN (?)
     ORDER BY sales_order_master_id ASC, id ASC`,
    [tenant_id, salesOrderMasterIds]
  );

  const itemsBySalesOrderId = itemRows.reduce((acc, item) => {
    if (!acc[item.sales_order_master_id]) {
      acc[item.sales_order_master_id] = [];
    }

    acc[item.sales_order_master_id].push(item);
    return acc;
  }, {});

  const salesOrders = masterRows.map((row) => {
    const {
      customer_display_name,
      customer_company_name,
      customer_first_name,
      customer_last_name,
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
      ...salesOrder
    } = row;

    return {
      ...salesOrder,
      customer: {
        display_name: customer_display_name || null,
        company_name: customer_company_name || null,
        first_name: customer_first_name || null,
        last_name: customer_last_name || null,
        billing_address: billing_address || null,
        billing_country: billing_country || null,
        billing_city: billing_city || null,
        billing_state: billing_state || null,
        billing_pin: billing_pin || null,
        shipping_address: shipping_address || null,
        shipping_country: shipping_country || null,
        shipping_city: shipping_city || null,
        shipping_state: shipping_state || null,
        shipping_pin: shipping_pin || null
      },
      items: itemsBySalesOrderId[row.id] || []
    };
  });

  if (!module_id) {
    return sales_order_id ? salesOrders[0] : salesOrders;
  }

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
    [module_id, tenant_id, salesOrderMasterIds]
  );

  const customFieldMap = {};

  for (const row of customRows) {
    if (!customFieldMap[row.record_id]) {
      customFieldMap[row.record_id] = {};
    }

    customFieldMap[row.record_id][row.field_name] = row.field_value;
  }

  const salesOrdersWithCustomFields = salesOrders.map((salesOrder) => ({
    ...salesOrder,
    custom_field: customFieldMap[salesOrder.id] || {}
  }));

  return sales_order_id ? salesOrdersWithCustomFields[0] : salesOrdersWithCustomFields;
};

exports.fetchPurchaseInvoice = async (tenant_id, purchase_invoice_id = null, module_id = null) => {
  const masterParams = [tenant_id];
  let masterWhereClause = "WHERE pim.tenant_id = ?";

  if (
    purchase_invoice_id !== undefined &&
    purchase_invoice_id !== null &&
    purchase_invoice_id !== ""
  ) {
    masterWhereClause += " AND pim.id = ?";
    masterParams.push(purchase_invoice_id);
  }

  const [masterRows] = await db.query(
    `SELECT
        pim.*,
        pim.status AS status,
        vm.display_name AS vendor_display_name,
        vm.company_name AS vendor_company_name,
        vm.primary_contact_f_name AS vendor_first_name,
        vm.primary_contact_l_name AS vendor_last_name,
        vm.email AS vendor_email,
        vm.work_phone AS vendor_work_phone,
        vm.mobile_no AS vendor_mobile_no,
        vm.billing_address AS billing_address,
        vm.billing_country AS billing_country,
        vm.billing_city AS billing_city,
        vm.billing_state AS billing_state,
        vm.billing_pin AS billing_pin,
        vm.shipping_address AS shipping_address,
        vm.shipping_country AS shipping_country,
        vm.shipping_city AS shipping_city,
        vm.shipping_state AS shipping_state,
        vm.shipping_pin AS shipping_pin
     FROM purchase_invoice_master pim
     LEFT JOIN vendor_master vm
       ON vm.id = pim.vendor_id
      AND vm.tenant_id = pim.tenant_id
     ${masterWhereClause}
     ORDER BY pim.id DESC`,
    masterParams
  );

  if (!masterRows.length) {
    return purchase_invoice_id ? null : [];
  }

  const purchaseInvoiceIds = masterRows.map((row) => row.id);
  const [itemRows] = await db.query(
    `SELECT *
     FROM purchase_invoice_items
     WHERE tenant_id = ?
       AND purchase_invoice_master_id IN (?)
     ORDER BY purchase_invoice_master_id ASC, id ASC`,
    [tenant_id, purchaseInvoiceIds]
  );

  const itemsByPurchaseInvoiceId = itemRows.reduce((acc, item) => {
    if (!acc[item.purchase_invoice_master_id]) {
      acc[item.purchase_invoice_master_id] = [];
    }

    acc[item.purchase_invoice_master_id].push(item);
    return acc;
  }, {});

  const purchaseInvoices = masterRows.map((row) => {
    const {
      vendor_display_name,
      vendor_company_name,
      vendor_first_name,
      vendor_last_name,
      vendor_email,
      vendor_work_phone,
      vendor_mobile_no,
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
      ...purchaseInvoice
    } = row;

    return {
      ...purchaseInvoice,
      vendor: {
        display_name: vendor_display_name || null,
        company_name: vendor_company_name || null,
        first_name: vendor_first_name || null,
        last_name: vendor_last_name || null,
        email: vendor_email || null,
        work_phone: vendor_work_phone || null,
        mobile_no: vendor_mobile_no || null,
        billing_address: billing_address || null,
        billing_country: billing_country || null,
        billing_city: billing_city || null,
        billing_state: billing_state || null,
        billing_pin: billing_pin || null,
        shipping_address: shipping_address || null,
        shipping_country: shipping_country || null,
        shipping_city: shipping_city || null,
        shipping_state: shipping_state || null,
        shipping_pin: shipping_pin || null
      },
      items: itemsByPurchaseInvoiceId[row.id] || []
    };
  });

  if (!module_id) {
    return purchase_invoice_id ? purchaseInvoices[0] : purchaseInvoices;
  }

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
    [module_id, tenant_id, purchaseInvoiceIds]
  );

  const customFieldMap = {};

  for (const row of customRows) {
    if (!customFieldMap[row.record_id]) {
      customFieldMap[row.record_id] = {};
    }

    customFieldMap[row.record_id][row.field_name] = row.field_value;
  }

  const purchaseInvoicesWithCustomFields = purchaseInvoices.map((purchaseInvoice) => ({
    ...purchaseInvoice,
    custom_field: customFieldMap[purchaseInvoice.id] || {}
  }));

  return purchase_invoice_id
    ? purchaseInvoicesWithCustomFields[0]
    : purchaseInvoicesWithCustomFields;
};

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

  const [bankAccountRows] = await db.query(
    `SELECT *
     FROM vendor_bank_accounts
     WHERE vendor_master_id IN (?)`,
    [vendorIds]
  );

  console.log(vendorRows,module_id, vendorIds);

  const customFieldMap = {};
  const bankAccountMap = {};

  for (const row of vendorRows) {
    if (!customFieldMap[row.record_id]) {
      customFieldMap[row.record_id] = {};
    }
    customFieldMap[row.record_id][row.field_name] = row.field_value;
  }

  for (const row of bankAccountRows) {
    if (!bankAccountMap[row.vendor_master_id]) {
      bankAccountMap[row.vendor_master_id] = [];
    }
    bankAccountMap[row.vendor_master_id].push(row);
  }

  return vendors.map((vendor) => ({
    ...vendor,
    custom_field: customFieldMap[vendor.id] || {},
    bank_accounts: bankAccountMap[vendor.id] || []
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
        document_1,
        document_2,
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
      ) VALUES (?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        customer_group ?? group,
        gst_treatment,
        source_of_supply,
        pan,
        tax_preference,
        payment_terms,
        department,
        designation,
        uploaded_file_name_1 || null,
        uploaded_file_name_2 || null,
        document_1_name || null,
        document_2_name || null,
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

exports.editCustomer = async (
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
      customer_id,
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
      customer_group,
      gst_treatment,
      source_of_supply,
      pan,
      tax_preference,
      payment_terms,
      department,
      designation,
      document_1,
      document_2,
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
      shipping_pin,
      custom_field,
      module_id
    } = data || {};

    const customerId = normalizeFormValue(customer_id);
    const moduleId = normalizeFormValue(module_id);

    if (!customerId) {
      throw new Error("customer_id is required");
    }

    const [existingRows] = await connection.query(
      `SELECT id FROM customers WHERE id = ? AND tenant_id = ? FOR UPDATE`,
      [customerId, tenant_id]
    );

    if (!existingRows.length) {
      throw new Error("Customer not found");
    }

    const updates = [];
    const values = [];

    const addUpdate = (column, value, shouldUpdate) => {
      if (!shouldUpdate) {
        return;
      }

      updates.push(`${column} = ?`);
      values.push(normalizeFormValue(value) ?? null);
    };

    addUpdate("customer_type", customer_type, hasOwn(data, "customer_type"));
    addUpdate("primary_contact_f_name", primary_contact_f_name, hasOwn(data, "primary_contact_f_name"));
    addUpdate("primary_contact_l_name", primary_contact_l_name, hasOwn(data, "primary_contact_l_name"));
    addUpdate("company_name", company_name, hasOwn(data, "company_name"));
    addUpdate("display_name", display_name, hasOwn(data, "display_name"));
    addUpdate("email", email, hasOwn(data, "email"));
    addUpdate("work_phone", work_phone, hasOwn(data, "work_phone"));
    addUpdate("mobile_no", mobile_no, hasOwn(data, "mobile_no"));
    addUpdate("dob", formatDateForDb(dob), hasOwn(data, "dob"));
    addUpdate("doi", formatDateForDb(doi), hasOwn(data, "doi"));
    addUpdate("website", website, hasOwn(data, "website"));
    addUpdate(
      "customer_group",
      customer_group ?? group,
      hasOwn(data, "customer_group") || hasOwn(data, "group")
    );
    addUpdate("gst_treatment", gst_treatment, hasOwn(data, "gst_treatment"));
    addUpdate("source_of_supply", source_of_supply, hasOwn(data, "source_of_supply"));
    addUpdate("pan", pan, hasOwn(data, "pan"));
    addUpdate("tax_preference", tax_preference, hasOwn(data, "tax_preference"));
    addUpdate("payment_terms", payment_terms, hasOwn(data, "payment_terms"));
    addUpdate("department", department, hasOwn(data, "department"));
    addUpdate("designation", designation, hasOwn(data, "designation"));
    addUpdate(
      "document_1",
      uploaded_file_name_1 ?? document_1,
      uploaded_file_name_1 !== null || hasOwn(data, "document_1")
    );
    addUpdate(
      "document_2",
      uploaded_file_name_2 ?? document_2,
      uploaded_file_name_2 !== null || hasOwn(data, "document_2")
    );
    addUpdate("document_1_name", document_1_name, hasOwn(data, "document_1_name"));
    addUpdate("document_2_name", document_2_name, hasOwn(data, "document_2_name"));
    addUpdate("exemption_reason", exemption_reason, hasOwn(data, "exemption_reason"));
    addUpdate("opening_balance", opening_balance, hasOwn(data, "opening_balance"));
    addUpdate("billing_address", billing_address, hasOwn(data, "billing_address"));
    addUpdate("billing_country", billing_country, hasOwn(data, "billing_country"));
    addUpdate("billing_city", billing_city, hasOwn(data, "billing_city"));
    addUpdate("billing_state", billing_state, hasOwn(data, "billing_state"));
    addUpdate("billing_pin", billing_pin, hasOwn(data, "billing_pin"));
    addUpdate("shipping_address", shipping_address, hasOwn(data, "shipping_address"));
    addUpdate("shipping_country", shipping_country, hasOwn(data, "shipping_country"));
    addUpdate("shipping_city", shipping_city, hasOwn(data, "shipping_city"));
    addUpdate("shipping_state", shipping_state, hasOwn(data, "shipping_state"));
    addUpdate("shipping_pin", shipping_pin, hasOwn(data, "shipping_pin"));

    if (updates.length > 0) {
      await connection.query(
        `UPDATE customers
         SET ${updates.join(", ")}
         WHERE id = ? AND tenant_id = ?`,
        [...values, customerId, tenant_id]
      );
    }

    if (hasOwn(data, "custom_field") && custom_field !== undefined && custom_field !== null && custom_field !== "") {
      const customFieldValues = parseCustomFieldForUpdate(custom_field);

      if (!moduleId) {
        throw new Error("module_id is required when custom_field is provided");
      }

      await connection.query(
        `DELETE FROM custom_field_values
         WHERE module_id = ? AND tenant_id = ? AND record_id = ?`,
        [moduleId, tenant_id, customerId]
      );

      await handleCustomFields({
        connection,
        custom_field: customFieldValues,
        module_id: moduleId,
        tenant_id,
        record_id: customerId,
      });
    }

    const [rows] = await connection.query(
      `SELECT * FROM customers WHERE id = ? AND tenant_id = ?`,
      [customerId, tenant_id]
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
        document_1,
        document_2,
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        uploaded_file_name_1 || null,
        uploaded_file_name_2 || null,
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

exports.updateVendor = async (
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
      vendor_id,
      vendor_master_id,
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
      document_1,
      document_2,
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
      bank_accounts,
      custom_field
    } = data || {};

    const vendorId = normalizeFormValue(
      vendor_id ?? vendor_master_id ?? data?.id
    );
    const moduleId = normalizeFormValue(module_id);

    if (!vendorId) {
      throw new Error("vendor_id is required");
    }

    const [existingRows] = await connection.query(
      `SELECT id FROM vendor_master WHERE id = ? AND tenant_id = ? FOR UPDATE`,
      [vendorId, tenant_id]
    );

    if (!existingRows.length) {
      throw new Error("Vendor not found");
    }

    const updates = [];
    const values = [];

    const addUpdate = (column, value, shouldUpdate) => {
      if (!shouldUpdate) {
        return;
      }

      updates.push(`${column} = ?`);
      values.push(normalizeFormValue(value) ?? null);
    };

    addUpdate("primary_contact_f_name", primary_contact_f_name, hasOwn(data, "primary_contact_f_name"));
    addUpdate("primary_contact_l_name", primary_contact_l_name, hasOwn(data, "primary_contact_l_name"));
    addUpdate("company_name", company_name, hasOwn(data, "company_name"));
    addUpdate("display_name", display_name, hasOwn(data, "display_name"));
    addUpdate("email", email, hasOwn(data, "email"));
    addUpdate("work_phone", work_phone, hasOwn(data, "work_phone"));
    addUpdate("mobile_no", mobile_no, hasOwn(data, "mobile_no"));
    addUpdate("group_name", group, hasOwn(data, "group"));
    addUpdate("gst_treatment", gst_treatment, hasOwn(data, "gst_treatment"));
    addUpdate("source_of_supply", source_of_supply, hasOwn(data, "source_of_supply"));
    addUpdate("pan", pan, hasOwn(data, "pan"));
    addUpdate("opening_balance", opening_balance, hasOwn(data, "opening_balance"));
    addUpdate("payment_terms", payment_terms, hasOwn(data, "payment_terms"));
    addUpdate("tds", tds, hasOwn(data, "tds"));
    addUpdate("website", website, hasOwn(data, "website"));
    addUpdate("department", department, hasOwn(data, "department"));
    addUpdate("designation", designation, hasOwn(data, "designation"));
    addUpdate(
      "document_1",
      uploaded_file_name_1 ?? document_1,
      uploaded_file_name_1 !== null || hasOwn(data, "document_1")
    );
    addUpdate(
      "document_2",
      uploaded_file_name_2 ?? document_2,
      uploaded_file_name_2 !== null || hasOwn(data, "document_2")
    );
    addUpdate("document_1_name", document_1_name, hasOwn(data, "document_1_name"));
    addUpdate("document_2_name", document_2_name, hasOwn(data, "document_2_name"));
    addUpdate("billing_address", billing_address, hasOwn(data, "billing_address"));
    addUpdate("billing_country", billing_country, hasOwn(data, "billing_country"));
    addUpdate("billing_city", billing_city, hasOwn(data, "billing_city"));
    addUpdate("billing_state", billing_state, hasOwn(data, "billing_state"));
    addUpdate("billing_pin", billing_pin, hasOwn(data, "billing_pin"));
    addUpdate("shipping_address", shipping_address, hasOwn(data, "shipping_address"));
    addUpdate("shipping_country", shipping_country, hasOwn(data, "shipping_country"));
    addUpdate("shipping_city", shipping_city, hasOwn(data, "shipping_city"));
    addUpdate("shipping_state", shipping_state, hasOwn(data, "shipping_state"));
    addUpdate("shipping_pin", shipping_pin, hasOwn(data, "shipping_pin"));
    addUpdate("msme_registration_type", msme_registration_type, hasOwn(data, "msme_registration_type"));
    addUpdate("msme_registration_number", msme_registration_number, hasOwn(data, "msme_registration_number"));

    if (updates.length > 0) {
      await connection.query(
        `UPDATE vendor_master
         SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND tenant_id = ?`,
        [...values, vendorId, tenant_id]
      );
    }

    if (hasOwn(data, "bank_accounts")) {
      const parsedBankAccounts = parseBankAccountsForUpdate(bank_accounts);

      for (const bank of parsedBankAccounts) {
        if (
          bank.account_number &&
          bank.re_enter_account_number &&
          bank.account_number !== bank.re_enter_account_number
        ) {
          throw new Error("Bank account number mismatch");
        }
      }

      await connection.query(
        `DELETE FROM vendor_bank_accounts WHERE vendor_master_id = ?`,
        [vendorId]
      );

      if (parsedBankAccounts.length > 0) {
        const bankValues = parsedBankAccounts.map((bank) => [
          vendorId,
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
    }

    if (hasOwn(data, "custom_field") && custom_field !== undefined && custom_field !== null && custom_field !== "") {
      const customFieldValues = parseCustomFieldForUpdate(custom_field);

      if (!moduleId) {
        throw new Error("module_id is required when custom_field is provided");
      }

      await connection.query(
        `DELETE FROM custom_field_values
         WHERE module_id = ? AND tenant_id = ? AND record_id = ?`,
        [moduleId, tenant_id, vendorId]
      );

      await handleCustomFields({
        connection,
        custom_field: customFieldValues,
        module_id: moduleId,
        tenant_id,
        record_id: vendorId
      });
    }

    const [vendorRows] = await connection.query(
      `SELECT * FROM vendor_master WHERE id = ? AND tenant_id = ?`,
      [vendorId, tenant_id]
    );

    const [bankRows] = await connection.query(
      `SELECT * FROM vendor_bank_accounts WHERE vendor_master_id = ?`,
      [vendorId]
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
  uploaded_item_image = null
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
      current_quantity,
      current_stock_value,
      unit_cost,
      purchase_account_id,
      chartofaccounts_name_id_purchase,
      purchase_account_description,
      prefered_vendor_id,
      vendor_master_id,
      name,
      enable_sales_information,
      enable_purchase_information,
      item_image: body_item_image,
      custom_field,
      module_id
    } = data || {};

    const emptyToNull = (value) => {
      const normalized = normalizeFormValue(value);
      return normalized === undefined || normalized === null || normalized === ''
        ? null
        : normalized;
    };

    const numberOrZero = (value, fieldName) => {
      const normalized = emptyToNull(value);

      if (normalized === null) {
        return 0;
      }

      const numericValue = Number(normalized);

      if (Number.isNaN(numericValue)) {
        throw new Error(`${fieldName} must be a valid number`);
      }

      return numericValue;
    };

    const booleanFlag = (value) => {
      const normalized = emptyToNull(value);

      if (normalized === null) {
        return 0;
      }

      if (typeof normalized === 'boolean') {
        return normalized ? 1 : 0;
      }

      return ['1', 'true', 'yes', 'on'].includes(
        String(normalized).trim().toLowerCase()
      )
        ? 1
        : 0;
    };

    const quantity = numberOrZero(current_quantity, 'current_quantity');
    const stockValue = numberOrZero(current_stock_value, 'current_stock_value');
    const unitCost = numberOrZero(unit_cost, 'unit_cost');
    const customFieldValues = parseCustomFieldForUpdate(custom_field);
    const moduleId = normalizeFormValue(module_id);

    /*
     * Opening stock validation
     *
     * Both quantity and stock value must be provided together.
     */
    if (quantity < 0) {
      throw new Error('current_quantity cannot be negative');
    }

    if (stockValue < 0) {
      throw new Error('current_stock_value cannot be negative');
    }

    if (unitCost < 0) {
      throw new Error('unit_cost cannot be negative');
    }

    if ((quantity > 0 && stockValue <= 0) ||
        (stockValue > 0 && quantity <= 0)) {
      throw new Error(
        'current_quantity and current_stock_value are both required for opening stock'
      );
    }

    if (quantity > 0 && unitCost <= 0) {
      throw new Error('unit_cost is required for opening stock');
    }

    const normalizedData = {
      type: emptyToNull(type),
      unit: emptyToNull(unit),
      hsn_code: emptyToNull(hsn_code),
      sac: emptyToNull(sac),
      tax_preference: emptyToNull(tax_preference),
      tax_rate_id: emptyToNull(gst_rates_id) ?? emptyToNull(tax_rate_id),
      selling_price: numberOrZero(selling_price, 'selling_price'),

      chartofaccounts_name_id_sales:
        emptyToNull(sales_account_id) ?? emptyToNull(chartofaccounts_name_id_sales),

      sales_account_description:
        emptyToNull(sales_account_description),

      cost_price: numberOrZero(cost_price, 'cost_price'),

      current_quantity: quantity,
      current_stock_value: stockValue,

      chartofaccounts_name_id_purchase:
        emptyToNull(purchase_account_id) ?? emptyToNull(chartofaccounts_name_id_purchase),

      purchase_account_description:
        emptyToNull(purchase_account_description),

      vendor_master_id:
        emptyToNull(prefered_vendor_id) ?? emptyToNull(vendor_master_id),

      name: emptyToNull(name),

      enable_sales_information:
        booleanFlag(enable_sales_information),

      enable_purchase_information:
        booleanFlag(enable_purchase_information),

      item_image:
        uploaded_item_image ?? emptyToNull(body_item_image),

      tenant_id,
      user_id
    };

    if (!String(normalizedData.name || '').trim()) {
      throw new Error('name is required');
    }

    /*
     * ---------------------------------------------------------
     * 1. INSERT ITEM
     * ---------------------------------------------------------
     */

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
      'current_quantity',
      'current_stock_value',
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

    const values = columns.map(
      (column) => normalizedData[column]
    );

    const [result] = await connection.query(
      `
      INSERT INTO items
      (${columns.join(', ')})
      VALUES (${columns.map(() => '?').join(', ')})
      `,
      values
    );

    const recordId = result.insertId;

    /*
     * ---------------------------------------------------------
     * 2. INSERT OPENING STOCK BATCH
     * ---------------------------------------------------------
     *
     * Only when both:
     * current_quantity > 0
     * current_stock_value > 0
     */

    if (quantity > 0 && stockValue > 0) {
      await connection.query(
        `
        INSERT INTO stock_batches
        (
          item_id,
          source_type,
          source_id,
          quantity,
          remaining_quantity,
          unit_cost,
          total_cost,
          batch_date,
          tenant_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)
        `,
        [
          recordId,
          'OPENING',
          null,
          quantity,
          quantity,
          unitCost,
          stockValue,
          tenant_id
        ]
      );
    }

    /*
     * ---------------------------------------------------------
     * 3. CUSTOM FIELDS
     * ---------------------------------------------------------
     */

    if (customFieldValues) {
      await handleCustomFields({
        connection,
        custom_field: customFieldValues,
        module_id: moduleId,
        tenant_id,
        record_id: recordId
      });
    }

    /*
     * ---------------------------------------------------------
     * 4. FETCH CREATED ITEM
     * ---------------------------------------------------------
     */

    const [rows] = await connection.query(
      `
      SELECT *
      FROM items
      WHERE id = ?
        AND tenant_id = ?
      `,
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

exports.updateItem = async (
  data,
  tenant_id,
  user_id,
  uploaded_item_image = null
) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const {
      item_id,
      id,
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
      current_quantity,
      current_stock_value,
      unit_cost,
      purchase_account_id,
      chartofaccounts_name_id_purchase,
      purchase_account_description,
      prefered_vendor_id,
      vendor_master_id,
      name,
      enable_sales_information,
      enable_purchase_information,
      item_image: body_item_image,
      custom_field,
      module_id
    } = data || {};

    const itemId = normalizeFormValue(item_id ?? id);
    const moduleId = normalizeFormValue(module_id);

    if (!itemId) {
      throw new Error('item_id is required');
    }

    const emptyToNull = (value) => {
      const normalized = normalizeFormValue(value);
      return normalized === undefined || normalized === null || normalized === ''
        ? null
        : normalized;
    };

    const numberOrZero = (value, fieldName) => {
      const normalized = emptyToNull(value);

      if (normalized === null) {
        return 0;
      }

      const numericValue = Number(normalized);

      if (!Number.isFinite(numericValue)) {
        throw new Error(`${fieldName} must be a valid number`);
      }

      return numericValue;
    };

    const booleanFlag = (value) => {
      const normalized = emptyToNull(value);

      if (normalized === null) {
        return 0;
      }

      if (typeof normalized === 'boolean') {
        return normalized ? 1 : 0;
      }

      return ['1', 'true', 'yes', 'on'].includes(
        String(normalized).trim().toLowerCase()
      )
        ? 1
        : 0;
    };

    const [existingRows] = await connection.query(
      `SELECT
          i.id,
          i.current_quantity,
          i.current_stock_value,
          (
            SELECT sb.unit_cost
            FROM stock_batches sb
            WHERE sb.item_id = i.id
              AND sb.tenant_id = i.tenant_id
              AND sb.source_type = 'OPENING'
            ORDER BY sb.id ASC
            LIMIT 1
          ) AS opening_unit_cost
       FROM items i
       WHERE i.id = ? AND i.tenant_id = ?
       FOR UPDATE`,
      [itemId, tenant_id]
    );

    if (!existingRows.length) {
      throw new Error('Item not found');
    }

    const existingItem = existingRows[0];

    const updates = [];
    const values = [];
    const addUpdate = (column, value, shouldUpdate) => {
      if (!shouldUpdate) {
        return;
      }

      updates.push(`${column} = ?`);
      values.push(value);
    };

    addUpdate('type', emptyToNull(type), hasOwn(data, 'type'));
    addUpdate('unit', emptyToNull(unit), hasOwn(data, 'unit'));
    addUpdate('hsn_code', emptyToNull(hsn_code), hasOwn(data, 'hsn_code'));
    addUpdate('sac', emptyToNull(sac), hasOwn(data, 'sac'));
    addUpdate('tax_preference', emptyToNull(tax_preference), hasOwn(data, 'tax_preference'));
    addUpdate(
      'tax_rate_id',
      emptyToNull(gst_rates_id) ?? emptyToNull(tax_rate_id),
      hasOwn(data, 'gst_rates_id') || hasOwn(data, 'tax_rate_id')
    );
    addUpdate('selling_price', numberOrZero(selling_price, 'selling_price'), hasOwn(data, 'selling_price'));
    addUpdate(
      'chartofaccounts_name_id_sales',
      emptyToNull(sales_account_id) ?? emptyToNull(chartofaccounts_name_id_sales),
      hasOwn(data, 'sales_account_id') || hasOwn(data, 'chartofaccounts_name_id_sales')
    );
    addUpdate('sales_account_description', emptyToNull(sales_account_description), hasOwn(data, 'sales_account_description'));
    addUpdate('cost_price', numberOrZero(cost_price, 'cost_price'), hasOwn(data, 'cost_price'));
    addUpdate(
      'chartofaccounts_name_id_purchase',
      emptyToNull(purchase_account_id) ?? emptyToNull(chartofaccounts_name_id_purchase),
      hasOwn(data, 'purchase_account_id') || hasOwn(data, 'chartofaccounts_name_id_purchase')
    );
    addUpdate('purchase_account_description', emptyToNull(purchase_account_description), hasOwn(data, 'purchase_account_description'));
    addUpdate(
      'vendor_master_id',
      emptyToNull(prefered_vendor_id) ?? emptyToNull(vendor_master_id),
      hasOwn(data, 'prefered_vendor_id') || hasOwn(data, 'vendor_master_id')
    );
    addUpdate('name', emptyToNull(name), hasOwn(data, 'name'));
    addUpdate('enable_sales_information', booleanFlag(enable_sales_information), hasOwn(data, 'enable_sales_information'));
    addUpdate('enable_purchase_information', booleanFlag(enable_purchase_information), hasOwn(data, 'enable_purchase_information'));
    addUpdate(
      'item_image',
      uploaded_item_image ?? emptyToNull(body_item_image),
      uploaded_item_image !== null || hasOwn(data, 'item_image')
    );

    const hasStockUpdate =
      hasOwn(data, 'current_quantity') ||
      hasOwn(data, 'current_stock_value') ||
      hasOwn(data, 'unit_cost');

    if (hasStockUpdate) {
      const quantity = hasOwn(data, 'current_quantity')
        ? numberOrZero(current_quantity, 'current_quantity')
        : Number(existingItem.current_quantity || 0);
      const stockValue = hasOwn(data, 'current_stock_value')
        ? numberOrZero(current_stock_value, 'current_stock_value')
        : Number(existingItem.current_stock_value || 0);
      const unitCost = hasOwn(data, 'unit_cost')
        ? numberOrZero(unit_cost, 'unit_cost')
        : Number(existingItem.opening_unit_cost || 0);

      if (quantity < 0) {
        throw new Error('current_quantity cannot be negative');
      }

      if (stockValue < 0) {
        throw new Error('current_stock_value cannot be negative');
      }

      if (unitCost < 0) {
        throw new Error('unit_cost cannot be negative');
      }

      if ((quantity > 0 && stockValue <= 0) || (stockValue > 0 && quantity <= 0)) {
        throw new Error(
          'current_quantity and current_stock_value are both required for opening stock'
        );
      }

      if (quantity > 0 && unitCost <= 0) {
        throw new Error('unit_cost is required for opening stock');
      }

      addUpdate('current_quantity', quantity, true);
      addUpdate('current_stock_value', stockValue, true);

      if (quantity > 0 && stockValue > 0) {
        const [stockRows] = await connection.query(
          `SELECT id FROM stock_batches
           WHERE item_id = ? AND tenant_id = ? AND source_type = 'OPENING'
           LIMIT 1`,
          [itemId, tenant_id]
        );

        if (stockRows.length) {
          await connection.query(
            `UPDATE stock_batches
             SET quantity = ?,
                 remaining_quantity = ?,
                 unit_cost = ?,
                 total_cost = ?,
                 batch_date = NOW()
             WHERE id = ? AND tenant_id = ?`,
            [quantity, quantity, unitCost, stockValue, stockRows[0].id, tenant_id]
          );
        } else {
          await connection.query(
            `INSERT INTO stock_batches (
              item_id,
              source_type,
              source_id,
              quantity,
              remaining_quantity,
              unit_cost,
              total_cost,
              batch_date,
              tenant_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
            [
              itemId,
              'OPENING',
              null,
              quantity,
              quantity,
              unitCost,
              stockValue,
              tenant_id
            ]
          );
        }
      } else {
        await connection.query(
          `DELETE FROM stock_batches
           WHERE item_id = ? AND tenant_id = ? AND source_type = 'OPENING'`,
          [itemId, tenant_id]
        );
      }
    }

    if (hasOwn(data, 'name') && !String(emptyToNull(name) || '').trim()) {
      throw new Error('name is required');
    }

    if (updates.length > 0) {
      await connection.query(
        `UPDATE items
         SET ${updates.join(', ')}
         WHERE id = ? AND tenant_id = ?`,
        [...values, itemId, tenant_id]
      );
    }

    if (hasOwn(data, 'custom_field') && custom_field !== undefined && custom_field !== null && custom_field !== '') {
      const customFieldValues = parseCustomFieldForUpdate(custom_field);

      if (!moduleId) {
        throw new Error('module_id is required when custom_field is provided');
      }

      await connection.query(
        `DELETE FROM custom_field_values
         WHERE module_id = ? AND tenant_id = ? AND record_id = ?`,
        [moduleId, tenant_id, itemId]
      );

      if (customFieldValues && Object.keys(customFieldValues).length > 0) {
        await handleCustomFields({
          connection,
          custom_field: customFieldValues,
          module_id: moduleId,
          tenant_id,
          record_id: itemId
        });
      }
    }

    const [rows] = await connection.query(
      `SELECT
          i.*,
          (
            SELECT sb.unit_cost
            FROM stock_batches sb
            WHERE sb.item_id = i.id
              AND sb.tenant_id = i.tenant_id
              AND sb.source_type = 'OPENING'
            ORDER BY sb.id ASC
            LIMIT 1
          ) AS unit_cost
       FROM items i
       WHERE i.id = ? AND i.tenant_id = ?`,
      [itemId, tenant_id]
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

exports.createPurchaseInvoice = async (
  data,
  tenant_id,
  user_id
) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const {
      vendor_id,
      purchase_invoice_no,
      invoice_no,
      bill_no,
      invoice_date,
      bill_date,
      due_date,
      payment_term,
      term,
      order_no,
      reverse_charge,
      is_reverse_charge,
      subject,
      vendor_notes,
      terms_and_conditions,
      additional_tax,
      additional_tax_rate,
      sub_total,
      tax_amount,
      cgst_amount,
      sgst_amount,
      igst_amount,
      tax_mode,
      vendor_state,
      adjustment_label,
      adjustment_value,
      total,
      custom_field,
      module_id,
      items: purchaseItems
    } = data || {};

    const items = parseInvoiceItems(purchaseItems);
    const purchaseInvoiceNo = normalizeFormValue(
      purchase_invoice_no ?? invoice_no ?? bill_no
    );
    const purchaseInvoiceDate = formatDateForDb(invoice_date ?? bill_date);
    const vendorId = normalizeFormValue(vendor_id);
    const customFieldValues = parseCustomFieldForUpdate(custom_field);
    const moduleId = normalizeFormValue(module_id);
    const toNumber = (value, fieldName, defaultValue = 0) => {
      const normalized = normalizeFormValue(value);

      if (normalized === undefined || normalized === null || normalized === "") {
        return defaultValue;
      }

      const numberValue = Number(normalized);

      if (!Number.isFinite(numberValue)) {
        throw new Error(`${fieldName} must be a valid number`);
      }

      return numberValue;
    };
    const boolFlag = (value) => {
      const normalized = normalizeFormValue(value);

      if (typeof normalized === "boolean") {
        return normalized ? 1 : 0;
      }

      return ["1", "true", "yes", "on"].includes(
        String(normalized || "").trim().toLowerCase()
      )
        ? 1
        : 0;
    };

    if (vendorId === undefined || vendorId === null || vendorId === "") {
      throw new Error('vendor_id is required');
    }

    if (!purchaseInvoiceNo) {
      throw new Error('invoice_no is required');
    }

    if (!purchaseInvoiceDate) {
      throw new Error('invoice_date is required');
    }

    if (!items.length) {
      throw new Error('At least one purchase item is required');
    }

    const [vendorRows] = await connection.query(
      `SELECT id FROM vendor_master WHERE id = ? AND tenant_id = ? LIMIT 1`,
      [vendorId, tenant_id]
    );

    if (vendorRows.length === 0) {
      throw new Error('Vendor not found');
    }

    const [duplicateInvoice] = await connection.query(
      `SELECT id FROM purchase_invoice_master WHERE invoice_no = ? AND tenant_id = ? LIMIT 1`,
      [purchaseInvoiceNo, tenant_id]
    );

    if (duplicateInvoice.length > 0) {
      throw new Error('Purchase invoice already exists');
    }

    for (const item of items) {
      const itemId = normalizeFormValue(item?.item_id);
      const quantity = toNumber(item?.quantity, 'quantity');
      const rate = toNumber(item?.rate, 'rate');

      if (itemId === undefined || itemId === null || itemId === "") {
        throw new Error('item_id is required');
      }

      if (quantity <= 0) {
        throw new Error(`Invalid quantity for item ${itemId}`);
      }

      if (rate < 0) {
        throw new Error(`Invalid rate for item ${itemId}`);
      }

      const [itemRows] = await connection.query(
        `SELECT id FROM items WHERE id = ? AND tenant_id = ? LIMIT 1`,
        [itemId, tenant_id]
      );

      if (itemRows.length === 0) {
        throw new Error(`Item not found: ${itemId}`);
      }
    }

    const masterColumns = [
      'vendor_id',
      'invoice_no',
      'invoice_date',
      'due_date',
      'payment_term',
      'term',
      'order_no',
      'reverse_charge',
      'is_reverse_charge',
      'subject',
      'vendor_notes',
      'terms_and_conditions',
      'additional_tax',
      'additional_tax_rate',
      'sub_total',
      'tax_amount',
      'cgst_amount',
      'sgst_amount',
      'igst_amount',
      'tax_mode',
      'vendor_state',
      'adjustment_label',
      'adjustment_value',
      'total',
      'tenant_id',
      'user_id'
    ];

    const masterValues = [
      vendorId,
      purchaseInvoiceNo,
      purchaseInvoiceDate,
      formatDateForDb(due_date),
      normalizeFormValue(payment_term) ?? null,
      normalizeFormValue(term) ?? null,
      normalizeFormValue(order_no) ?? null,
      boolFlag(reverse_charge),
      boolFlag(is_reverse_charge),
      normalizeFormValue(subject) ?? null,
      normalizeFormValue(vendor_notes) ?? null,
      normalizeFormValue(terms_and_conditions) ?? null,
      normalizeFormValue(additional_tax) ?? null,
      toNumber(additional_tax_rate, 'additional_tax_rate'),
      toNumber(sub_total, 'sub_total'),
      toNumber(tax_amount, 'tax_amount'),
      toNumber(cgst_amount, 'cgst_amount'),
      toNumber(sgst_amount, 'sgst_amount'),
      toNumber(igst_amount, 'igst_amount'),
      normalizeFormValue(tax_mode) ?? null,
      normalizeFormValue(vendor_state) ?? null,
      normalizeFormValue(adjustment_label) ?? null,
      toNumber(adjustment_value, 'adjustment_value'),
      toNumber(total, 'total'),
      tenant_id,
      user_id
    ];

    const [invoiceResult] = await connection.query(
      `INSERT INTO purchase_invoice_master (${masterColumns.join(', ')})
       VALUES (${masterColumns.map(() => '?').join(', ')})`,
      masterValues
    );

    const invoiceId = invoiceResult.insertId;

    for (const item of items) {
      const itemId = normalizeFormValue(item.item_id);
      const quantity = toNumber(item.quantity, 'quantity');
      const rate = toNumber(item.rate, 'rate');
      const amount = quantity * rate;

      await connection.query(
        `INSERT INTO purchase_invoice_items (
          purchase_invoice_master_id,
          item_id,
          item_name,
          item_description,
          item_type,
          hsn_sac,
          quantity,
          rate,
          tax,
          unit,
          amount,
          tenant_id,
          user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          invoiceId,
          itemId,
          normalizeFormValue(item.item_name) ?? null,
          normalizeFormValue(item.item_description) ?? null,
          normalizeFormValue(item.item_type) ?? null,
          normalizeFormValue(item.hsn_sac) ?? null,
          quantity,
          rate,
          normalizeFormValue(item.tax) ?? null,
          normalizeFormValue(item.unit) ?? null,
          amount,
          tenant_id,
          user_id
        ]
      );

      await connection.query(
        `INSERT INTO stock_batches (
          item_id,
          source_type,
          source_id,
          quantity,
          remaining_quantity,
          unit_cost,
          total_cost,
          batch_date,
          tenant_id
        ) VALUES (?, 'PURCHASE_INVOICE', ?, ?, ?, ?, ?, ?, ?)`,
        [
          itemId,
          invoiceId,
          quantity,
          quantity,
          rate,
          amount,
          purchaseInvoiceDate,
          tenant_id
        ]
      );

      await connection.query(
        `UPDATE items
        SET
          current_quantity = current_quantity + ?,
          current_stock_value = current_stock_value + ?
        WHERE id = ? AND tenant_id = ?`,
        [
          quantity,
          amount,
          itemId,
          tenant_id
        ]
      );

      await connection.query(
        `INSERT INTO stock_movements (
          item_id,
          transaction_type,
          transaction_id,
          quantity,
          unit_cost,
          total_cost,
          movement_date,
          tenant_id
        ) VALUES (?, 'PURCHASE_INVOICE', ?, ?, ?, ?, ?, ?)`,
        [
          itemId,
          invoiceId,
          quantity,
          rate,
          amount,
          purchaseInvoiceDate,
          tenant_id
        ]
      );
    }

    if (customFieldValues && Object.keys(customFieldValues).length > 0) {
      if (!moduleId) {
        throw new Error("module_id is required when custom_field is provided");
      }

      await handleCustomFields({
        connection,
        custom_field: customFieldValues,
        module_id: moduleId,
        tenant_id,
        record_id: invoiceId
      });
    }

    const [masterRows] = await connection.query(
      `SELECT * FROM purchase_invoice_master WHERE id = ? AND tenant_id = ?`,
      [invoiceId, tenant_id]
    );

    const [itemRows] = await connection.query(
      `SELECT * FROM purchase_invoice_items WHERE purchase_invoice_master_id = ? AND tenant_id = ? ORDER BY id ASC`,
      [invoiceId, tenant_id]
    );

    await connection.commit();

    return {
      ...masterRows[0],
      items: itemRows
    };

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
        (
          SELECT sb.unit_cost
          FROM stock_batches sb
          WHERE sb.item_id = i.id
            AND sb.tenant_id = i.tenant_id
            AND sb.source_type = 'OPENING'
          ORDER BY sb.id ASC
          LIMIT 1
        ) AS unit_cost,
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

exports.insertUnit = async (data, tenant_id, user_id) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { unit_name, symbol, status = 1 } = data || {};

    if (!unit_name) {
      throw new Error('unit_name is required');
    }

    if (!symbol) {
      throw new Error('symbol is required');
    }

    const [result] = await connection.query(
      `INSERT INTO units (unit_name, symbol, tenant_id, user_id, status)
       VALUES (?, ?, ?, ?, ?)`,
      [unit_name, symbol, tenant_id, user_id, status]
    );

    const [rows] = await connection.query(
      `SELECT * FROM units WHERE id = ?`,
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

exports.fetchUnits = async (tenant_id) => {
  const [rows] = await db.query(
    "SELECT * FROM units WHERE tenant_id = ? ORDER BY id DESC",
    [tenant_id]
  );

  return rows;
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

exports.insertPaymentTerm = async (data, tenant_id, user_id) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { term_name, name, no_of_days, status = 1 } = data || {};
    const paymentTermName = term_name ?? name;

    if (paymentTermName === undefined || paymentTermName === null || paymentTermName === "") {
      throw new Error('term_name is required');
    }

    if (no_of_days === undefined || no_of_days === null) {
      throw new Error('no_of_days is required');
    }

    const [result] = await connection.query(
      `INSERT INTO payment_terms (term_name, no_of_days, tenant_id, user_id, status)
       VALUES (?, ?, ?, ?, ?)`,
      [paymentTermName, no_of_days, tenant_id, user_id, status]
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

exports.createPaymentTerm = async (data, tenant_id, user_id) => {
  return exports.insertPaymentTerm(data, tenant_id, user_id);
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
          `SELECT cf.id
           FROM custom_fields cf
           INNER JOIN custom_field_module_assignment cfma
             ON cfma.custome_field_id = cf.id
           WHERE cf.field_name = ?
             AND cfma.module_id = ?
             AND cf.status = 1
             AND cfma.status = 1`,
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

    const { tax_rate_name, tax_rate_percentage } = data || {};

    if (!tax_rate_name) {
      throw new Error('tax_rate_name is required');
    }

    if (tax_rate_percentage === undefined || tax_rate_percentage === null) {
      throw new Error('tax_rate_percentage is required');
    }

    const [result] = await connection.query(
      `INSERT INTO tax_rate (tax_rate_name, tax_rate_percentage, tenant_id, user_id)
       VALUES (?, ?, ?, ?)`,
      [tax_rate_name, tax_rate_percentage, tenant_id, user_id]
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









        








