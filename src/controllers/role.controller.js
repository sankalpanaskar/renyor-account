const RoleService = require('../services/role.service');

exports.create = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    const role = await RoleService.create(req.body,tenant_id);
    
    return res.success(
      200,
      "Role created successfully",
      role
    );
  } catch (err) {
    return res.error(
      500,
      err.message || "Failed to create roles"
    );
  }
};

exports.getAll = async (req, res) => {
  try {
    const roles = await RoleService.getAll(req.user.tenant_id);
    return res.success(
      200,
      "Role fetched successfully",
      roles
    );
  } catch (err) {
    return res.error(
      500,
      err.message || "Failed to fetch roles"
    );
  }
};
