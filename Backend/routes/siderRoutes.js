const express = require("express");
const { getSidebarMenu } = require("../controllers/sidebarController");
const { verifyAdmin } = require("../middleware/usermiddleware");

const router = express.Router();

// GET Sidebar Menu based on Admin Permissions
router.get("/sidebar", verifyAdmin, getSidebarMenu);

module.exports = router;
