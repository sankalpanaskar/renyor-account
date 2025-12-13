const UserService = require('../services/user.service');

exports.create = async (req, res) => {
  try {
    console.log(req.body);
    const user = await UserService.create(req.body);
    res.json(user);
  } catch (err) {
    console.error('create user error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const users = await UserService.getAll(req.user.tenant_id);
    res.json(users);
  } catch (err) {
    console.error('get users error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
