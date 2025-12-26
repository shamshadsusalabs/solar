// routes/chiefDashboard.routes.js
import express from "express";
import { getChiefDashboard } from "../controllers/chiefDashboard.controller.js";
import { auth, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();

// GET /api/chief/dashboard
router.get("/dashboard", auth, requireRole("chief"), getChiefDashboard);

export default router;
