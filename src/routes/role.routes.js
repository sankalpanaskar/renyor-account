const router = require('express').Router();
const RoleController = require('../controllers/role.controller');
const auth = require('../middleware/auth');
const authSuperAdminAndCompanySuperAdmin = require('../middleware/authSuperAdminAndCompanySuperAdmin');
const multer = require('multer');
const upload = multer();

router.post('/role-create', authSuperAdminAndCompanySuperAdmin, upload.none(),RoleController.create);
router.get('/get-roles', auth, RoleController.getAll);

module.exports = router;
