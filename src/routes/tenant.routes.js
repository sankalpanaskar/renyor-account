const router = require('express').Router();
const TenantController = require('../controllers/tenant.controller');
const authSuperadmin = require('../middleware/authSuperAdmin');
const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/create-tenant', upload.single("file"),TenantController.create);
router.get('/get-tenant', authSuperadmin, TenantController.getAll);

module.exports = router;
