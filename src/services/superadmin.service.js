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
    entity_type,
    field_key,
    label,
    field_type,
    default_value,
    sort_order,
    grid_col,
    is_disabled,
    admin_only,
    is_required,
    show_on_table,
  } = data;

  // Validation
  if (!module_id) throw new Error("Module is required");
  if (!entity_type) throw new Error("Entity type is required");
  if (!field_key) throw new Error("Field key is required");
  if (!label) throw new Error("Label is required");

  // Normalize numbers (INT columns)
  const finalModuleId =
    module_id !== undefined && module_id !== null && module_id !== "" && module_id !== "null"
      ? Number(module_id)
      : null;

  const finalSortOrder =
    sort_order !== undefined && sort_order !== null && sort_order !== "" && sort_order !== "null"
      ? Number(sort_order)
      : 0;

  const finalGridCol =
    grid_col !== undefined && grid_col !== null && grid_col !== "" && grid_col !== "null"
      ? Number(grid_col)
      : 12;

  // Normalize booleans (TINYINT)
  const toTinyInt = (v) => (v === true || v === 1 || v === "1" || v === "true" ? 1 : 0);

  const finalDisabled = toTinyInt(is_disabled);
  const finalAdminOnly = toTinyInt(admin_only);
  const finalRequired = toTinyInt(is_required);
  const finalShowOnTable = toTinyInt(show_on_table);

  // Default type
  const finalFieldType = field_type || "text";

  // Insert into MySQL
  const [result] = await db.query(
    `INSERT INTO dynamic_fields
      (module_id, entity_type, field_key, label, field_type, default_value, sort_order, grid_col,
       is_disabled, admin_only, is_required, show_on_table)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      finalModuleId,
      entity_type,
      field_key,
      label,
      finalFieldType,
      default_value ?? null,
      finalSortOrder,
      finalGridCol,
      finalDisabled,
      finalAdminOnly,
      finalRequired,
      finalShowOnTable,
    ]
  );

  // Return created record
  return {
    id: result.insertId,
    module_id: finalModuleId,
    entity_type,
    field_key,
    label,
    field_type: finalFieldType,
    default_value: default_value ?? null,
    sort_order: finalSortOrder,
    grid_col: finalGridCol,
    is_disabled: finalDisabled,
    admin_only: finalAdminOnly,
    is_required: finalRequired,
    show_on_table: finalShowOnTable,
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

// exports.getAll = async () => {
//   const result = await db.query('SELECT * FROM tenants ORDER BY id');
//   return result.rows;
// };
