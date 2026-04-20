async function handleCustomFields({
  connection,
  custom_field,
  module_id,
  tenant_id,
  record_id,
}) {
  let customFieldObj = {};

  if (custom_field) {
    try {
      customFieldObj =
        typeof custom_field === "string"
          ? JSON.parse(custom_field)
          : custom_field;
    } catch (err) {
      throw new Error("Invalid custom_field JSON");
    }
  }

  if (Object.keys(customFieldObj).length === 0) return;

  if (!module_id) {
    throw new Error("module_id is required when custom_field is provided");
  }

  for (const key of Object.keys(customFieldObj)) {
    const [fieldRows] = await connection.query(
      `SELECT id FROM custom_fields WHERE field_name = ? AND module_id = ?`,
      [key, module_id]
    );

    if (fieldRows.length > 0) {
      const fieldId = fieldRows[0].id;
      const value = customFieldObj[key];

      await connection.query(
        `INSERT INTO custom_field_values
         (module_id, tenant_id, record_id, field_id, field_value)
         VALUES (?, ?, ?, ?, ?)`,
        [module_id, tenant_id, record_id, fieldId, value]
      );
    }
  }
}

module.exports = handleCustomFields ;