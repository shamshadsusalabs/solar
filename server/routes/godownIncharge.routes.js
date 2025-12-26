// server/routes/godownIncharge.routes.js
import express from "express";
const router = express.Router();
import {
    registerGodownIncharge,
    loginGodownIncharge,
    refreshGodownInchargeToken,
    updateGodownIncharge,
    deleteGodownIncharge,
    getAllGodownIncharges,
    getGodownInchargeProfile,
} from "../controllers/godownIncharge.controller.js";
import { auth, requireRole } from "../middleware/auth.middleware.js";

// Public routes
router.post("/login", loginGodownIncharge);
router.post("/refresh-token", refreshGodownInchargeToken);

// Protected routes - Godown Incharge only
router.get("/profile", auth, requireRole("godown_incharge"), getGodownInchargeProfile);

// Protected routes - Admin only
router.get("/", auth, requireRole("admin"), getAllGodownIncharges);
router.post("/register", auth, requireRole("admin"), registerGodownIncharge);
router.put("/:id", auth, requireRole("admin"), updateGodownIncharge);
router.delete("/:id", auth, requireRole("admin"), deleteGodownIncharge);

export default router;
