const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.create = async (data) => {
  
  const connection = await db.getConnection(); // for transaction
 
  try {
     
    await connection.beginTransaction();
    
    const {
      package_id,
      name,
      logo,
      industry,
      email,
      phone,
      website,
      address,
      city,
      state,
      country,
      pin,
      pan,
      gst,
      is_active = 1
    } = data;
    
    if (!name || !email) {
      throw new Error("Company name and email are required");
    }

    const [tenantResult] = await connection.query(
      `INSERT INTO tenants (
        package_id, name, logo, industry, email, phone, website,
        address, city, state, country, pin, pan, gst, is_active
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        package_id, name, logo, industry, email, phone, website,
        address, city, state, country, pin, pan, gst, is_active
      ]
    );
   return data;
    const tenant_id = tenantResult.insertId;

    const DEFAULT_PASSWORD = "1234567";
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    const DEFAULT_ROLE_ID = 1;

    await connection.query(
      `INSERT INTO users (
        tenant_id,
        name,
        email,
        password,
        is_company_super_admin
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        tenant_id,
        name,
        email,
        hashedPassword,
        1
      ]
    );

    await connection.commit();

    const [rows] = await connection.query(
      'SELECT * FROM tenants WHERE id = ?',
      [tenant_id]
    );

    return rows[0];

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};





exports.getAll = async () => {
  const result = await db.query('SELECT * FROM tenants ORDER BY id');
  return result.rows;
};
