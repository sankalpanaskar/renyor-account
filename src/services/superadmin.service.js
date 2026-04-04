const db = require('../config/db');
const bcrypt = require("bcryptjs");

exports.create = async (data) => {
  const { name, email, password } = data;

  // 1. Check if system super admin already exists
  const [existingRows] = await db.query(
    `SELECT id FROM users WHERE is_system_super_admin = 1`
  );

  if (existingRows.length > 0) {
    throw new Error("Project Super Admin already exists");
  }

  // 2. Validate input
  if (!name || !email || !password) {
    throw new Error("Name, email and password are required");
  }

  // 3. Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 4. INSERT (NO RETURNING in MySQL)
  const [result] = await db.query(
    `INSERT INTO users 
     (name, email, password, is_system_super_admin, tenant_id, role_id)
     VALUES (?, ?, ?, 1, NULL, NULL)`,
    [name, email, hashedPassword]
  );

  // 5. Return created user manually
  return {
    id: result.insertId,
    name,
    email,
    is_system_super_admin: true
  };
};

exports.assignModuleInPackage=async(data) =>{
  const { package_id, parent_id, module_id } = data;

  const values = module_id.map(id => [
    package_id,
    id,
    parent_id,
    1
  ]);

  return db.query(
    `
    INSERT INTO package_modules
      (package_id, menu_id, parent_menu_id, status)
    VALUES ?
    `,
    [values]
  );
};


exports.packageCreate = async (data) => {
  const { package_name, package_type, package_details, base_price, offer_price, final_price } = data;

  // Validation
  if (!package_name || !package_details) {
    throw new Error("Package Name and Description are required");
   
  }

  // Insert into MySQL (NO RETURNING)
  const [result] = await db.query(
    `INSERT INTO packages (package_name, package_type, package_details, base_price, offer_price, final_price)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [package_name, package_type, package_details, base_price, offer_price, final_price]
  );

  // Manually return created record
  return {
    id: result.insertId,
    package_name,
    package_details
  };
};
exports.getPackages = async () => {
  const [rows] = await db.query(
    `SELECT 
        *
     FROM packages
     ORDER BY id DESC`
  );

  return rows; // array (can be empty)
};

exports.fetchSubMenuBasedOnParentMenu = async (parentMenuId) => {
  const [rows] = await db.query(
    `SELECT 
        *
     FROM menu_modules
     WHERE parent_id = ?
     ORDER BY id DESC`,
    [parentMenuId] // 👈 value binding
  );

  return rows; // array (can be empty)
};

exports.createMenuSubmenu = async (data) => {
  const { menu_name, parent_id , icon,link} = data;

  // Validation
  if (!menu_name) {
    throw new Error("Menu Name are required");
  }

  // Normalize parent_id (INTEGER column)
  const finalParentId =
    parent_id !== undefined &&
    parent_id !== null &&
    parent_id !== "" &&
    parent_id !== "null"
      ? parent_id
      : null;

  // Insert into MySQL
  const [result] = await db.query(
    `INSERT INTO menu_modules (menu_name, parent_id, menu_pic, link)
     VALUES (?, ?, ?, ?)`,
    [menu_name, finalParentId, icon, link]
  );

  // Manually return created record
  return {
    id: result.insertId,
    menu_name,
    parent_id: finalParentId
  };
};
exports.customFieldCreate = async (data) => {
  const {
    module_id,
    field_name,
    field_label,
    field_type,
    field_options,
    placeholder,
    default_value,
    validation_type,
    min_length,
    max_length,
    field_order,
    is_required,
    show_in_form,
    show_in_list,
    status
  } = data;

  // Validation
  if (!module_id) throw new Error("Table name is required");
  if (!field_name) throw new Error("Field name is required");
  if (!field_label) throw new Error("Field label is required");

  // Normalize numbers
  const finalMinLength =
    min_length !== undefined && min_length !== null && min_length !== ""
      ? Number(min_length)
      : null;

  const finalMaxLength =
    max_length !== undefined && max_length !== null && max_length !== ""
      ? Number(max_length)
      : null;

  const finalFieldOrder =
    field_order !== undefined && field_order !== null && field_order !== ""
      ? Number(field_order)
      : 0;

  // Convert boolean → tinyint
  const toTinyInt = (v) =>
    v === true || v === 1 || v === "1" || v === "true" ? 1 : 0;

  const finalRequired = toTinyInt(is_required);
  const finalShowForm = show_in_form !== undefined ? toTinyInt(show_in_form) : 1;
  const finalShowList = show_in_list !== undefined ? toTinyInt(show_in_list) : 1;
  const finalStatus = status !== undefined ? toTinyInt(status) : 1;

  // Default field type
  const finalFieldType = field_type || "text";

  // Insert Query
  const [result] = await db.query(
    `INSERT INTO custom_fields
    (
      module_id,
      field_name,
      field_label,
      field_type,
      field_options,
      placeholder,
      default_value,
      validation_type,
      min_length,
      max_length,
      field_order,
      is_required,
      show_in_form,
      show_in_list,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      module_id,
      field_name,
      field_label,
      finalFieldType,
      field_options ?? null,
      placeholder ?? null,
      default_value ?? null,
      validation_type ?? null,
      finalMinLength,
      finalMaxLength,
      finalFieldOrder,
      finalRequired,
      finalShowForm,
      finalShowList,
      finalStatus
    ]
  );

  // Return created record
  return {
    id: result.insertId,
    module_id,
    field_name,
    field_label,
    field_type: finalFieldType,
    field_options: field_options ?? null,
    placeholder: placeholder ?? null,
    default_value: default_value ?? null,
    validation_type: validation_type ?? null,
    min_length: finalMinLength,
    max_length: finalMaxLength,
    field_order: finalFieldOrder,
    is_required: finalRequired,
    show_in_form: finalShowForm,
    show_in_list: finalShowList,
    status: finalStatus
  };
};



exports.fetchMenuStructure = async () => {
  const [rows] = await db.query(
    `
    SELECT id, menu_name, parent_id,menu_pic,link
    FROM menu_modules
    WHERE status = 1
    ORDER BY parent_id, id`
  );

  const map = {};
  const menu = [];

  rows.forEach(row => {
    map[row.id] = {
      id: row.id,
      title: row.menu_name,
      parent_id: row.parent_id,
      icon:row.menu_pic,
      link:row.link,
      children: []
    };
  });

  rows.forEach(row => {
    if (row.parent_id === 0) {
      menu.push(map[row.id]);
    } else if (map[row.parent_id]) {
      map[row.parent_id].children.push(map[row.id]);
    }
  });

  return menu;
};

exports.fetchParentMenu = async () => {
  const [rows] = await db.query(
    `SELECT 
        *
     FROM menu_modules
     where parent_id=0`
  );

  return rows; // array (can be empty)
};



exports.fetchChildMenu = async () => {
  const [rows] = await db.query(
    `SELECT 
        *
     FROM menu_modules
     where parent_id!=0`
  );

  return rows; // array (can be empty)
};

exports.fetchFieldsByTable = async (module_id) => {   // <-- parameter name updated
  try {
    const query = `
      SELECT * FROM custom_fields
      WHERE module_id = ? AND show_in_form = 1 AND status = 1
      ORDER BY field_order ASC
    `;
    const [rows] = await db.query(query, [module_id]);
    return rows;
  } catch (err) {
    throw new Error(err.message || "Error fetching fields from DB");
  }
};

// exports.getAll = async () => {
//   const result = await db.query('SELECT * FROM tenants ORDER BY id');
//   return result.rows;
// };
