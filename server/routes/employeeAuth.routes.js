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
router.get("/me",  getEmployeeProfile);
router.post("/logout",  logoutEmployee);

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
  
  upload.single("aadhaarFile"), // 👈 field name from frontend
  uploadEmployeeAadhaar
);

// Aadhaar filled status
router.get(
  "/aadhaar/status",
  
  getEmployeeAadhaarStatus
);

router.get("/employees",  getAllEmployeesForAdmin);

export default router;






