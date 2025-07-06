const express = require("express");
const router = express.Router();
const {
  adminLogin,
  verifyOTP,
  // updateProfile,
  logoutAdmin,
  // changePassword,
  // forgotPassword,
  // resetPassword,
} = require("../controllers/authController");

const {
  authenticateSession,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const multer = require("multer");
const fs = require("fs");

// // Upload folder directory
// const uploadDir = "uploads/";
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });
// const upload = multer({ storage });

//  PUBLIC ROUTES (No Authentication Needed)

router.post("/adminlogin", adminLogin); // Admin login only
router.post("/verifyotp", verifyOTP);
// router.post("/forgotpassword", forgotPassword);
// router.post("/resetpassword", resetPassword);

//  Dashboard (Admins & Super Admins Only)
router.get(
  "/dashboard",
  authenticateSession,
  authorizeRoles("admin", "super_admin"),
  (req, res) => {
    res.json({ message: `Welcome, ${req.user.role}!` });
  }
);

//  Update Profile
// router.put(
//   "/updateprofile",
//   authenticateSession,
//   upload.single("profile_image"),
//   updateProfile
// );

// Change Password
// router.put("/changepassword", authenticateSession, changePassword);

//  Logout
router.post("/logout", authenticateSession, logoutAdmin);

module.exports = router;
