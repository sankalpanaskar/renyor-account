const router = require('express').Router();
const RoleController = require('../controllers/role.controller');
const auth = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');

router.post('/', auth, checkPermission('create', 'Roles'), RoleController.create);
router.get('/', auth, checkPermission('read', 'Roles'), RoleController.getAll);

module.exports = router;
