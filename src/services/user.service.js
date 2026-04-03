const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.create = async (data,tenant_id) => {
  const { role_id, name, email, phone, module_id,custom_fields } = data;
  console.log(data);

 

  // 🔐 Default password
  const DEFAULT_PASSWORD = "1234567";

  // Hash password
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  // Insert user
  const [result] = await db.query(
    `INSERT INTO users (tenant_id, role_id, name, email,phone, password,is_company_super_admin)
     VALUES (?, ?, ?, ?, ?,?,?)`,
    [tenant_id, role_id, name, email,phone, hashedPassword,0]
  );

    const userId = result.insertId;

    if (custom_fields) {

      for (const key in custom_fields) {

        // Get field id
        const [field] = await db.query(
          "SELECT id FROM custom_fields WHERE field_name=? AND module_id=?",
          [key, module_id]
        );

        if(field.length){

          const fieldId = field[0].id;
          const value = custom_fields[key];

          await db.query(
            `INSERT INTO custom_field_values 
            (module_id,record_id,field_id,value) 
            VALUES (?,?,?,?)`,
            [module_id,userId,fieldId,value]
          );

        }

      }

    }

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
    'SELECT u.id,u.tenant_id,u.role_id,COALESCE(r.role_name,"superadmin") AS role_name,u.name,u.email,u.phone FROM users u LEFT JOIN roles r ON r.id=u.role_id WHERE u.tenant_id=? ORDER BY u.id',
    [tenant_id]
  );

  return rows;
};

