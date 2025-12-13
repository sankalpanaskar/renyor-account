const db = require('../config/db');

exports.create = async (data) => {
  const { name,package_id } = data;

  if (!name) {
    throw new Error("Tenant name is required");
  }

  // Insert into MySQL
  const [result] = await db.query(
    'INSERT INTO tenants (name,package_id) VALUES (?,?)',
    [name,package_id]
  );

  // Return created tenant manually
  return {
    id: result.insertId,
    name
  };
};


exports.getAll = async () => {
  const result = await db.query('SELECT * FROM tenants ORDER BY id');
  return result.rows;
};
