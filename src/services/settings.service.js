const db = require('../config/db');

exports.createDocumentNumberSettings = async (data, tenant_id, user_id) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const {
      document_type,
      prefix,
      current_number,
      suffix,
      increment_by
    } = data || {};

    if (!document_type) {
      throw new Error('document_type is required');
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

    const [result] = await connection.query(
      `INSERT INTO document_number_settings
        (document_type, prefix, current_number, suffix, increment_by, tenant_id, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [document_type, prefix, current_number, suffix, increment_by, tenant_id, user_id]
    );

    const [rows] = await connection.query(
      `SELECT * FROM document_number_settings WHERE id = ? AND tenant_id = ?`,
      [result.insertId, tenant_id]
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
