const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const generateEmailTemplate = require("../utils/emailTemplate");
const emailValidator = require("email-validator");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const sendOTP = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      html: generateEmailTemplate(otp),
    });
    console.log(`OTP sent to ${email}`);
  } catch (error) {
    console.error("Error sending OTP:", error);
  }
};

exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const adminQuery = await pool.query(
      "SELECT id, name, email, role, password, permissions FROM admins WHERE email = $1",
      [email]
    );

    if (adminQuery.rows.length === 0) {
      return res.status(401).json({ error: "Admin not found" });
    }

    const admin = adminQuery.rows[0];

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      `INSERT INTO otps (user_id, otp, expires_at, user_type) 
       VALUES ($1, $2, $3, 'admin') 
       ON CONFLICT (user_id, user_type) 
       DO UPDATE SET otp = $2, expires_at = $3`,
      [admin.id, otp, expiresAt]
    );

    await sendOTP(admin.email, otp);

    let permissionsArray = [];
    if (typeof admin.permissions === "string") {
      permissionsArray = admin.permissions
        .split(",")
        .map((perm) => perm.trim());
    } else if (Array.isArray(admin.permissions)) {
      permissionsArray = admin.permissions;
    }

    res.json({
      message: "OTP sent successfully. Please verify to complete login.",
      admin_id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      permissions: permissionsArray,
    });
  } catch (error) {
    console.error("🚨 Admin Login Error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const adminQuery = await pool.query(
      "SELECT id, name, email, role, permissions FROM admins WHERE email = $1",
      [email]
    );

    if (adminQuery.rows.length === 0) {
      return res.status(401).json({ error: "Admin not found" });
    }

    const admin = adminQuery.rows[0];

    const otpQuery = await pool.query(
      "SELECT * FROM otps WHERE user_id = $1 AND user_type = 'admin' AND otp = $2 AND expires_at > NOW()",
      [admin.id, otp]
    );

    if (otpQuery.rows.length === 0) {
      return res.status(401).json({ error: "Invalid or expired OTP" });
    }

    const adminData = {
      id: admin.id,
      role: admin.role,
      email: admin.email,
      name: admin.name,
      permissions: admin.permissions || [],
    };

    // Instead of setting a session, return the admin data as a "token"
    res.json({
      message: "Admin logged in successfully",
      token: adminData, // In a real app, use JWT or a proper token
    });

    await pool.query(
      "DELETE FROM otps WHERE user_id = $1 AND user_type = 'admin'",
      [admin.id]
    );
  } catch (error) {
    console.error("OTP Verification Error:", error);
    res.status(500).json({ error: "Server error during OTP verification" });
  }
};

exports.logoutAdmin = (req, res) => {
  console.log("Logout - Session ID:", req.sessionID);
  console.log("Logout - Session Data:", req.session);
  if (!req.session?.admin) {
    return res.status(401).json({ message: "Unauthorized: Please log in" });
  }
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout Error:", err);
      return res.status(500).json({ message: "Error logging out" });
    }
    res.clearCookie("admin_session", {
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "None", // Match the session cookie setting
    });
    return res.json({ message: "Logged out successfully" });
  });
};
