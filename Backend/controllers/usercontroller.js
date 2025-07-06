

const pool = require("../config/db");

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, phone, role, status, created_at, updated_at, admin_id FROM users ORDER BY created_at DESC"
    );
    console.log(`Fetched ${result.rows.length} users`); // Debug log
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Get specific user details
exports.getUserById = async (req, res) => {
  const { id } = req.params;
  console.log(`Fetching user with ID: ${id}`); // Debug log
  try {
    if (!/^\d+$/.test(id)) {
      console.log(`Invalid user ID format: ${id}`);
      return res.status(400).json({ success: false, error: "Invalid user ID format" });
    }

    const result = await pool.query(
      "SELECT id, name, email, phone, role, status, created_at, updated_at, admin_id FROM users WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      console.log(`No user found with ID: ${id}`);
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error(`Error fetching user with ID ${id}:`, error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Get users by name (partial, case-insensitive match)
exports.getUsersByName = async (req, res) => {
  const { name } = req.query;
  if (!name || !name.trim()) {
    console.log("Name query parameter missing or empty");
    return res.status(400).json({ success: false, error: "Name query parameter is required and cannot be empty" });
  }

  const trimmedName = name.trim();
  console.log(`Searching for users with name: "${trimmedName}"`); // Debug log

  try {
    const result = await pool.query(
      "SELECT id, name, email, phone, role, status, created_at, updated_at, admin_id FROM users WHERE LOWER(name) LIKE LOWER($1) ORDER BY created_at DESC",
      [`%${trimmedName}%`]
    );

    console.log(`Found ${result.rows.length} users:`, result.rows); // Debug log
    if (result.rows.length === 0) {
      console.log(`No users found for name: "${trimmedName}"`);
      return res.status(404).json({ success: false, error: "No users found matching the provided name" });
    }

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error(`Error fetching users by name "${trimmedName}":`, error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Update user details
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, phone } = req.body;
  console.log(`Updating user with ID: ${id}`); // Debug log

  if (!name || !name.trim() || !phone || !phone.trim()) {
    console.log("Name or phone missing or empty in update request");
    return res.status(400).json({ success: false, error: "Name and phone are required and cannot be empty" });
  }

  try {
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const result = await pool.query(
      "UPDATE users SET name = $1, phone = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, name, email, phone, role, status, created_at, updated_at, admin_id",
      [trimmedName, trimmedPhone, id]
    );

    if (result.rowCount === 0) {
      console.log(`No user found with ID: ${id}`);
      return res.status(404).json({ success: false, error: "User not found" });
    }

    console.log(`User with ID ${id} updated successfully`);
    res.json({ success: true, message: "User updated successfully", data: result.rows[0] });
  } catch (error) {
    console.error(`Error updating user with ID ${id}:`, error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  console.log(`Attempting to delete user with ID: ${id}`); // Debug log
  try {
    if (!/^\d+$/.test(id)) {
      console.log(`Invalid user ID format: ${id}`);
      return res.status(400).json({ success: false, error: "Invalid user ID format" });
    }

    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id",
      [id]
    );

    console.log(`Delete query result: rowCount=${result.rowCount}, rows=`, result.rows); // Debug log
    if (result.rowCount === 0) {
      console.log(`No user found with ID: ${id}`);
      return res.status(404).json({ success: false, error: "User not found" });
    }

    console.log(`User with ID ${id} deleted successfully`);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error(`Error deleting user with ID ${id}:`, error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Block a user
exports.blockUser = async (req, res) => {
  const { id } = req.params;
  console.log(`Attempting to block user with ID: ${id}`); // Debug log
  try {
    const userId = Number(id);
    if (!Number.isInteger(userId) || userId <= 0) {
      console.log(`Invalid user ID: ${id}`);
      return res.status(400).json({ success: false, error: "Invalid user ID" });
    }

    const result = await pool.query(
      "UPDATE users SET status = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, name, email, phone, role, status, created_at, updated_at, admin_id",
      [userId]
    );

    if (result.rowCount === 0) {
      console.log(`No user found with ID: ${id}`);
      return res.status(404).json({ success: false, error: "User not found" });
    }

    console.log(`User with ID ${id} blocked successfully`);
    res.json({ success: true, message: "User blocked successfully", data: result.rows[0] });
  } catch (error) {
    console.error(`Error blocking user with ID ${id}:`, error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Unblock a user
exports.unblockUser = async (req, res87) => {
  const { id } = req.params;
  console.log(`Attempting to unblock user with ID: ${id}`); // Debug log
  try {
    const userId = Number(id);
    if (!Number.isInteger(userId) || userId <= 0) {
      console.log(`Invalid user ID: ${id}`);
      return res.status(400).json({ success: false, error: "Invalid user ID" });
    }

    const result = await pool.query(
      "UPDATE users SET status = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, name, email, phone, role, status, created_at, updated_at, admin_id",
      [userId]
    );

    if (result.rowCount === 0) {
      console.log(`No user found with ID: ${id}`);
      return res.status(404).json({ success: false, error: "User not found" });
    }

    console.log(`User with ID ${id} unblocked successfully`);
    res.json({ success: true, message: "User unblocked successfully", data: result.rows[0] });
  } catch (error) {
    console.error(`Error unblocking user with ID ${id}:`, error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Get all blocked users
exports.getBlockedUsers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, phone, role, created_at, updated_at, admin_id FROM users WHERE status = false ORDER BY created_at DESC"
    );
    console.log(`Fetched ${result.rows.length} blocked users`); // Debug log
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching blocked users:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};









