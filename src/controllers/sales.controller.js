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

exports.fetchVendors = async (req, res) => {
  try {
    const { module_id } = req.query;   // <-- changed here

    if (!module_id) {
      return res.status(400).json({ message: "module_id is required" });
    }
    const tenant_id = req.user.tenant_id;
    const vendors = await sales.fetchVendors(tenant_id, module_id);

    return res.success(
      200,
      "Vendors fetched successfully",
      vendors
    );
  } catch (err) {
    return res.error(
      500,
      err.message || "Failed to fetch vendors"
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
    const user_id = req.user.userId;

    const uploaded_file_name_1 = req.files?.document_1?.[0]?.filename || null;
    const uploaded_file_name_2 = req.files?.document_2?.[0]?.filename || null;

    const customers = await sales.createCustomer(
      req.body,   // no parsing here
      tenant_id,
      user_id,
      uploaded_file_name_1,
      uploaded_file_name_2
    );
    return res.success(200, "Customer created successfully", customers);

    
  } catch (err) {
    return res.error(500, err.message);
  }
};

exports.createVendor = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    const user_id = req.user.userId;

    const uploaded_file_name_1 = req.files?.document_1?.[0]?.filename || null;
    const uploaded_file_name_2 = req.files?.document_2?.[0]?.filename || null;

    const vendors = await sales.createVendor(
      req.body,   // no parsing here
      tenant_id,
      user_id,
      uploaded_file_name_1,
      uploaded_file_name_2
    );
    return res.success(200, "Vendor created successfully", vendors);
  } catch (err) {
    return res.error(500, err.message);
  }
};



exports.createItem = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    const user_id = req.user.userId;

    const item_image = req.files?.item_image?.[0]?.filename || null;

    const items = await sales.createItem(
      req.body,   // no parsing here
      tenant_id,
      user_id,
      item_image
    );
    return res.success(200, "Item created successfully", items);
  } catch (err) {
    return res.error(500, err.message);
  }
};

exports.fetchItems = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    const { module_id, id } = req.query;

    const items = await sales.fetchItems(tenant_id, id, module_id);
    return res.success(200, "Items fetched successfully", items);
  } catch (err) {
    return res.error(500, err.message || "Failed to fetch items");
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
exports.getchartofaccountsItem = async (req, res) => {
  try {
    
    const groups = await sales.getchartofaccountsItem(req.user.tenant_id);

    return res.success(
      200,
      "Accounts Item fetched successfully",
      groups
    );
  } catch (err) {
    return res.error(
      500,
      err.message || "Failed to fetch Accounts Item"
    );
  }
};

exports.createTds = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    const user_id = req.user.userId;
    
    console.log(req.body);
    const tds = await sales.createTds(req.body,tenant_id,user_id);

    return res.success(
      200,
      "TDS created successfully",
      tds 
    );
  } catch (err) {
     if(err.code==='ER_DUP_ENTRY'){
        return res.error(
              409,
              "this tds name already exists. Please use a different name."
            );
    }else{
      return res.error(
      400,
      err.message
       );
    }
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

exports.createPaymentTerm = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    const user_id = req.user.userId;
    
    console.log(req.body);
    const paymentTerms = await sales.createPaymentTerm(req.body,tenant_id,user_id);

    return res.success(
      200,
      "Payment Terms created successfully",
      paymentTerms 
    );
  } catch (err) {
     if(err.code==='ER_DUP_ENTRY'){
        return res.error(
              409,
              "this payment term already exists. Please use a different name."
            );
    }else{
      return res.error(
      400,
      err.message
       );
    }
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
exports.createAccountsheadtype = async (req, res) => {
  try {
    
    
    console.log(req.body);
    const chartOfAccountsName = await sales.createAccountsheadtype(req.body);

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
exports.createTaxRate = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    const user_id = req.user.userId;
    
    console.log(req.body);
    const taxRate = await sales.createTaxRate(req.body,tenant_id,user_id);

    return res.success(
      200,
      "Tax Rate created successfully",
      taxRate
    );
  } catch (err) {
     if(err.code==='ER_DUP_ENTRY'){
        return res.error(
              409,
              "this tax rate already exists. Please use a different name."
            );
    }else{
      return res.error(
      400,
      err.message
       );
    }
  }
};

exports.fetchTaxRate = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    const taxRates = await sales.fetchTaxRate(tenant_id);

    return res.success(
      200,
      "Tax Rates fetched successfully",
      taxRates
    );
  } catch (err) {
    return res.error(
      500,
      err.message || "Failed to fetch Tax Rates"
    );
  }
};

exports.documentNumberSettings = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    const user_id = req.user.userId;
    
    console.log(req.body);
    const taxRate = await sales.documentNumberSettings(req.body,tenant_id,user_id);

    return res.success(
      200,
      "Document Configuration created successfully",
      taxRate
    );
  } catch (err) {
     
      return res.error(
      400,
      err.message
       );
    
  }
};


exports.fetchDocumentNumberSettings = async (req, res) => {
  try {
    const { document_type } = req.query;   // <-- changed here

    if (!document_type) {
      return res.status(400).json({ message: "document_type is required" });
    }
    const tenant_id = req.user.tenant_id;
    const documents = await sales.fetchDocumentNumberSettings(tenant_id, document_type);

    return res.success(
      200,
      "Documents fetched successfully",
      documents
    );
  } catch (err) {
    return res.error(
      500,
      err.message || "Failed to fetch documents"
    );
  }
};