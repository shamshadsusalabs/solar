// src/routes/adminAuth.routes.js
import { Router } from "express";
import {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  logoutAdmin,
  refreshAdminToken,
} from "../controllers/adminAuth.controller.js";
import { auth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

// Public
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/refresh-token", refreshAdminToken);

// Protected (admin only)
router.get("/me",  getAdminProfile);
router.post("/logout", logoutAdmin);

export default router;
