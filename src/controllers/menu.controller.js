const menu = require('../services/menu.service');
exports.fetchMenu = async (req, res) => {
  try {
    const packageId = req.user.package_id;
    console.log(req.user);
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