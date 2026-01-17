const TenantService = require('../services/tenant.service');

exports.create = async (req, res) => {
  try {
    const tenant = await TenantService.create(req.body);
    return res.success(
      200,
      "Tenant created successfully",
      tenant
    );
  } catch (err) {
    return res.error(
  500,
  process.env.NODE_ENV === "production"
    ? "Internal Server Error"
    : err.stack
);
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
