const db = require('../config/db');

module.exports = function checkPermission(action, moduleName) {
  return async function (req, res, next) {
    if (!req.user || !req.user.role_id) {
      return res.status(403).json({ error: 'Forbidden: No role' });
    }

    try {
      const result = await db.query(
        `SELECT 1
         FROM role_permissions rp
         JOIN permissions p ON p.id = rp.permission_id
         WHERE rp.role_id = $1
           AND p.action = $2
           AND p.module = $3`,
        [req.user.role_id, action, moduleName]
      );

      if (result.rowCount === 0) {
        return res.status(403).json({ error: 'Forbidden: Missing permission' });
      }

      next();
    } catch (err) {
      console.error('checkPermission error', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};
