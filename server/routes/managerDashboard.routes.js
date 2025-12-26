// routes/managerDashboard.routes.js
import express from "express";
import { getManagerDashboard } from "../controllers/managerDashboard.controller.js";

import { auth, requireRole } from "../middleware/auth.middleware.js";
const router = express.Router();

// GET /api/manager/dashboard
router.get("/dashboard", auth, requireRole("manager"), getManagerDashboard);

export default router;
