const RoleService = require('../services/role.service');

exports.create = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    //console.log(req.body);
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

exports.fetchRoleAccessBasedOnRoleId = async (req, res) => {
  try {
    const { role_id } = req.query;
    const role = await RoleService.fetchRoleAccessBasedOnRoleId(
      req.user.tenant_id,
      role_id
    );

    return res.success(
      200,
      "Role access fetched successfully",
      role
    );
  } catch (err) {
    return res.error(
      500,
      err.message || "Failed to fetch role access"
    );
  }
};

exports.edit = async (req, res) => {
  try {
    const role = await RoleService.edit(req.body, req.user.tenant_id);

    return res.success(
      200,
      "Role updated successfully",
      role
    );
  } catch (err) {
    return res.error(
      400,
      err.message || "Failed to update role"
    );
  }
};
