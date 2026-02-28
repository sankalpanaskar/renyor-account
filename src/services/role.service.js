const db = require('../config/db');


// exports.create = async (data,tenant_id) => {
//  const { role_name, remarks, permissions } = data;
//     const [result] = await db.query(
//       'INSERT INTO roles (tenant_id, role_name,remarks) VALUES (?, ?, ?)',
//       [tenant_id, role_name, remarks]
//     );

//     const [rows] = await db.query(
//       'SELECT * FROM roles WHERE id = ?',
//       [result.insertId]
//     );

//     return rows[0];
  
// };

exports.create = async (data, tenant_id) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    //console.log(data);
    let { role_name, remarks, permissions } = data;
    if (typeof permissions === "string") {
      permissions = JSON.parse(permissions);
    }

    // 1️⃣ Insert role
    const [result] = await connection.query(
      'INSERT INTO roles (tenant_id, role_name, remarks) VALUES (?, ?, ?)',
      [tenant_id, role_name, remarks]
    );

    const roleId = result.insertId;

    // 2️⃣ Insert permissions (bulk insert)
    console.log(permissions);
    if (permissions && permissions.length > 0) {
      const values = permissions.map(module => [
        tenant_id,
        roleId,
        module.module_id,
        module.view ? 1 : 0,
        module.create ? 1 : 0,
        module.edit ? 1 : 0,
        module.delete ? 1 : 0
      ]);

      await connection.query(
        `INSERT INTO role_menu_access
        (tenant_id, role_id, menu_id, can_view, can_create, can_edit, can_delete)
        VALUES ?`,
        [values]
      );
    }

    await connection.commit();

    const [rows] = await connection.query(
      'SELECT * FROM roles WHERE id = ?',
      [roleId]
    );

    return rows[0];

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

exports.getAll = async (tenant_id) => {
  const [rows] = await db.query(
    'SELECT * FROM roles WHERE tenant_id = ? ORDER BY id',
    [tenant_id]
  );
  return rows;
};



