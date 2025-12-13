const db = require('../config/db');

exports.create = async (tenant_id, name) => {
  const result = await db.query(
    'INSERT INTO roles (tenant_id, name) VALUES ($1, $2) RETURNING *',
    [tenant_id, name]
  );
  return result.rows[0];
};

exports.getAll = async (tenant_id) => {
  const result = await db.query(
    'SELECT * FROM roles WHERE tenant_id = $1 ORDER BY id',
    [tenant_id]
  );
  return result.rows;
};
