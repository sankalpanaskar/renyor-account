const { verifyToken } = require('../utils/jwt');
const db = require('../config/db');

module.exports = async function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const payload = verifyToken(token);
    const result = await db.query(
      'SELECT id, tenant_id, role_id, email, name FROM users WHERE id = $1',
      [payload.userId]
    );
    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = result.rows[0];
    next();
  } catch (err) {
    console.error('auth error', err.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
};
