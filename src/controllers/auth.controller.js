const db = require('../config/db');
const bcrypt = require("bcryptjs");
const { signToken } = require('../utils/jwt');


exports.login = async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  try {
    // Fetch full user (including password)
    const [result] = await db.query(
      'SELECT id, tenant_id, role_id, email, name, password, is_system_super_admin FROM users WHERE email = ?',
      [email]
    );
     console.log(result.length);
    if (result.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result[0];

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT
    const token = signToken({ userId: user.id });

    // Do not send back hashed password
    delete user.password;

    //res.json({ user, token });
    return res.success(
      200,
      "Login successful",
      { user, token}
    );
    

  } catch (err) {
    console.error("login error", err);
    return res.error(
      401,
      err.message
    );
  }
};
