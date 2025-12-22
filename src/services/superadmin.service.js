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
