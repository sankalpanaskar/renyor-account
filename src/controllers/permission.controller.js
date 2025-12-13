const PermissionService = require('../services/permission.service');

exports.create = async (req, res) => {
  try {
    const perm = await PermissionService.create(req.body);
    res.json(perm);
  } catch (err) {
    console.error('create permission error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.assignToRole = async (req, res) => {
  try {
    const { role_id, permission_id } = req.body;
    await PermissionService.assign(role_id, permission_id);
    res.json({ success: true });
  } catch (err) {
    console.error('assign permission error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getForRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    const perms = await PermissionService.getForRole(roleId);
    res.json(perms);
  } catch (err) {
    console.error('get role permissions error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
