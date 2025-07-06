
const pool = require("../config/db");

// Get Admin by Email (Ensure Role is 'admin' or 'super_admin')
const getAdminByEmail = async (email) => {
  const res = await pool.query(
    "SELECT * FROM admins WHERE email = $1 AND role IN ('admin', 'super_admin')",
    [email]
  );
  return res.rows[0];
};

// Update OTP for Admin
const updateAdminOtp = async (email, otp) => {
  await pool.query(
    "UPDATE admins SET otp = $1, otp_expires_at = NOW() + INTERVAL '5 minutes' WHERE email = $2 AND role IN ('admin', 'super_admin')",
    [otp, email]
  );
};

// Clear OTP after verification or expiry
const clearAdminOtp = async (email) => {
  await pool.query(
    "UPDATE admins SET otp = NULL, otp_expires_at = NULL WHERE email = $1 AND role IN ('admin', 'super_admin')",
    [email]
  );
};

module.exports = { getAdminByEmail, updateAdminOtp, clearAdminOtp };
