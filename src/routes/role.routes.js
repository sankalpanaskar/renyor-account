const router = require('express').Router();
const RoleController = require('../controllers/role.controller');
const auth = require('../middleware/auth');
const authSuperAdminAndCompanySuperAdmin = require('../middleware/authSuperAdminAndCompanySuperAdmin');
const multer = require('multer');
const upload = multer();

router.post('/role-create', authSuperAdminAndCompanySuperAdmin, upload.none(),RoleController.create);
router.get('/get-roles', auth, RoleController.getAll);
router.get('/fetch-role-access-based-on-role-id', auth, RoleController.fetchRoleAccessBasedOnRoleId);
router.post('/role-edit', authSuperAdminAndCompanySuperAdmin, upload.none(), RoleController.edit);

module.exports = router;
