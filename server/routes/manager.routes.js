// server/routes/manager.routes.js
import express from "express";
const router = express.Router();
import {
    registerManager,
    loginManager,
    refreshManagerToken,
    updateManager,
    deleteManager,
    getAllManagers,
    getManagerProfile,
} from "../controllers/manager.controller.js";
import { auth, requireRole } from "../middleware/auth.middleware.js";

// Public routes
router.post("/login", loginManager);
router.post("/refresh-token", refreshManagerToken);

// Protected routes - Manager only
router.get("/profile", auth, requireRole("manager"), getManagerProfile);

// Protected routes - Admin only
router.get("/", auth, requireRole("admin"), getAllManagers);
router.post("/register", auth, requireRole("admin"), registerManager);
router.put("/:id", auth, requireRole("admin"), updateManager);
router.delete("/:id", auth, requireRole("admin"), deleteManager);

export default router;
