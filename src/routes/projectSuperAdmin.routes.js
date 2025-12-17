const router = require("express").Router();
const Controller = require("../controllers/projectSuperAdmin.controller");
const authSuperadmin = require('../middleware/authSuperAdmin');

// Only run ONCE (no token needed)
router.post("/create-project-superadmin", Controller.createProjectSuperAdmin);
router.post("/create-project-package", authSuperadmin,Controller.createPackage);
router.get("/fetch-package", authSuperadmin,Controller.fetchPackages);
router.post("/create-project-package-module", authSuperadmin,Controller.createPackageModule);

module.exports = router;