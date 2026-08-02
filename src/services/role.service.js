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
    `SELECT
        r.id AS role_id,
        r.tenant_id AS role_tenant_id,
        r.role_name,
        r.remarks,
        r.status AS role_status,
        r.created_at AS role_created_at,
        r.updated_at AS role_updated_at,
        rma.id AS role_menu_access_id,
        rma.menu_id,
        rma.can_view,
        rma.can_create,
        rma.can_edit,
        rma.can_delete,
        mm.menu_name
     FROM roles AS r
     LEFT JOIN role_menu_access AS rma
       ON rma.role_id = r.id
     LEFT JOIN menu_modules AS mm
       ON mm.id = rma.menu_id
     WHERE r.tenant_id = ?
     ORDER BY r.id, mm.menu_name`,
    [tenant_id]
  );

  const rolesMap = new Map();

  rows.forEach((row) => {
    if (!rolesMap.has(row.role_id)) {
      rolesMap.set(row.role_id, {
        id: row.role_id,
        tenant_id: row.role_tenant_id,
        role_name: row.role_name,
        remarks: row.remarks,
        status: row.role_status,
        created_at: row.role_created_at,
        updated_at: row.role_updated_at,
        menus: []
      });
    }

    if (row.role_menu_access_id) {
      rolesMap.get(row.role_id).menus.push({
        role_menu_access_id: row.role_menu_access_id,
        menu_id: row.menu_id,
        menu_name: row.menu_name,
        can_view: row.can_view,
        can_create: row.can_create,
        can_edit: row.can_edit,
        can_delete: row.can_delete
      });
    }
  });

  return Array.from(rolesMap.values());
};

