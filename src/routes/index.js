const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/tenants', require('./tenant.routes'));
router.use('/roles', require('./role.routes'));
router.use('/permissions', require('./permission.routes'));
router.use('/users', require('./user.routes'));
router.use('/system', require('./projectSuperAdmin.routes'));


module.exports = router;
