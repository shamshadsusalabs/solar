// src/controllers/employeeAadhaar.controller.js
import fs from "fs";
import cloudinary from "../utils/cloudinary.js";
import { Employee } from "../models/employee.model.js";
import { generateTokens, verifyRefreshToken } from "../utils/token.js";

/**
 * POST /api/employee/auth/register
 * ✅ No tokens here
 * ✅ No aadhaar here (will be updated later)
 */
export const registerEmployee = async (req, res) => {
  try {
    const { employeeCode, name, phoneNumber, password } = req.body;

    if (!employeeCode || !name || !phoneNumber || !password) {
      return res.status(400).json({ message: "All required fields missing" });
    }

    const existing = await Employee.findOne({
      $or: [{ employeeCode }, { phoneNumber }],
    });

    if (existing) {
      return res
        .status(409)
        .json({ message: "Employee code or phone already exists" });
    }

    const employee = await Employee.create({
      employeeCode,
      name,
      phoneNumber,
      password,
      role: "employee",
    });

    return res.status(201).json({
      message: "Employee registered successfully",
      employee: {
        id: employee._id,
        employeeCode: employee.employeeCode,
        name: employee.name,
        phoneNumber: employee.phoneNumber,
        role: employee.role,
        isVerified: employee.isVerified,
      },
    });
  } catch (err) {
    console.error("registerEmployee error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/employee/auth/login
 * ✅ Yahan tokens banenge
 */
export const loginEmployee = async (req, res) => {
  try {
    const { employeeCode, password } = req.body;

    if (!employeeCode || !password)
      return res
        .status(400)
        .json({ message: "Employee code & password required" });

    const employee = await Employee.findOne({ employeeCode });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // ✅ Agar Aadhaar verification ko mandatory rakhna hai to uncomment:
    // if (!employee.isVerified) {
    //   return res
    //     .status(403)
    //     .json({ message: "Aadhaar verification pending" });
    // }

    const isValid = await employee.isPasswordCorrect(password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = generateTokens(employee);
    employee.refreshToken = refreshToken;
    await employee.save();

    return res.status(200).json({
      message: "Login successful",
      employee: {
        id: employee._id,
        employeeCode: employee.employeeCode,
        name: employee.name,
        phoneNumber: employee.phoneNumber,
        role: employee.role,
        isVerified: employee.isVerified,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    console.error("loginEmployee error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ GET /api/employee/auth/me
 *  - Logged in employee ka profile
 */
export const getEmployeeProfile = async (req, res) => {
  try {
    const employeeId = req.user.id; // auth middleware se aaya

    const employee = await Employee.findById(employeeId).select(
      "_id employeeCode name phoneNumber role isVerified createdAt aadhaarNumber aadhaarUrl"
    );

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res.status(200).json({
      employee: {
        id: employee._id,
        employeeCode: employee.employeeCode,
        name: employee.name,
        phoneNumber: employee.phoneNumber,
        role: employee.role,
        isVerified: employee.isVerified,
        aadhaarNumber: employee.aadhaarNumber,
        aadhaarUrl: employee.aadhaarUrl,
        createdAt: employee.createdAt,
      },
    });
  } catch (err) {
    console.error("getEmployeeProfile error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ POST /api/employee/auth/logout
 *  - refreshToken clear
 */
export const logoutEmployee = async (req, res) => {
  try {
    const employeeId = req.user.id;

    await Employee.findByIdAndUpdate(employeeId, {
      $set: { refreshToken: null },
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("logoutEmployee error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ POST /api/employee/auth/refresh-token
 *  - body: { refreshToken }
 *  - naya access + refresh token dega
 */
export const refreshEmployeeToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken); // { id, role, ... }
    } catch (err) {
      console.error("refreshEmployeeToken verify error:", err.message);
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    if (decoded.role !== "employee") {
      return res
        .status(403)
        .json({ message: "Refresh token does not belong to employee" });
    }

    const employee = await Employee.findOne({
      _id: decoded.id,
      refreshToken,
    });

    if (!employee) {
      return res
        .status(401)
        .json({ message: "Employee not found or refresh token mismatch" });
    }

    const tokens = generateTokens(employee);
    employee.refreshToken = tokens.refreshToken;
    await employee.save();

    return res.status(200).json({
      message: "Token refreshed",
      tokens,
    });
  } catch (err) {
    console.error("refreshEmployeeToken error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};



/**
 * PATCH /api/employee/aadhaar
 * body: { aadhaarNumber }
 * file: aadhaarFile (multipart/form-data)
 */
export const uploadEmployeeAadhaar = async (req, res) => {
  try {
    const employeeId = req.user.id; // auth + employee se aa raha hai
    const { aadhaarNumber } = req.body;

    if (!aadhaarNumber || !req.file) {
      return res
        .status(400)
        .json({ message: "Aadhaar number & file are required" });
    }

    if (aadhaarNumber.length !== 12) {
      return res
        .status(400)
        .json({ message: "Aadhaar number must be 12 digits" });
    }

    // 1️⃣ Cloudinary upload
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "solar-power/employees/aadhaar",
      resource_type: "image",
    });

    // 2️⃣ Local file delete (optional but clean)
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Error deleting temp file:", err);
    });

    // 3️⃣ Employee update => aadhaar + isFilled: true
    const employee = await Employee.findByIdAndUpdate(
      employeeId,
      {
        $set: {
          aadhaarNumber,
          aadhaarUrl: uploadResult.secure_url,
          isFilled: true,
        },
      },
      { new: true }
    ).select(
      "_id employeeCode name phoneNumber aadhaarNumber aadhaarUrl isFilled role"
    );

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res.status(200).json({
      message: "Aadhaar uploaded & form marked as filled",
      employee,
    });
  } catch (err) {
    console.error("uploadEmployeeAadhaar error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/employee/aadhaar/status
 * ✅ Sirf isFilled true/false check
 */
export const getEmployeeAadhaarStatus = async (req, res) => {
  try {
    const employeeId = req.user.id;

    const employee = await Employee.findById(employeeId).select(
      "isFilled aadhaarNumber aadhaarUrl employeeCode name"
    );

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res.status(200).json({
      isFilled: employee.isFilled,
      // optional info:
      hasAadhaarNumber: !!employee.aadhaarNumber,
      hasAadhaarFile: !!employee.aadhaarUrl,
      employeeCode: employee.employeeCode,
      name: employee.name,
    });
  } catch (err) {
    console.error("getEmployeeAadhaarStatus error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
export const getAllEmployeesForAdmin = async (req, res) => {
  try {
    // ✅ Role check – sirf admin ko allow
    if (!req.user || req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Admins only." });
    }

    // 🔍 Optional query params
    const { search = "", page = 1, limit = 20 } = req.query;

    const query = {};

    if (search) {
      const regex = new RegExp(search, "i");

      // employeeCode / name / phoneNumber pe search
      query.$or = [
        { employeeCode: regex },
        { name: regex },
        { phoneNumber: regex },
      ];
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [employees, total] = await Promise.all([
      Employee.find(query)
        .select(
          "_id employeeCode name phoneNumber aadhaarNumber aadhaarUrl isFilled role createdAt"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Employee.countDocuments(query),
    ]);

    return res.status(200).json({
      data: employees,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("getAllEmployeesForAdmin error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};