const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.create = async (data) => {
  const { tenant_id,role_id, name, email } = data;

  if (!tenant_id  || !name || !email) {
    throw new Error("tenant_id, name and email are required");
  }

  // 🔐 Default password
  const DEFAULT_PASSWORD = "1234567";

  // Hash password
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  // Insert user
  const [result] = await db.query(
    `INSERT INTO users (tenant_id, role_id, name, email, password,is_company_super_admin)
     VALUES (?, ?, ?, ?, ?,?)`,
    [tenant_id, role_id, name, email, hashedPassword,1]
  );

  // Return user info (never return password)
  return {
    id: result.insertId,
    tenant_id,
    role_id,
    name,
    email
  };
};


exports.getAll = async (tenant_id) => {
  const result = await db.query(
    'SELECT id, tenant_id, role_id, name, email FROM users WHERE tenant_id = $1 ORDER BY id',
    [tenant_id]
  );
  return result.rows;
};
