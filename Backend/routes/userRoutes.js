const express = require("express");
const pool = require("../config/db");
const router = express.Router();
const {
  getUsers,
  getUserById,
  getUsersByName,
  updateUser,
  deleteUser,
  blockUser,
  unblockUser,
  getBlockedUsers,
} = require("../controllers/usercontroller");
const {
  verifyAdmin,
  checkPermission,
} = require("../middleware/usermiddleware");

// View all users (for sidebar)
router.get("/view-users", verifyAdmin, getUsers);

// Edit users view
router.get("/edit-users", verifyAdmin, checkPermission("edit_users"), getUsers);

// CRUD routes
router.get("/users", verifyAdmin, (req, res, next) => {
  if (req.query.name) {
    return getUsersByName(req, res);
  }
  return getUsers(req, res);
});
router.get("/users/:id", verifyAdmin, getUserById);
router.get("/users/:name", verifyAdmin, getUsersByName);
router.get(
  "/blocked-users",
  verifyAdmin,
  checkPermission("view_all_users"),
  getBlockedUsers
);

// Update routes
router.put(
  "/users/:id",
  verifyAdmin,
  checkPermission("edit_users"),
  updateUser
);
router.put(
  "/users/:id/block",
  verifyAdmin,
  checkPermission("block_user"),
  blockUser
);
router.put(
  "/users/:id/unblock",
  verifyAdmin,
  checkPermission("block_user"),
  unblockUser
);

// Delete route
router.delete(
  "/users/:id",
  verifyAdmin,
  checkPermission("delete_users"),
  deleteUser
);

module.exports = router;





