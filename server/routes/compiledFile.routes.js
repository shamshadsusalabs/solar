// routes/compiledFile.routes.js
import express from "express";
import {
    uploadCompiledFile,
    deleteCompiledFile,
    getCompiledFile,
} from "../controllers/compiledFile.controller.js";
import { auth } from "../middleware/auth.middleware.js";
import { uploadCompiledPDF } from "../middleware/upload.js";

const router = express.Router();

// All routes require authentication
router.use(auth);

// Middleware to check if user is admin, manager, or chief
const requireAdminManagerOrChief = (req, res, next) => {
    const userRole = req.user?.role;

    if (userRole === "admin" || userRole === "manager" || userRole === "chief") {
        return next();
    }

    return res.status(403).json({
        success: false,
        message: "Access denied. Only Admin, Manager, and Chief can perform this action.",
    });
};

// Upload compiled PDF to a lead (Admin, Manager, Chief only)
router.post(
    "/:leadId/compiled-file",
    requireAdminManagerOrChief,
    uploadCompiledPDF,
    uploadCompiledFile
);

// Get compiled file URL (All authenticated users)
router.get("/:leadId/compiled-file", getCompiledFile);

// Delete compiled file (Admin, Manager, Chief only)
router.delete("/:leadId/compiled-file", requireAdminManagerOrChief, deleteCompiledFile);

export default router;
