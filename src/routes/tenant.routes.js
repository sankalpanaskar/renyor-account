const router = require('express').Router();
const TenantController = require('../controllers/tenant.controller');
const authSuperadmin = require('../middleware/authSuperAdmin');

router.post('/create-tenant', TenantController.create);
router.get('/get-tenant', authSuperadmin, TenantController.getAll);

module.exports = router;
