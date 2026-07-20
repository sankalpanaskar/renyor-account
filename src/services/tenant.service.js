const db = require('../config/db');
const bcrypt = require('bcryptjs');
const fs = require('fs/promises');
const path = require('path');

const publicRoot = path.resolve(__dirname, '..', '..', 'public');

const buildTenantLogoPath = (tenantId, fileName) =>
  path.join('uploads', 'tenants', String(tenantId), fileName).replace(/\\/g, '/');

const moveTenantLogoFile = async (logoFile, tenantId) => {
  if (!logoFile?.path || !logoFile?.filename) {
    return null;
  }

  const destinationDir = path.join(publicRoot, 'uploads', 'tenants', String(tenantId));
  const destinationPath = path.join(destinationDir, logoFile.filename);

  await fs.mkdir(destinationDir, { recursive: true });
  await fs.rename(logoFile.path, destinationPath);

  return buildTenantLogoPath(tenantId, logoFile.filename);
};

exports.create = async (data, logoFile = null) => {
  
  const connection = await db.getConnection(); // for transaction
  let tenantId = null;
  let movedLogoPath = null;
 
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
    const logoValue = logoFile ? null : logo || null;
    
    if (!name || !email) {
      throw new Error("Company name and email are required");
    }

    const [tenantResult] = await connection.query(
      `INSERT INTO tenants (
        package_id, name, logo, industry, email, phone, website,
        address, city, state, country, pin, pan, gst, is_active
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        package_id, name, logoValue, industry, email, phone, website,
        address, city, state, country, pin, pan, gst, is_active
      ]
    );
   
    tenantId = tenantResult.insertId;

    if (logoFile) {
      movedLogoPath = await moveTenantLogoFile(logoFile, tenantId);

      await connection.query(
        'UPDATE tenants SET logo = ? WHERE id = ?',
        [movedLogoPath, tenantId]
      );
    }

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
        tenantId,
        name,
        email,
        hashedPassword,
        1
      ]
    );
     
    await connection.commit();
    //return data;
    const [rows] = await connection.query(
      'SELECT * FROM tenants WHERE id = ?',
      [tenantId]
    );

    return rows[0];

    

  } catch (error) {
    await connection.rollback();
    if (movedLogoPath) {
      const movedLogoAbsolutePath = path.resolve(publicRoot, movedLogoPath);
      await fs.unlink(movedLogoAbsolutePath).catch(() => {});
    }
    if (logoFile?.path) {
      await fs.unlink(logoFile.path).catch(() => {});
    }
    throw error;
  } finally {
    connection.release();
  }
};





exports.getAll = async () => {
  const [result] = await db.query('SELECT t.*, p.package_name FROM tenants t LEFT JOIN packages p ON t.package_id = p.id ORDER BY t.id');
  return result;
};

exports.getById = async (tenant_id) => {
  const [result] = await db.query(
    'SELECT t.*, p.package_name FROM tenants t LEFT JOIN packages p ON t.package_id = p.id WHERE t.id = ? LIMIT 1',
    [tenant_id]
  );
  return result[0] || null;
};
