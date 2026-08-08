const db = require('../config/db');

const parseConfiguration = (configuration) => {
  if (configuration === undefined || configuration === null || configuration === '') {
    throw new Error('configuration is required');
  }

  if (typeof configuration === 'string') {
    try {
      return JSON.parse(configuration);
    } catch (error) {
      throw new Error('configuration must be valid JSON');
    }
  }

  if (typeof configuration !== 'object' || Array.isArray(configuration)) {
    throw new Error('configuration must be a JSON object');
  }

  return configuration;
};

const parseConfigurationRow = (row) => {
  if (!row) {
    return row;
  }

  if (typeof row.configuration === 'string') {
    try {
      return {
        ...row,
        configuration: JSON.parse(row.configuration)
      };
    } catch (error) {
      return row;
    }
  }

  return row;
};

exports.createDocumentNumberSettings = async (data, tenant_id, user_id) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const {
      document_type,
      type,
      prefix,
      current_number,
      suffix,
      increment_by
    } = data || {};

    if (!document_type) {
      throw new Error('document_type is required');
    }

    if (!type) {
      throw new Error('type is required');
    }

    if (prefix === undefined || prefix === null) {
      throw new Error('prefix is required');
    }

    if (current_number === undefined || current_number === null) {
      throw new Error('current_number is required');
    }

    if (suffix === undefined || suffix === null) {
      throw new Error('suffix is required');
    }

    if (increment_by === undefined || increment_by === null) {
      throw new Error('increment_by is required');
    }

    const [existingRows] = await connection.query(
      `SELECT id
       FROM document_number_settings
       WHERE tenant_id = ? AND document_type = ?
       LIMIT 1`,
      [tenant_id, document_type]
    );

    let recordId;

    if (existingRows.length > 0) {
      recordId = existingRows[0].id;

      await connection.query(
        `UPDATE document_number_settings
         SET \`type\` = ?,
             prefix = ?,
             current_number = ?,
             suffix = ?,
             increment_by = ?,
             user_id = ?
         WHERE id = ? AND tenant_id = ? AND document_type = ?`,
        [type, prefix, current_number, suffix, increment_by, user_id, recordId, tenant_id, document_type]
      );
    } else {
      const [result] = await connection.query(
        `INSERT INTO document_number_settings
          (document_type, \`type\`, prefix, current_number, suffix, increment_by, tenant_id, user_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [document_type, type, prefix, current_number, suffix, increment_by, tenant_id, user_id]
      );

      recordId = result.insertId;
    }

    const [rows] = await connection.query(
      `SELECT * FROM document_number_settings WHERE id = ? AND tenant_id = ?`,
      [recordId, tenant_id]
    );

    await connection.commit();
    return rows[0];
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

exports.fetchDocumentNumberSettings = async (tenant_id, document_type = null) => {
  if (document_type) {
    const [rows] = await db.query(
      `SELECT * FROM document_number_settings
       WHERE tenant_id = ? AND document_type = ?
       ORDER BY id DESC`,
      [tenant_id, document_type]
    );

    return rows;
  }

  const [rows] = await db.query(
    `SELECT * FROM document_number_settings
     WHERE tenant_id = ?
     ORDER BY id DESC`,
    [tenant_id]
  );

  return rows;
};

exports.createDocumentFormatSettings = async (data, tenant_id, user_id) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const {
      module_id,
      document_type,
      configuration,
      is_active = 1
    } = data || {};

    if (module_id === undefined || module_id === null || module_id === '') {
      throw new Error('module_id is required');
    }

    if (!document_type) {
      throw new Error('document_type is required');
    }

    const parsedConfiguration = parseConfiguration(configuration);
    const configurationJson = JSON.stringify(parsedConfiguration);

    const [existingRows] = await connection.query(
      `SELECT id
       FROM document_format_settings
       WHERE tenant_id = ? AND module_id = ?
       LIMIT 1`,
      [tenant_id, module_id]
    );

    let recordId;

    if (existingRows.length > 0) {
      recordId = existingRows[0].id;

      await connection.query(
        `UPDATE document_format_settings
         SET user_id = ?,
             document_type = ?,
             configuration = ?,
             is_active = ?,
             updated_by = ?
         WHERE id = ? AND tenant_id = ? AND module_id = ?`,
        [
          user_id,
          document_type,
          configurationJson,
          is_active,
          user_id,
          recordId,
          tenant_id,
          module_id
        ]
      );
    } else {
      const [result] = await connection.query(
        `INSERT INTO document_format_settings
          (tenant_id, user_id, module_id, document_type, configuration, is_active, created_by, updated_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          tenant_id,
          user_id,
          module_id,
          document_type,
          configurationJson,
          is_active,
          user_id,
          user_id
        ]
      );

      recordId = result.insertId;
    }

    const [rows] = await connection.query(
      `SELECT *
       FROM document_format_settings
       WHERE id = ? AND tenant_id = ?`,
      [recordId, tenant_id]
    );

    await connection.commit();
    return parseConfigurationRow(rows[0]);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

exports.fetchDocumentFormatSettings = async (tenant_id, filters = {}) => {
  const { id, module_id, document_type, is_active } = filters || {};
  const params = [tenant_id];
  let whereClause = 'WHERE tenant_id = ?';

  if (id !== undefined && id !== null && id !== '') {
    whereClause += ' AND id = ?';
    params.push(id);
  }

  if (module_id !== undefined && module_id !== null && module_id !== '') {
    whereClause += ' AND module_id = ?';
    params.push(module_id);
  }

  if (document_type) {
    whereClause += ' AND document_type = ?';
    params.push(document_type);
  }

  if (is_active !== undefined && is_active !== null && is_active !== '') {
    whereClause += ' AND is_active = ?';
    params.push(is_active);
  }

  const [rows] = await db.query(
    `SELECT *
     FROM document_format_settings
     ${whereClause}
     ORDER BY id DESC`,
    params
  );

  const settings = rows.map(parseConfigurationRow);
  return id ? settings[0] || null : settings;
};
