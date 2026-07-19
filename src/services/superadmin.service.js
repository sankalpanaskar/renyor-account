const db = require('../config/db');
const bcrypt = require("bcryptjs");

const normalizeScalar = (value) => {
  if (!Array.isArray(value)) {
    return value;
  }

  const nonEmptyValues = value.filter(
    (item) => item !== undefined && item !== null && String(item).trim() !== ""
  );

  return nonEmptyValues.length ? nonEmptyValues[nonEmptyValues.length - 1] : "";
};

const hasOwn = (object, key) =>
  Object.prototype.hasOwnProperty.call(object || {}, key);

const normalizeNumberValue = (value) => {
  const normalized = normalizeScalar(value);

  if (normalized === undefined || normalized === null || normalized === "") {
    return null;
  }

  const number = Number(normalized);
  if (Number.isNaN(number)) {
    throw new Error("Invalid numeric value");
  }

  return number;
};

const normalizeTinyIntValue = (value) => {
  const normalized = normalizeScalar(value);

  if (normalized === undefined || normalized === null || normalized === "") {
    return null;
  }

  return normalized === true ||
    normalized === 1 ||
    normalized === "1" ||
    normalized === "true"
    ? 1
    : 0;
};

const normalizeTextValue = (value) => {
  const normalized = normalizeScalar(value);

  if (normalized === undefined || normalized === null) {
    return null;
  }

  const text = String(normalized).trim();
  return text === "" ? null : text;
};

const normalizeModuleIds = (module_id) => {
  let value = module_id;

  if (typeof value === "string" && value.trim().startsWith("[")) {
    try {
      value = JSON.parse(value);
    } catch (err) {
      value = module_id;
    }
  }

  const rawIds = Array.isArray(value)
    ? value
    : String(value ?? "")
        .split(",");

  return [...new Set(rawIds
    .map((id) => String(id).trim())
    .filter(Boolean))];
};

exports.create = async (data) => {
  const { name, email, password } = data;

  // 1. Check if system super admin already exists
  const [existingRows] = await db.query(
    `SELECT id FROM users WHERE is_system_super_admin = 1`
  );

  if (existingRows.length > 0) {
    throw new Error("Project Super Admin already exists");
  }

  // 2. Validate input
  if (!name || !email || !password) {
    throw new Error("Name, email and password are required");
  }

  // 3. Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 4. INSERT (NO RETURNING in MySQL)
  const [result] = await db.query(
    `INSERT INTO users 
     (name, email, password, is_system_super_admin, tenant_id, role_id)
     VALUES (?, ?, ?, 1, NULL, NULL)`,
    [name, email, hashedPassword]
  );

  // 5. Return created user manually
  return {
    id: result.insertId,
    name,
    email,
    is_system_super_admin: true
  };
};

exports.assignModuleInPackage=async(data) =>{
  const { package_id, parent_id, module_id } = data;

  const values = module_id.map(id => [
    package_id,
    id,
    parent_id,
    1
  ]);

  return db.query(
    `
    INSERT INTO package_modules
      (package_id, menu_id, parent_menu_id, status)
    VALUES ?
    `,
    [values]
  );
};


