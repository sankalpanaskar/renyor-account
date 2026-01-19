const router = require('express').Router();
const TenantController = require('../controllers/tenant.controller');
const authSuperadmin = require('../middleware/authSuperAdmin');
const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/create-tenant', authSuperadmin,upload.single("logo"),TenantController.create);
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
router.get('/get-tenant', authSuperadmin, TenantController.getAll);

module.exports = router;
