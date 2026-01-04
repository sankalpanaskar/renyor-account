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
    console.error('create role error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const roles = await RoleService.getAll(req.user.tenant_id);
    res.json(roles);
  } catch (err) {
    console.error('get roles error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
