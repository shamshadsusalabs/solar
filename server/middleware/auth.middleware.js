// src/middlewares/auth.middleware.js

import { verifyAccessToken } from "../utils/token.js";
import { Admin } from "../models/admin.model.js";
import { Employee } from "../models/employee.model.js";

export const auth = async (req, res, next) => {
  try {
    console.log("===== AUTH MIDDLEWARE START =====");

    // 1️⃣ Read header
    const authHeader = req.headers["authorization"] || "";
    console.log("Authorization header:", authHeader);

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    console.log("Extracted token:", token ? token.slice(0, 20) + "..." : "❌ NO TOKEN");

    if (!token) {
      console.log("❌ No token provided");
      return res.status(401).json({ message: "No token provided" });
    }

    // 2️⃣ Verify token
    let decoded;
    try {
      decoded = verifyAccessToken(token); // { id, role, exp... }
      console.log("✅ Token decoded:", decoded);
    } catch (err) {
      console.log("❌ Token verify failed:", err.message);
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    if (!decoded?.id || !decoded?.role) {
      console.log("❌ Invalid decoded payload:", decoded);
      return res.status(401).json({ message: "Invalid token payload" });
    }

    console.log("Decoded user id:", decoded.id);
    console.log("Decoded user role:", decoded.role);

    // 3️⃣ DB lookup
    let userDoc = null;

    if (decoded.role === "admin") {
      console.log("🔎 Searching ADMIN in DB...");
      userDoc = await Admin.findById(decoded.id).select("_id role");
    } else if (decoded.role === "employee") {
      console.log("🔎 Searching EMPLOYEE in DB...");
      userDoc = await Employee.findById(decoded.id).select("_id role");
    } else {
      console.log("❌ Invalid role type:", decoded.role);
      return res.status(401).json({ message: "Unknown role in token" });
    }

    console.log("DB user found:", userDoc);

    if (!userDoc) {
      console.log("❌ User not found in DB");
      return res.status(401).json({ message: "User not found or deleted" });
    }

    // 4️⃣ attach user
    req.user = {
      id: userDoc._id.toString(),
      role: userDoc.role,
    };

    console.log("✅ req.user set:", req.user);
    console.log("===== AUTH MIDDLEWARE PASS =====");

    next();
  } catch (err) {
    console.log("🔥 AUTH MIDDLEWARE ERROR:");
    console.log("Message:", err.message);
    console.log("Stack:", err.stack);

    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// ✅ Role guard (same)
export const requireRole = (requiredRole) => {
  return (req, res, next) => {
    console.log("===== ROLE CHECK =====");
    console.log("Required:", requiredRole);
    console.log("User:", req.user);

    if (!req.user || req.user.role !== requiredRole) {
      console.log("❌ Role forbidden");
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }

    console.log("✅ Role allowed");
    next();
  };
};
