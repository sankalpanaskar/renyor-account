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
        COALESCE(r.role_name, "superadmin") AS role_name,
        u.email,
        u.name,
        u.phone,
        u.password,
        u.is_system_super_admin,
        u.is_company_super_admin,
        c.id AS tenant_detail_id,
        c.package_id,
        c.name AS tenant_name,
        c.logo AS tenant_logo,
        c.industry AS tenant_industry,
        c.email AS tenant_email,
        c.phone AS tenant_phone,
        c.website AS tenant_website,
        c.address AS tenant_address,
        c.city AS tenant_city,
        c.state AS tenant_state,
        c.country AS tenant_country,
        c.pin AS tenant_pin,
        c.pan AS tenant_pan,
        c.gst AS tenant_gst,
        c.is_active AS tenant_is_active,
        c.status AS tenant_status,
        p.package_name
      FROM users u
      JOIN tenants c ON c.id = u.tenant_id
      LEFT JOIN packages p ON p.id = c.package_id
      LEFT JOIN roles r ON r.id = u.role_id AND r.tenant_id = u.tenant_id
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

    const tenant_details = {
      id: user.tenant_detail_id,
      package_id: user.package_id,
      package_name: user.package_name || null,
      name: user.tenant_name || null,
      logo: user.tenant_logo || null,
      industry: user.tenant_industry || null,
      email: user.tenant_email || null,
      phone: user.tenant_phone || null,
      website: user.tenant_website || null,
      address: user.tenant_address || null,
      city: user.tenant_city || null,
      state: user.tenant_state || null,
      country: user.tenant_country || null,
      pin: user.tenant_pin || null,
      pan: user.tenant_pan || null,
      gst: user.tenant_gst || null,
      is_active: user.tenant_is_active,
      status: user.tenant_status
    };

    delete user.tenant_detail_id;
    delete user.tenant_name;
    delete user.tenant_logo;
    delete user.tenant_industry;
    delete user.tenant_email;
    delete user.tenant_phone;
    delete user.tenant_website;
    delete user.tenant_address;
    delete user.tenant_city;
    delete user.tenant_state;
    delete user.tenant_country;
    delete user.tenant_pin;
    delete user.tenant_pan;
    delete user.tenant_gst;
    delete user.tenant_is_active;
    delete user.tenant_status;
    delete user.package_name;

    return res.success(
      200,
      "Login successful",
      { user, token, tenant_details }
    );

  } catch (err) {
    console.error("login error", err);
    return res.error(401, err.message);
  }
};
