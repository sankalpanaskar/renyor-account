const menu = require('../services/menu.service');
exports.fetchMenu = async (req, res) => {
  try {
   
    const tokenPackageId = req.user?.package_id;

    // 2️⃣ package_id from request (query / params / body)
    const requestPackageId = req.query.package_id;
    const packageId = requestPackageId || tokenPackageId;
     if (!packageId) {
        return res.error(
        500,
        "Package Not assign"
        );
    }
    
    const menu_details = await menu.fetchMenu(packageId);

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
