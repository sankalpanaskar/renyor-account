const router = require('express').Router();
const UserController = require('../controllers/user.controller');
const auth = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');

router.post('/user-create', UserController.create);
router.get('/', auth, checkPermission('read', 'Users'), UserController.getAll);

module.exports = router;
