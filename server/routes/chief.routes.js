// server/routes/chief.routes.js
import express from "express";
const router = express.Router();
import {
    registerChief,
    loginChief,
    refreshChiefToken,
    updateChief,
    deleteChief,
    getAllChiefs,
    getChiefProfile,
} from "../controllers/chief.controller.js";
import { auth, requireRole } from "../middleware/auth.middleware.js";

// Public routes
router.post("/login", loginChief);
router.post("/refresh-token", refreshChiefToken);

// Protected routes - Chief only
router.get("/profile", auth, requireRole("chief"), getChiefProfile);

// Protected routes - Admin only
router.get("/", auth, requireRole("admin"), getAllChiefs);
router.post("/register", auth, requireRole("admin"), registerChief);
router.put("/:id", auth, requireRole("admin"), updateChief);
router.delete("/:id", auth, requireRole("admin"), deleteChief);

export default router;
