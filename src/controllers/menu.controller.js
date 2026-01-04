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
