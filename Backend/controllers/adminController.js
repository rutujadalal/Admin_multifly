const pool = require("../config/db");

// Get Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const usersResult = await pool.query("SELECT COUNT(*) FROM users");
    const totalUsers = parseInt(usersResult.rows[0].count, 10);

    const bookingsResult = await pool.query("SELECT COUNT(*) FROM bookings");
    const totalBookings = parseInt(bookingsResult.rows[0].count, 10);

    const revenueResult = await pool.query(
      "SELECT SUM(total_amount) FROM bookings WHERE status = 'confirmed'"
    );
    const totalRevenue = parseFloat(revenueResult.rows[0].sum) || 0;

    res.json({
      totalUsers,
      totalBookings,
      totalRevenue,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get All Bookings
exports.getAllBookings = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM bookings");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get Specific Booking
exports.getBookingById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM bookings WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update Booking Status
exports.updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ["pending", "confirmed", "canceled", "refunded"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  try {
    const result = await pool.query(
      "UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
