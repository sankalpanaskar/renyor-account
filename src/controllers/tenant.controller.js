const TenantService = require('../services/tenant.service');

exports.create = async (req, res) => {
  try {
    console.log(req.body);
    const tenant = await TenantService.create(req.body);
    
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
