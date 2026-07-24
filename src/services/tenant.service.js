const db = require('../config/db');
const bcrypt = require('bcryptjs');
const fs = require('fs/promises');
const path = require('path');

const publicRoot = path.resolve(__dirname, '..', '..', 'public');

const buildTenantLogoPath = (tenantId, fileName) =>
  path.join('uploads', 'tenants', String(tenantId), fileName).replace(/\\/g, '/');

const deleteFileIfExists = async (filePath) => {
  if (!filePath) {
    return;
  }

  await fs.unlink(filePath).catch(() => {});
};

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

    const [packageRows] = await connection.query(
      `SELECT package_period, final_price
       FROM packages
       WHERE id = ?
       LIMIT 1`,
      [package_id]
    );

    if (!packageRows.length) {
      throw new Error("Package not found");
    }

    const { package_period, final_price } = packageRows[0];

    await connection.query(
      `INSERT INTO subscriptions (
        tenant_id,
        package_id,
        start_date,
        end_date,
        amount,
        payment_status,
        payment_method,
        transaction_id,
        invoice_id,
        created_at,
        updated_at
      ) VALUES (?, ?, CURRENT_DATE(), DATE_ADD(CURRENT_DATE(), INTERVAL ? DAY), ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        tenantId,
        package_id,
        package_period,
        final_price,
        "paid",
        "NA",
        "NA",
        "NA"
      ]
    );

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

exports.updateById = async (tenantId, data, logoFile = null) => {
  const connection = await db.getConnection();
  let movedLogoPath = null;
  let oldLogoPath = null;

  try {
    await connection.beginTransaction();

    const [existingRows] = await connection.query(
      'SELECT * FROM tenants WHERE id = ? FOR UPDATE',
      [tenantId]
    );

    if (!existingRows.length) {
      throw new Error('Tenant not found');
    }

    const existingTenant = existingRows[0];
    oldLogoPath = existingTenant.logo || null;

    const updates = [];
    const values = [];
    const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj || {}, key);
    const addUpdate = (column, value, shouldUpdate) => {
      if (!shouldUpdate) {
        return;
      }

      updates.push(`${column} = ?`);
      values.push(value ?? null);
    };

    addUpdate('package_id', data.package_id, hasOwn(data, 'package_id'));
    addUpdate('name', data.name, hasOwn(data, 'name'));
    addUpdate('industry', data.industry, hasOwn(data, 'industry'));
    addUpdate('email', data.email, hasOwn(data, 'email'));
    addUpdate('phone', data.phone, hasOwn(data, 'phone'));
    addUpdate('website', data.website, hasOwn(data, 'website'));
    addUpdate('address', data.address, hasOwn(data, 'address'));
    addUpdate('city', data.city, hasOwn(data, 'city'));
    addUpdate('state', data.state, hasOwn(data, 'state'));
    addUpdate('country', data.country, hasOwn(data, 'country'));
    addUpdate('pin', data.pin, hasOwn(data, 'pin'));
    addUpdate('pan', data.pan, hasOwn(data, 'pan'));
    addUpdate('gst', data.gst, hasOwn(data, 'gst'));
    addUpdate('is_active', data.is_active, hasOwn(data, 'is_active'));

    if (logoFile) {
      movedLogoPath = await moveTenantLogoFile(logoFile, tenantId);
      addUpdate('logo', movedLogoPath, true);
    } else if (hasOwn(data, 'logo')) {
      addUpdate('logo', data.logo, true);
    }

    if (updates.length > 0) {
      await connection.query(
        `UPDATE tenants
         SET ${updates.join(', ')}
         WHERE id = ?`,
        [...values, tenantId]
      );
    }

    await connection.commit();

    if (logoFile && oldLogoPath && oldLogoPath !== movedLogoPath) {
      const oldLogoAbsolutePath = path.resolve(publicRoot, oldLogoPath);
      await deleteFileIfExists(oldLogoAbsolutePath);
    }

    const [rows] = await connection.query(
      'SELECT * FROM tenants WHERE id = ?',
      [tenantId]
    );

    return rows[0] || null;
  } catch (error) {
    await connection.rollback();
    if (movedLogoPath) {
      const movedLogoAbsolutePath = path.resolve(publicRoot, movedLogoPath);
      await deleteFileIfExists(movedLogoAbsolutePath);
    }
    if (logoFile?.path) {
      await deleteFileIfExists(logoFile.path);
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
