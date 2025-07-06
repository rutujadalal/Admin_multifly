const pool = require("../config/db");

exports.verifyAdmin = async (req, res, next) => {
  try {
    console.log(" Debug - Full Session Data:", req.session);
    console.log(" Debug - Cookies:", req.cookies);

    if (!req.session || !req.session.admin) {
      console.log(" Middleware - Unauthorized: No admin session found");
      return res
        .status(401)
        .json({ error: "Unauthorized: Admin not logged in" });
    }

    const admin = req.session.admin;
    if (!admin || !admin.id) {
      console.log(" Middleware - Invalid admin session:", admin);
      return res.status(401).json({ error: "Unauthorized: Invalid session" });
    }

    req.admin = admin;
    console.log(" Middleware - Admin session found:", admin);
    next();
  } catch (error) {
    console.error(" Middleware - Error in verifyAdmin:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
exports.checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      console.log(" Checking Permission:", requiredPermission);
      console.log(" Admin Session:", req.session.admin);

      if (!req.session.admin || !req.session.admin.id) {
        console.log(" No Admin Session Found!");
        return res
          .status(401)
          .json({ error: "Unauthorized: Admin not logged in" });
      }

      const adminId = req.session.admin.id;
      console.log(` Fetching permissions for admin ID: ${adminId}`);

      const result = await pool.query(
        `SELECT p.name FROM permissions p WHERE p.id = ANY(
          SELECT jsonb_array_elements_text(a.permissions)::int FROM admins a WHERE a.id = $1
        )`,
        [adminId]
      );

      const adminPermissions = result.rows.map((row) => row.name);
      console.log(" Retrieved Admin Permissions:", adminPermissions);

      if (adminPermissions.includes(requiredPermission)) {
        console.log(` Permission Granted: ${requiredPermission}`);
        return next();
      } else {
        console.log(` Permission Denied: ${requiredPermission}`);
        return res
          .status(403)
          .json({ error: "Forbidden: Insufficient permissions" });
      }
    } catch (error) {
      console.error(" Error in checkPermission:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
};






