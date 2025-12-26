// routes/godownInchargeDashboard.routes.js
import express from "express";
import { getGodownInchargeDashboard } from "../controllers/godownInchargeDashboard.controller.js";
import { auth, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();

// GET /api/godown-incharge/dashboard
router.get("/dashboard", auth, requireRole("godown_incharge"), getGodownInchargeDashboard);

export default router;
