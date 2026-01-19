const db = require('../config/db');
const bcrypt = require("bcryptjs");
const { signToken } = require('../utils/jwt');


exports.login = async (req, res) => {
  const { email, password } = req.body || {};
  console.log(req.body);
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  try {
    const [result] = await db.query(`
      SELECT 
        u.id,
        u.tenant_id,
        u.role_id,
        u.email,
        u.name,
        u.password,
        u.is_system_super_admin,
        u.is_company_super_admin,
        c.package_id
      FROM users u
      JOIN tenants c ON c.id = u.tenant_id
      WHERE u.email = ?
    `, [email]);
    console.log(result.length,email);

    if (result.length === 0) {
      return res.status(401).json({ error: "Invalid email or password db check" });
    }

    const user = result[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signToken({
      userId: user.id,
      tenant_id: user.tenant_id,
      package_id: user.package_id,
      is_system_super_admin: user.is_system_super_admin,
      is_company_super_admin: user.is_company_super_admin,
      role_id: user.role_id
    });
     req.user = token;

    delete user.password;

    return res.success(
      200,
      "Login successful",
      { user, token }
    );

  } catch (err) {
    console.error("login error", err);
    return res.error(401, err.message);
  }
};

