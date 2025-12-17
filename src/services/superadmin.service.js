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
  const { package_name, package_type, description, base_price, offer_price, final_price } = data;

  // Validation
  if (!package_name || !description) {
    throw new Error("Package Name and Description are required");
  }

  // Insert into MySQL (NO RETURNING)
  const [result] = await db.query(
    `INSERT INTO packages (package_name, package_type, description, base_price, offer_price, final_price)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [package_name, package_type, description, base_price, offer_price, final_price]
  );

  // Manually return created record
  return {
    id: result.insertId,
    package_name,
    description
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

exports.createPackageModule = async (data) => {
  const { package_id, module_name, parent_id } = data;

  // Validation
  if (!package_id || !module_name) {
    throw new Error("Package Id and Module Name are required");
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
    `INSERT INTO package_modules (package_id, module_name, parent_id)
     VALUES (?, ?, ?)`,
    [package_id, module_name, finalParentId]
  );

  // Manually return created record
  return {
    id: result.insertId,
    package_id,
    module_name,
    parent_id: finalParentId
  };
};

// exports.getAll = async () => {
//   const result = await db.query('SELECT * FROM tenants ORDER BY id');
//   return result.rows;
// };
