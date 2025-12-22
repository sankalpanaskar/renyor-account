const { verifyToken } = require('../utils/jwt');
const db = require('../config/db');

module.exports = async function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ')
    ? header.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const payload = verifyToken(token);
    console.log(payload);
    const [rows] = await db.query(
      'SELECT id, tenant_id, role_id, email, name FROM users WHERE id = ?',
      [payload.user_id || payload.userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = payload; // 👈 attached to request
    next();

  } catch (err) {
    console.error('auth error', err.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
};
