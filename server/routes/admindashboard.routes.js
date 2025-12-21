// routes/adminDashboard.routes.js (ya jaha bhi rakhna ho)
import express from "express";
import { getAdminDashboard } from "../controllers/admin.dashboard.js";


import { auth, requireRole } from "../middleware/auth.middleware.js";
const router = express.Router();

router.get(
  "/dashboard",
  getAdminDashboard
);

export default router;
