// src/middlewares/auth.middleware.js

import { verifyAccessToken } from "../utils/token.js";
import { Admin } from "../models/admin.model.js";
import { Employee } from "../models/employee.model.js";
import Manager from "../models/manager.model.js";
import Chief from "../models/chief.model.js";
import GodownIncharge from "../models/godownIncharge.model.js";

export const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"] || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    if (!decoded?.id || !decoded?.role) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    let userDoc = null;
    let userRole = null;

    if (decoded.role === "admin") {
      userDoc = await Admin.findById(decoded.id).select("_id role");
      if (userDoc) {
        userRole = userDoc.role;
      }
    } else if (decoded.role === "employee") {
      userDoc = await Employee.findById(decoded.id).select("_id role");
      if (userDoc) {
        userRole = userDoc.role;
      }
    } else if (decoded.role === "manager") {
      userDoc = await Manager.findById(decoded.id).select("_id");
      if (userDoc) {
        userRole = "manager";
      }
    } else if (decoded.role === "chief") {
      userDoc = await Chief.findById(decoded.id).select("_id");
      if (userDoc) {
        userRole = "chief";
      }
    } else if (decoded.role === "godown_incharge") {
      userDoc = await GodownIncharge.findById(decoded.id).select("_id");
      if (userDoc) {
        userRole = "godown_incharge";
      }
    } else {
      return res.status(401).json({ message: "Unknown role" });
    }

    if (!userDoc) {
      return res.status(401).json({ message: "User not found or role mismatch" });
    }

    req.user = { id: decoded.id, role: userRole };
    next();
  } catch (error) {
    return res.status(500).json({ message: "Server error in auth" });
  }
};

// requireRole middleware
export const requireRole = (allowedRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized – no user" });
    }

    if (req.user.role !== allowedRole) {
      return res.status(403).json({
        message: `Forbidden – requires ${allowedRole}, got ${req.user.role}`,
      });
    }

    next();
  };
};

// requireRoles middleware (OR logic)
export const requireRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized – no user" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden – allowed: [${allowedRoles.join(", ")}], got ${req.user.role}`,
      });
    }

    next();
  };
};
