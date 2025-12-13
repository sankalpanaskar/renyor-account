

const SuperadminService = require('../services/superadmin.service');

// exports.createProjectSuperAdmin = async (req, res) => {
//   try {
//     // Check if already exists
//     const existing = await db.query(
//       `SELECT * FROM users WHERE is_system_super_admin = true`
//     );

//     if (existing.rowCount > 0) {
//       return res.status(400).json({
//         error: "Project Super Admin already exists"
//       });
//     }

//     const { name, email, password } = req.body;

//     if (!name || !email || !password) {
//       return res.status(400).json({
//         error: "Name, email and password are required"
//       });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create System Super Admin
//     const result = await db.query(
//       `INSERT INTO users (name, email, password, is_system_super_admin, tenant_id, role_id)
//        VALUES ($1, $2, $3, true, NULL, NULL)
//        RETURNING id, name, email, is_system_super_admin`,
//       [name, email, hashedPassword]
//     );

//     const user = result.rows[0];

//     // Do NOT return token
//     res.status(201).json({
//       message: "Project Super Admin created successfully",
//       user
//     });

//   } catch (error) {
//     console.error("createProjectSuperAdmin ERROR:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };
exports.createProjectSuperAdmin = async (req, res) => {
  try {
    
    
    const user = await SuperadminService.create(req.body);

    return res.status(201).json({
      message: "Project Super Admin created successfully",
      user
    });

  } catch (err) {
    // ANY error thrown in service comes here
    return res.status(400).json({
      error: err.message
    });
  }
};
exports.createPackage = async (req, res) => {
  try {
    const package = await SuperadminService.packageCreate(req.body);
    console.log(package);
    return res.status(201).json({
      message: "Package created successfully",
      package
    });

  } catch (err) {
    // ANY error thrown in service comes here
    return res.status(400).json({
      error: err.message
    });
  }
};

exports.createPackageModule = async (req, res) => {
  try {
    const package = await SuperadminService.createPackageModule(req.body);
    console.log(package);
    return res.status(201).json({
      message: "Package Module created successfully",
      package
    });

  } catch (err) {
    // ANY error thrown in service comes here
    return res.status(400).json({
      error: err.message
    });
  }
};