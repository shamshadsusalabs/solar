// src/controllers/adminAuth.controller.js
import { Admin } from "../models/admin.model.js";
import { generateTokens, verifyRefreshToken } from "../utils/token.js";

/**
 * POST /api/admin/auth/register
 */
export const registerAdmin = async (req, res) => {
  try {
    const { email, phoneNumber, password } = req.body;

    if (!email || !phoneNumber || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await Admin.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    if (existing) {
      return res.status(409).json({ message: "Admin already exists" });
    }

    const admin = await Admin.create({
      email,
      phoneNumber,
      password,
      role: "admin",
    });

    return res.status(201).json({
      message: "Admin registered successfully",
      admin: {
        id: admin._id,
        email: admin.email,
        phoneNumber: admin.phoneNumber,
        role: admin.role,
      }
    });

  } catch (err) {
    console.error("registerAdmin error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


/**
 * POST /api/admin/auth/login
 */
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email & password required" });

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isValid = await admin.isPasswordCorrect(password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = generateTokens(admin);
    admin.refreshToken = refreshToken;
    await admin.save();

    return res.status(200).json({
      message: "Login successful",
      admin: {
        id: admin._id,
        email: admin.email,
        phoneNumber: admin.phoneNumber,
        role: admin.role,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    console.error("loginAdmin error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ GET /api/admin/auth/me
 *  - Logged-in admin ka profile
 */
export const getAdminProfile = async (req, res) => {
  try {
    const adminId = req.user.id; // auth middleware se aa raha hai

    const admin = await Admin.findById(adminId).select(
      "_id email phoneNumber role createdAt"
    );

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    return res.status(200).json({
      admin: {
        id: admin._id,
        email: admin.email,
        phoneNumber: admin.phoneNumber,
        role: admin.role,
        createdAt: admin.createdAt,
      },
    });
  } catch (err) {
    console.error("getAdminProfile error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ POST /api/admin/auth/logout
 *  - Refresh token ko DB se clear karega
 */
export const logoutAdmin = async (req, res) => {
  try {
    const adminId = req.user.id;

    await Admin.findByIdAndUpdate(adminId, {
      $set: { refreshToken: null },
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("logoutAdmin error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ POST /api/admin/auth/refresh-token
 *  - body: { refreshToken }
 *  - naya accessToken + refreshToken return karega
 */
export const refreshAdminToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    // 1️⃣ Token verify karo
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken); // { id, role, iat, exp }
    } catch (err) {
      console.error("refreshAdminToken verify error:", err.message);
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // 2️⃣ Sirf admin role allow
    if (decoded.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Refresh token does not belong to admin" });
    }

    // 3️⃣ DB me refreshToken match karo (token rotation / security)
    const admin = await Admin.findOne({
      _id: decoded.id,
      refreshToken,
    });

    if (!admin) {
      return res
        .status(401)
        .json({ message: "Admin not found or refresh token mismatch" });
    }

    // 4️⃣ New tokens generate + refreshToken rotate
    const tokens = generateTokens(admin);
    admin.refreshToken = tokens.refreshToken;
    await admin.save();

    return res.status(200).json({
      message: "Token refreshed",
      tokens,
    });
  } catch (err) {
    console.error("refreshAdminToken error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
