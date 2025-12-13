const router = require('express').Router();
const PermissionController = require('../controllers/permission.controller');
const auth = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');

router.post('/', auth, checkPermission('create', 'Permissions'), PermissionController.create);
router.post('/assign', auth, checkPermission('create', 'Permissions'), PermissionController.assignToRole);
router.get('/role/:roleId', auth, checkPermission('read', 'Permissions'), PermissionController.getForRole);

module.exports = router;
