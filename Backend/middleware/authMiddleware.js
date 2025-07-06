const authenticateSession = (req, res, next) => {
  if (!req.session || !req.session.admin) {
    return res.status(401).json({ message: "Unauthorized: Please log in" });
  }

  req.user = req.session.admin; //  Store admin info in req.user
  next();
};

// Middleware to verify specific roles
const authorizeRoles =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.session || !req.session.admin) {
      return res.status(401).json({ message: "Unauthorized: Please log in" });
    }

    if (!allowedRoles.includes(req.session.admin.role)) {
      return res
        .status(403)
        .json({ message: "Access Denied: Insufficient permissions" });
    }

    next();
  };

module.exports = { authenticateSession, authorizeRoles };
