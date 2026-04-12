const sales = require('../services/sales.service');


exports.fetchCustomers = async (req, res) => {
  try {
    const { module_id } = req.query;   // <-- changed here

    if (!module_id) {
      return res.status(400).json({ message: "module_id is required" });
    }
    const tenant_id = req.user.tenant_id;
    const customers = await sales.fetchAllCustomers(tenant_id, module_id);

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

    

exports.createCustomer1 = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    
    console.log(req.body);
    const customers = await sales.createCustomer(req.body,tenant_id);

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

exports.createCustomer = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;

    const uploaded_file_name_1 = req.files?.document_1?.[0]?.filename || null;
    const uploaded_file_name_2 = req.files?.document_2?.[0]?.filename || null;

    const customers = await sales.createCustomer(
      req.body,   // no parsing here
      tenant_id,
      uploaded_file_name_1,
      uploaded_file_name_2
    );
    return res.success(200, "Customer created successfully", customers);

    return res.success(200, "Customer created successfully", customers);
  } catch (err) {
    return res.error(500, err.message);
  }
};

exports.getchartofaccountsHeadType = async (req, res) => {
  try {
    
    const groups = await sales.getchartofaccountsHeadType();

    return res.success(
      200,
      "Group fetched successfully",
      groups
    );
  } catch (err) {
    return res.error(
      500,
      err.message || "Failed to fetch Group"
    );
  }
};

exports.fetchTds = async (req, res) => {
  try {
    
    const tds = await sales.fetchTds();

    return res.success(
      200,
      "TDS fetched successfully",
      tds
    );
  } catch (err) {
    return res.error(
      500,
      err.message || "Failed to fetch TDS"
    );
  }
};

exports.fetchPaymentTerms = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    const paymentTerms = await sales.fetchPaymentTerms(tenant_id);

    return res.success(
      200,
      "Payment Terms fetched successfully",
      paymentTerms
    );
  } catch (err) {
    return res.error(
      500,
      err.message || "Failed to fetch TDS"
    );
  }
};

exports.createchartofaccounts = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    const user_id = req.user.userId;
    
    console.log(req.body);
    const chartOfAccountsName = await sales.createchartofaccounts(req.body,tenant_id,user_id);

    return res.success(
      200,
      "Chart of Accounts Name created successfully",
      chartOfAccountsName
    );
  } catch (err) {
     if(err.code==='ER_DUP_ENTRY'){
        return res.error(
              409,
              "this account name already exists under the same head type. Please use a different name."
            );
    }else{
      return res.error(
      400,
      err.message
       );
    }
  }
};


