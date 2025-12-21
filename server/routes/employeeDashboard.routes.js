import express from "express";
import { auth, requireRole } from "../middleware/auth.middleware.js";

import { getEmployeeDashboard } from "../controllers/employeeDashboard.controller.js";

const router = express.Router();

// GET /api/employee/dashboard
router.get(
  "/dashboard",
  
  getEmployeeDashboard
);

export default router;