exports.packageCreate = async (data) => {
  const { package_name, package_type, package_details, base_price, offer_price, final_price } = data;

  // Validation
  if (!package_name || !package_details) {
    throw new Error("Package Name and Description are required");
   
  }

  // Insert into MySQL (NO RETURNING)
  const [result] = await db.query(
    `INSERT INTO packages (package_name, package_type, package_details, base_price, offer_price, final_price)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [package_name, package_type, package_details, base_price, offer_price, final_price]
  );

  // Manually return created record
  return {
    id: result.insertId,
    package_name,
    package_details
  };
};
exports.getPackages = async () => {
  const [rows] = await db.query(
    `SELECT 
        *
     FROM packages
     ORDER BY id DESC`
  );

  return rows; // array (can be empty)
};

exports.fetchSubMenuBasedOnParentMenu = async (parentMenuId) => {
  const [rows] = await db.query(
    `SELECT 
        *
     FROM menu_modules
     WHERE parent_id = ?
     ORDER BY id DESC`,
    [parentMenuId] // 👈 value binding
  );

  return rows; // array (can be empty)
};

exports.createMenuSubmenu = async (data) => {
  const { menu_name, parent_id , icon,link} = data;

  // Validation
  if (!menu_name) {
    throw new Error("Menu Name are required");
  }

  // Normalize parent_id (INTEGER column)
  const finalParentId =
    parent_id !== undefined &&
    parent_id !== null &&
    parent_id !== "" &&
    parent_id !== "null"
      ? parent_id
      : null;

  // Insert into MySQL
  const [result] = await db.query(
    `INSERT INTO menu_modules (menu_name, parent_id, menu_pic, link)
     VALUES (?, ?, ?, ?)`,
    [menu_name, finalParentId, icon, link]
  );

  // Manually return created record
  return {
    id: result.insertId,
    menu_name,
    parent_id: finalParentId
  };
};
exports.customFieldCreate = async (data) => {
  const {
    tenant_id,
    field_name,
    field_label,
    field_type,
    field_options,
    placeholder,
    default_value,
    validation_type,
    min_length,
    max_length,
    field_order,
    is_required,
    show_in_form,
    show_in_list,
    status
  } = data;

  // Validation
  if (!tenant_id) throw new Error("tenant_id is required");
  if (!field_name) throw new Error("Field name is required");
  if (!field_label) throw new Error("Field label is required");

  // Normalize numbers
  const finalMinLength =
    min_length !== undefined && min_length !== null && min_length !== ""
      ? Number(min_length)
      : null;

  const finalMaxLength =
    max_length !== undefined && max_length !== null && max_length !== ""
      ? Number(max_length)
      : null;

  const finalFieldOrder =
    field_order !== undefined && field_order !== null && field_order !== ""
      ? Number(field_order)
      : 0;

  // Convert boolean → tinyint
  const toTinyInt = (v) =>
    v === true || v === 1 || v === "1" || v === "true" ? 1 : 0;

  const finalRequired = toTinyInt(is_required);
  const finalShowForm = show_in_form !== undefined ? toTinyInt(show_in_form) : 1;
  const finalShowList = show_in_list !== undefined ? toTinyInt(show_in_list) : 1;
  const finalStatus = status !== undefined ? toTinyInt(status) : 1;

  // Default field type
  const finalFieldType = field_type || "text";

  // Insert Query
  const [result] = await db.query(
    `INSERT INTO custom_fields
    (
      tenant_id,
      field_name,
      field_label,
      field_type,
      field_options,
      placeholder,
      default_value,
      validation_type,
      min_length,
      max_length,
      field_order,
      is_required,
      show_in_form,
      show_in_list,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      tenant_id,
      field_name,
      field_label,
      finalFieldType,
      field_options ?? null,
      placeholder ?? null,
      default_value ?? null,
      validation_type ?? null,
      finalMinLength,
      finalMaxLength,
      finalFieldOrder,
      finalRequired,
      finalShowForm,
      finalShowList,
      finalStatus
    ]
  );

  // Return created record
  return {
    id: result.insertId,
    tenant_id,
    field_name,
    field_label,
    field_type: finalFieldType,
    field_options: field_options ?? null,
    placeholder: placeholder ?? null,
    default_value: default_value ?? null,
    validation_type: validation_type ?? null,
    min_length: finalMinLength,
    max_length: finalMaxLength,
    field_order: finalFieldOrder,
    is_required: finalRequired,
    show_in_form: finalShowForm,
    show_in_list: finalShowList,
    status: finalStatus
  };
};

