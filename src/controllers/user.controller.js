const UserService = require('../services/user.service');

exports.create = async (req, res) => {
  try {
    console.log(req.user);
    const tenant_id = req.user.tenant_id;
    
    if (!tenant_id  || !req.body.name || !req.body.email) {
         return res.error(
              400,
              "Name,Email are require field"
            );
    }
    const user = await UserService.create(req.body,tenant_id);
    return res.success(
      200,
      "User created successfully",
      user
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
    const users = await UserService.getAll(req.user.tenant_id);
    return res.success(
      200,
      "User fetched successfully",
      users
    );
  } catch (err) {
     return res.error(
      500,
      err.message || "Failed to fetch roles"
    );
  }
};
