const menu = require('../services/menu.service');
exports.fetchMenu = async (req, res) => {
  try {
   
    const tokenPackageId = req.user?.package_id;
    const requestPackageId = req.query.package_id;
    const packageId = requestPackageId || tokenPackageId;

    if (!packageId) {
      return res.error(
        400,
        "Package not assigned"
      );
    }
     
    
    const menu_details = await menu.fetchMenu(packageId,req.user.role_id);

    return res.success(
      200,
      "Menu fetched successfully",
      menu_details
    );

  } catch (err) {
    return res.error(
      500,
      err.message || "Failed to fetch menuz"
    );
  }
};

exports.menuAssignOnRole = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    const role = await menu.menuAssignOnRole(req.body,tenant_id);
    
    return res.success(
      200,
      "menu assign on role successfully",
      role
    );
  } catch (err) {
    return res.error(
      500,
      err.message
    );
  }
};
