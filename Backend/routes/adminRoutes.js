const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../middleware/usermiddleware");
const {
  getDashboardStats,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
} = require("../controllers/adminController");

// Admin Dashboard
router.get("/dashboard", verifyAdmin, getDashboardStats);

// Bookings Management
router.get("/bookings", verifyAdmin, getAllBookings);
router.get("/bookings/:id", verifyAdmin, getBookingById);
router.put("/bookings/:id/status", verifyAdmin, updateBookingStatus);

module.exports = router;
