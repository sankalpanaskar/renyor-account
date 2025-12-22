const { verifyToken } = require('../utils/jwt');
const db = require('../config/db');

module.exports = async function authSuperadmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // Verify JWT
    const payload = verifyToken(token);
    

    // MySQL query (use ?)
    const [rows] = await db.query(
      `SELECT id, tenant_id, role_id, email, name, is_system_super_admin
       FROM users WHERE id = ?`,
      [payload.userId]
    );
    console.log(payload.userId);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    // MySQL boolean check (1 = true)
    if (rows[0].is_system_super_admin !== 1) {
      return res.status(403).json({
        error: 'Only Project Super Admin can do this'
      });
    }

    // Attach user to request
    req.user = rows[0];
    next();

  } catch (err) {
    console.error('authSuperadmin error:', err.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
};
