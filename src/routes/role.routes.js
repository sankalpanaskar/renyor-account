const router = require('express').Router();
const RoleController = require('../controllers/role.controller');
const auth = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');

router.post('/role-create', auth, RoleController.create);
router.get('/', auth, RoleController.getAll);

module.exports = router;
