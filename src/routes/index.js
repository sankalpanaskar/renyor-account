const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/menu', require('./menu.routes'));
router.use('/tenants', require('./tenant.routes'));
router.use('/roles', require('./role.routes'));
router.use('/permissions', require('./permission.routes'));
router.use('/users', require('./user.routes'));
router.use('/system', require('./projectSuperAdmin.routes'));
router.use('/sales', require('./sales.routes'));
router.use('/settings', require('./settings.routes'));



module.exports = router;
