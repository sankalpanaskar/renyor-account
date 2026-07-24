const TenantService = require('../services/tenant.service');

exports.create = async (req, res) => {
  try {
    const uploaded_logo = req.files?.logo?.[0] || null;

    const tenant = await TenantService.create({
      ...req.body,
    }, uploaded_logo);
    
    //return 0;
    return res.success(
      200,
      "Tenant created successfully",
      tenant
    );
  } catch (err) {
     if(err.code==='ER_DUP_ENTRY'){
        return res.error(
              409,
              "This email address already exists. Please use a different email."
            );
    }else{
      return res.error(
      400,
      err.message
       );
    }
  }
};

exports.getAll = async (req, res) => {
  try {
    const tenants = await TenantService.getAll();

     return res.success(
      200,
      "Tenant fetched successfully",
      tenants
    );
  } catch (err) {
    console.error('get tenants error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getCurrentTenant = async (req, res) => {
  try {
    const tenantId = req.user?.tenant_id;
    if (!tenantId) {
      return res.error(400, 'tenant_id is required');
    }

    const tenant = await TenantService.getById(tenantId);

    return res.success(
      200,
      "Tenant fetched successfully",
      tenant
    );
  } catch (err) {
    console.error('get current tenant error', err);
    return res.error(500, err.message || 'Internal server error');
  }
};

exports.updateCurrentTenant = async (req, res) => {
  try {
    const tenantId = req.user?.tenant_id;
    if (!tenantId) {
      return res.error(400, 'tenant_id is required');
    }

    const uploaded_logo = req.files?.logo?.[0] || null;

    const tenant = await TenantService.updateById(
      tenantId,
      {
        ...req.body
      },
      uploaded_logo
    );

    return res.success(
      200,
      "Tenant updated successfully",
      tenant
    );
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.error(
        409,
        "This email address already exists. Please use a different email."
      );
    }

    return res.error(
      400,
      err.message
    );
  }
};

exports.createSubscription = async (req, res) => {
  try {
    const subscription = await TenantService.createSubscription({
      ...req.body
    });

    return res.success(
      200,
      "Subscription created successfully",
      subscription
    );
  } catch (err) {
    return res.error(
      400,
      err.message
    );
  }
};
