const db = require('../config/db');

exports.create = async (data) => {
  const result = await db.query(
    'INSERT INTO permissions (module, action) VALUES ($1, $2) RETURNING *',
    [data.module, data.action]
  );
  return result.rows[0];
};

exports.assign = async (roleId, permissionId) => {
  await db.query(
    'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)',
    [roleId, permissionId]
  );
};

exports.getForRole = async (roleId) => {
  const result = await db.query(
    `SELECT p.id, p.module, p.action
     FROM role_permissions rp
     JOIN permissions p ON p.id = rp.permission_id
     WHERE rp.role_id = $1`,
    [roleId]
  );
  return result.rows;
};
