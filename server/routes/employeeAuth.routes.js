import { Router } from "express";
import {
  registerEmployee,
  loginEmployee,
  getEmployeeProfile,
  logoutEmployee,
  refreshEmployeeToken,
  uploadEmployeeAadhaar,
  getEmployeeAadhaarStatus,
  getAllEmployeesForAdmin,
  updateEmployee,
  deleteEmployee,
  verifyEmployeeAadhaar, // ✅ Admin Aadhaar verification
} from "../controllers/employeeAuth.controller.js";
import { auth, requireRole } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.js"; // ✅ Use default export
const router = Router();

// Public
router.post("/register", auth, requireRole("admin"), registerEmployee);
router.post("/login", loginEmployee);
router.post("/refresh-token", refreshEmployeeToken);

// Protected (employee only)
router.get("/me", auth, requireRole("employee"), getEmployeeProfile);
router.post("/logout", auth, requireRole("employee"), logoutEmployee);

// Aadhaar upload route with debug logging
router.patch(
  "/aadhaar",
  (req, res, next) => {
    console.log("🟢 /aadhaar route hit!");
    console.log("  Headers:", req.headers["content-type"]);
    console.log("  Auth:", req.headers["authorization"] ? "Present" : "Missing");
    next();
  },
  auth,
  requireRole("employee"),
  upload.single("aadhaarFile"), // 👈 field name from frontend
  uploadEmployeeAadhaar
);

// Aadhaar filled status
router.get(
  "/aadhaar/status",
  auth, requireRole("employee"),
  getEmployeeAadhaarStatus
);

router.get("/employees", auth, requireRole("admin"), getAllEmployeesForAdmin);

// Update employee (admin only)
router.patch("/:employeeId", auth, requireRole("admin"), updateEmployee);

// Delete employee (admin only)
router.delete("/:employeeId", auth, requireRole("admin"), deleteEmployee);

// ✅ Admin: Verify (approve/reject) employee Aadhaar
router.patch(
  "/aadhaar/verify/:employeeId",
  auth,
  requireRole("admin"),
  verifyEmployeeAadhaar
);

export default router;






