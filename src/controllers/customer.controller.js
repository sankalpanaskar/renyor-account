const customer = require('../services/customer.service');


exports.fetchCustomers = async (req, res) => {
  try {
    const { module_id } = req.query;   // <-- changed here

    if (!module_id) {
      return res.status(400).json({ message: "module_id is required" });
    }
    const tenant_id = req.user.tenant_id;
    const customers = await customer.fetchAllCustomers(tenant_id, module_id);

    return res.success(
      200,
      "Customers fetched successfully",
      customers
    );
  } catch (err) {
    return res.error(
      500,
      err.message || "Failed to fetch customers"
    );
  }
};

    

exports.createCustomer = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    
    console.log(req.body);
    const customers = await customer.createCustomer(req.body,tenant_id);

    return res.success(
      200,
      "Customer created successfully",
      customers
    );
  } catch (err) {
    return res.error(
      500,
      err.message
    );
  }
};
