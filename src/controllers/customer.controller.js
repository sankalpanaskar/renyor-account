const customer = require('../services/customer.service');
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
    const customer = await customer.createCustomer(req.body,tenant_id);

    return res.success(
      200,
      "Customer created successfully",
      customer
    );
  } catch (err) {
    return res.error(
      500,
      err.message
    );
  }
};