exports.customFieldUpdate = async (data) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const customFieldId = normalizeScalar(
      data?.custom_field_id ?? data?.id
    );

    if (!customFieldId) {
      throw new Error("custom_field_id is required");
    }

    const [existingRows] = await connection.query(
      `SELECT * FROM custom_fields WHERE id = ? FOR UPDATE`,
      [customFieldId]
    );

    if (!existingRows.length) {
      throw new Error("Custom field not found");
    }

    const updates = [];
    const values = [];

    const addUpdate = (column, value, shouldUpdate) => {
      if (!shouldUpdate) {
        return;
      }

      updates.push(`${column} = ?`);
      values.push(value);
    };

    if (hasOwn(data, "field_name")) {
      const fieldName = normalizeTextValue(data.field_name);
      if (!fieldName) {
        throw new Error("Field name is required");
      }
      addUpdate("field_name", fieldName, true);
    }

    if (hasOwn(data, "field_label")) {
      const fieldLabel = normalizeTextValue(data.field_label);
      if (!fieldLabel) {
        throw new Error("Field label is required");
      }
      addUpdate("field_label", fieldLabel, true);
    }

    if (hasOwn(data, "field_type")) {
      const fieldType = normalizeTextValue(data.field_type);
      if (!fieldType) {
        throw new Error("Field type is required");
      }
      addUpdate("field_type", fieldType, true);
    }

    if (hasOwn(data, "field_options")) {
      addUpdate("field_options", normalizeTextValue(data.field_options), true);
    }

    if (hasOwn(data, "placeholder")) {
      addUpdate("placeholder", normalizeTextValue(data.placeholder), true);
    }

    if (hasOwn(data, "default_value")) {
      addUpdate("default_value", normalizeTextValue(data.default_value), true);
    }

    if (hasOwn(data, "validation_type")) {
      addUpdate("validation_type", normalizeTextValue(data.validation_type), true);
    }

    if (hasOwn(data, "min_length")) {
      addUpdate("min_length", normalizeNumberValue(data.min_length), true);
    }

    if (hasOwn(data, "max_length")) {
      addUpdate("max_length", normalizeNumberValue(data.max_length), true);
    }

    if (hasOwn(data, "field_order")) {
      addUpdate("field_order", normalizeNumberValue(data.field_order), true);
    }

    if (hasOwn(data, "is_required")) {
      addUpdate("is_required", normalizeTinyIntValue(data.is_required), true);
    }

    if (hasOwn(data, "show_in_form")) {
      addUpdate("show_in_form", normalizeTinyIntValue(data.show_in_form), true);
    }

    if (hasOwn(data, "show_in_list")) {
      addUpdate("show_in_list", normalizeTinyIntValue(data.show_in_list), true);
    }

    if (hasOwn(data, "status")) {
      addUpdate("status", normalizeTinyIntValue(data.status), true);
    }

    if (updates.length > 0) {
      updates.push("updated_at = CURRENT_TIMESTAMP");

      await connection.query(
        `UPDATE custom_fields
         SET ${updates.join(", ")}
         WHERE id = ?`,
        [...values, customFieldId]
      );
    }

    const [rows] = await connection.query(
      `SELECT * FROM custom_fields WHERE id = ?`,
      [customFieldId]
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

exports.assignCustomFieldModules = async (data) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const customeFieldId = normalizeScalar(
      data?.custome_field_id ?? data?.custom_field_id
    );
    const moduleIds = normalizeModuleIds(data?.module_id);
    const statusValue = normalizeTinyIntValue(
      hasOwn(data, "status") ? data.status : 1
    );
    const status = statusValue === null ? 1 : statusValue;

    if (!customeFieldId) {
      throw new Error("custome_field_id is required");
    }

    if (!moduleIds.length) {
      throw new Error("module_id is required");
    }

    const [fieldRows] = await connection.query(
      `SELECT id FROM custom_fields WHERE id = ?`,
      [customeFieldId]
    );

    if (!fieldRows.length) {
      throw new Error("Custom field not found");
    }

    for (const moduleId of moduleIds) {
      const [assignmentRows] = await connection.query(
        `SELECT id
         FROM custom_field_module_assignment
         WHERE custome_field_id = ? AND module_id = ?
         LIMIT 1`,
        [customeFieldId, moduleId]
      );

      if (assignmentRows.length > 0) {
        await connection.query(
          `UPDATE custom_field_module_assignment
           SET status = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [status, assignmentRows[0].id]
        );
      } else {
        await connection.query(
          `INSERT INTO custom_field_module_assignment
           (module_id, custome_field_id, status)
           VALUES (?, ?, ?)`,
          [moduleId, customeFieldId, status]
        );
      }
    }

    const [assignments] = await connection.query(
      `SELECT
          cfma.id,
          cfma.custome_field_id,
          cfma.module_id,
          mm.menu_name,
          cfma.status
       FROM custom_field_module_assignment cfma
       LEFT JOIN menu_modules mm
         ON mm.id = cfma.module_id
       WHERE cfma.custome_field_id = ?
       ORDER BY cfma.module_id ASC`,
      [customeFieldId]
    );

    await connection.commit();

    return {
      custome_field_id: customeFieldId,
      module_id: moduleIds,
      assignments
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

exports.deassignCustomFieldModules = async (data) => {
  return exports.assignCustomFieldModules({
    ...data,
    status: 0,
  });
};



exports.fetchMenuStructure = async () => {
  const [rows] = await db.query(
    `
    SELECT id, menu_name, parent_id,menu_pic,link
    FROM menu_modules
    WHERE status = 1
    ORDER BY parent_id, id`
  );

  const map = {};
  const menu = [];

  rows.forEach(row => {
    map[row.id] = {
      id: row.id,
      title: row.menu_name,
      parent_id: row.parent_id,
      icon:row.menu_pic,
      link:row.link,
      children: []
    };
  });

  rows.forEach(row => {
    if (row.parent_id === 0) {
      menu.push(map[row.id]);
    } else if (map[row.parent_id]) {
      map[row.parent_id].children.push(map[row.id]);
    }
  });

  return menu;
};

exports.fetchParentMenu = async () => {
  const [rows] = await db.query(
    `SELECT 
        *
     FROM menu_modules
     where parent_id=0`
  );

  return rows; // array (can be empty)
};



exports.fetchChildMenu = async () => {
  const [rows] = await db.query(
    `SELECT 
        *
     FROM menu_modules
     where parent_id!=0`
  );

  return rows; // array (can be empty)
};

exports.fetchFieldsByTable = async (module_id, tenant_id) => {
  try {
    const moduleIds = normalizeModuleIds(module_id);
    const hasModuleId = moduleIds.length > 0;
    const params = [];

    const assignmentFilter = hasModuleId
      ? "WHERE cfma.module_id IN (?) AND cfma.status = 1 AND cfma.tenant_id = ?"
      : "WHERE cfma.status = 1 AND cfma.tenant_id = ?";
    if (hasModuleId) {
      params.push(moduleIds);
    }
    params.push(tenant_id);

    const query = `
      SELECT
        cf.*,
        assignments.module_id,
        assignments.menu_name
      FROM custom_fields cf
      ${hasModuleId ? "INNER" : "LEFT"} JOIN (
        SELECT
          cfma.custome_field_id,
          GROUP_CONCAT(DISTINCT cfma.module_id ORDER BY cfma.module_id SEPARATOR ',') AS module_id,
          GROUP_CONCAT(DISTINCT mm.menu_name ORDER BY mm.menu_name SEPARATOR ', ') AS menu_name
        FROM custom_field_module_assignment cfma
        LEFT JOIN menu_modules mm
          ON mm.id = cfma.module_id
        ${assignmentFilter}
        GROUP BY cfma.custome_field_id
      ) assignments
        ON assignments.custome_field_id = cf.id
      WHERE cf.show_in_form = 1
      AND cf.status = 1
        AND cf.tenant_id = ?
      ORDER BY assignments.module_id ASC, cf.field_order ASC
    `;
    params.push(tenant_id);
    const [rows] = await db.query(query, params);
    return rows;
  } catch (err) {
    throw new Error(err.message || "Error fetching fields from DB");
  }
};



// exports.getAll = async () => {
//   const result = await db.query('SELECT * FROM tenants ORDER BY id');
//   return result.rows;
// };
