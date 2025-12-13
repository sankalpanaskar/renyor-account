const TenantService = require('../services/tenant.service');

exports.create = async (req, res) => {
  try {
    const tenant = await TenantService.create(req.body);
    res.json(tenant);
  } catch (err) {
    console.error('create tenant error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const tenants = await TenantService.getAll();
    res.json(tenants);
  } catch (err) {
    console.error('get tenants error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
