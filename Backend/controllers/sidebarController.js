const pool = require("../config/db");

// Get Sidebar Menu for Admin
const getSidebarMenu = async (req, res) => {
  try {
    console.log("Sidebar Controller - Session Data:", req.session); // Debug session
    console.log("Sidebar Controller - Admin Data:", req.admin); // Debug admin data

    const adminId = req.admin.id; // Extracted from session

    // Fetch assigned permissions from the `admins` table
    const adminQuery = await pool.query(
      "SELECT permissions FROM admins WHERE id = $1",
      [adminId]
    );

    if (adminQuery.rows.length === 0) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const adminPermissions = adminQuery.rows[0].permissions; // JSONB array of permission IDs

    if (!adminPermissions || adminPermissions.length === 0) {
      return res.json({ menu: [] }); // No permissions assigned
    }

    // Fetch matching sidebar items from `permissions` table
    const menuQuery = `
        SELECT id, 
               INITCAP(REPLACE(name, '_', ' ')) AS name, -- Converts "edit_users" → "Edit Users"
               url, 
               icon
        FROM permissions
        WHERE id = ANY($1) AND status = TRUE
        ORDER BY id ASC
    `;

    const menuResult = await pool.query(menuQuery, [adminPermissions]);

    // Format the response
    const sidebarMenu = menuResult.rows.map((item) => ({
      id: item.id,
      name: item.name,
      url: item.url,
      icon: item.icon,
    }));

    res.json({ menu: sidebarMenu });
  } catch (error) {
    console.error("Error fetching sidebar:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getSidebarMenu };