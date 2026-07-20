const router = require('express').Router();
const TenantController = require('../controllers/tenant.controller');
const auth = require('../middleware/auth');
const authSuperadmin = require('../middleware/authSuperAdmin');
const createUpload = require('../middleware/upload');
const upload = createUpload('../uploads/tenants/tmp');

router.post(
  '/create-tenant',
  authSuperadmin,
  upload.fields([{ name: 'logo', maxCount: 1 }]),
  TenantController.create
);
// router.post("/create-tenant", authSuperadmin, (req, res, next) => {
//   upload.single("logo")(req, res, function (err) {
//     if (err) {
//       if (err.code === "LIMIT_UNEXPECTED_FILE") {
//         return res.status(400).json({ message: `Unexpected file field: ${err.field}. Expected 'logo'.` });
//       }
//       return res.status(400).json({ message: err.message });
//     }
//     next();
//   });
// }, TenantController.create);
router.get('/fetch-tenant', authSuperadmin, TenantController.getAll);
router.get('/fetch-my-tenant', auth, TenantController.getCurrentTenant);

module.exports = router;
