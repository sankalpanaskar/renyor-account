const router = require("express").Router();
const Controller = require("../controllers/projectSuperAdmin.controller");
const authSuperadmin = require('../middleware/authSuperAdmin');

// Only run ONCE (no token needed)
router.post("/create-project-superadmin", Controller.createProjectSuperAdmin);
router.post("/create-project-package", authSuperadmin,Controller.createPackage);
router.post("/assign-module-in-package", authSuperadmin,Controller.assignModuleInPackage);
router.get("/fetch-package", authSuperadmin,Controller.fetchPackages);

router.post("/create-menu-submenu", authSuperadmin,Controller.createMenuSubmenu);
router.get("/fetch-menu-structure", authSuperadmin,Controller.fetchMenuStructure);
router.get("/fetch-parent-menu", authSuperadmin,Controller.fetchParentMenu);
router.get("/fetch-submenu-based-on-parent-menu", authSuperadmin,Controller.fetchSubMenuBasedOnParentMenu);

module.exports = router;