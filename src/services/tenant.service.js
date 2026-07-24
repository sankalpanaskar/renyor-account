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

exports.createSubscription = async (data) => {
  const {
    tenant_id,
    package_id,
    payment_status = "NA",
    payment_method = "NA",
    transaction_id = "NA",
    invoice_id = "NA"
  } = data;

  if (!tenant_id) {
    throw new Error("tenant_id is required");
  }

  if (!package_id) {
    throw new Error("package_id is required");
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [tenantRows] = await connection.query(
      `SELECT id
       FROM tenants
       WHERE id = ?
       LIMIT 1
       FOR UPDATE`,
      [tenant_id]
    );

    if (!tenantRows.length) {
      throw new Error("Tenant not found");
    }

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
      `UPDATE subscriptions
       SET status = 0,
           updated_at = CURRENT_TIMESTAMP
       WHERE tenant_id = ?`,
      [tenant_id]
    );

    await connection.query(
      `UPDATE tenants
       SET package_id = ?
       WHERE id = ?`,
      [package_id, tenant_id]
    );

    const [subscriptionResult] = await connection.query(
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
        status,
        created_at,
        updated_at
      ) VALUES (?, ?, CURRENT_DATE(), DATE_ADD(CURRENT_DATE(), INTERVAL ? DAY), ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        tenant_id,
        package_id,
        package_period,
        final_price,
        payment_status,
        payment_method,
        transaction_id,
        invoice_id
      ]
    );

    const [subscriptionRows] = await connection.query(
      `SELECT *
       FROM subscriptions
       WHERE id = ?
       LIMIT 1`,
      [subscriptionResult.insertId]
    );

    await connection.commit();

    return subscriptionRows[0];
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};





exports.getAll = async () => {
  const [rows] = await db.query(
    `SELECT
        t.id AS tenant_id,
        t.package_id AS tenant_package_id,
        t.name,
        t.logo,
        t.industry,
        t.email,
        t.phone,
        t.website,
        t.address,
        t.city,
        t.state,
        t.country,
        t.pin,
        t.pan,
        t.gst,
        t.is_active,
        t.created_at,
        t.updated_at,
        s.id AS subscription_id,
        s.package_id AS subscription_package_id,
        s.start_date AS subscription_start_date,
        s.end_date AS subscription_end_date,
        s.amount AS subscription_amount,
        s.payment_status,
        s.payment_method,
        s.transaction_id,
        s.invoice_id,
        s.status AS subscription_status,
        p.id AS package_id,
        p.package_name,
        p.package_type,
        p.package_details,
        p.base_price,
        p.offer_price,
        p.final_price,
        p.package_period
     FROM tenants t
     LEFT JOIN subscriptions s
       ON s.tenant_id = t.id
     LEFT JOIN packages p
       ON p.id = s.package_id
     ORDER BY t.id, s.id DESC`
  );

  const tenantsMap = new Map();

  rows.forEach((row) => {
    if (!tenantsMap.has(row.tenant_id)) {
      tenantsMap.set(row.tenant_id, {
        id: row.tenant_id,
        package_id: row.tenant_package_id,
        name: row.name,
        logo: row.logo,
        industry: row.industry,
        email: row.email,
        phone: row.phone,
        website: row.website,
        address: row.address,
        city: row.city,
        state: row.state,
        country: row.country,
        pin: row.pin,
        pan: row.pan,
        gst: row.gst,
        is_active: row.is_active,
        created_at: row.created_at,
        updated_at: row.updated_at,
        packages: []
      });
    }

    if (row.subscription_id) {
      tenantsMap.get(row.tenant_id).packages.push({
        subscription_id: row.subscription_id,
        package_id: row.package_id,
        package_name: row.package_name,
        package_type: row.package_type,
        package_details: row.package_details,
        base_price: row.base_price,
        offer_price: row.offer_price,
        final_price: row.final_price,
        package_period: row.package_period,
        start_date: row.subscription_start_date,
        end_date: row.subscription_end_date,
        amount: row.subscription_amount,
        payment_status: row.payment_status,
        payment_method: row.payment_method,
        transaction_id: row.transaction_id,
        invoice_id: row.invoice_id,
        status: row.subscription_status
      });
    }
  });

  return Array.from(tenantsMap.values());
};

exports.getById = async (tenant_id) => {
  const [result] = await db.query(
    'SELECT t.*, p.package_name FROM tenants t LEFT JOIN packages p ON t.package_id = p.id WHERE t.id = ? LIMIT 1',
    [tenant_id]
  );
  return result[0] || null;
};
