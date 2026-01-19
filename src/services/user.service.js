const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.create = async (data,tenant_id) => {
  const { role_id, name, email, phone } = data;
  console.log(data);

 

  // 🔐 Default password
  const DEFAULT_PASSWORD = "1234567";

  // Hash password
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  // Insert user
  const [result] = await db.query(
    `INSERT INTO users (tenant_id, role_id, name, email,phone, password,is_company_super_admin)
     VALUES (?, ?, ?, ?, ?,?,?)`,
    [tenant_id, role_id, name, email,phone, hashedPassword,1]
  );

  // Return user info (never return password)
  return {
    id: result.insertId,
    tenant_id,
    role_id,
    name,
    email,
    phone
  };
};


exports.getAll = async (tenant_id) => {
  const [rows] = await db.query(
    'SELECT u.id,u.tenant_id,u.role_id,COALESCE(r.role_name,"superadmin") AS role_name,u.name,u.email FROM users u LEFT JOIN roles r ON r.id=u.role_id WHERE u.tenant_id=? ORDER BY u.id',
    [tenant_id]
  );

  return rows;
};

