import { Router } from "express";
import {
  registerEmployee,
  loginEmployee,
  getEmployeeProfile,
  logoutEmployee,
  refreshEmployeeToken,uploadEmployeeAadhaar,
  getEmployeeAadhaarStatus,getAllEmployeesForAdmin
} from "../controllers/employeeAuth.controller.js";
import { auth, requireRole } from "../middleware/auth.middleware.js";
import multer from "multer";
const router = Router();

// Public
router.post("/register", auth, requireRole("admin"), registerEmployee);
router.post("/login", loginEmployee);
router.post("/refresh-token", refreshEmployeeToken);

// Protected (employee only)
router.get("/me", auth, requireRole("employee"), getEmployeeProfile);
router.post("/logout", auth, requireRole("employee"), logoutEmployee);

// Simple disk storage
const upload = multer({
  dest: "uploads/", // temp folder
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

// Aadhaar upload route
router.patch(
  "/aadhaar",
  auth,
  requireRole("employee"),
  upload.single("aadhaarFile"), // 👈 field name from frontend
  uploadEmployeeAadhaar
);

// Aadhaar filled status
router.get(
  "/aadhaar/status",
  auth,
  requireRole("employee"),
  getEmployeeAadhaarStatus
);

router.get("/employees", auth, requireRole("admin"), getAllEmployeesForAdmin);

export default router;






