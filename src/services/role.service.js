const db = require('../config/db');


exports.create = async (data,tenant_id) => {
 const { role_name, remarks } = data;
    const [result] = await db.query(
      'INSERT INTO roles (tenant_id, role_name,remarks) VALUES (?, ?, ?)',
      [tenant_id, role_name, remarks]
    );

    const [rows] = await db.query(
      'SELECT * FROM roles WHERE id = ?',
      [result.insertId]
    );

    return rows[0];
  
};


exports.getAll = async (tenant_id) => {
  const result = await db.query(
    'SELECT * FROM roles WHERE tenant_id = $1 ORDER BY id',
    [tenant_id]
  );
  return result.rows;
};
