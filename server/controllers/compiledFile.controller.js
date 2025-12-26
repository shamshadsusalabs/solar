// controllers/compiledFile.controller.js
import Lead from "../models/lead.model.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";

/**
 * Upload compiled PDF to Cloudinary and update lead
 * POST /api/leads/:leadId/compiled-file
 */
export const uploadCompiledFile = async (req, res) => {
    try {
        const { leadId } = req.params;

        // Check if file was uploaded via multer
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "PDF file is required",
            });
        }

        // Check if lead exists
        const lead = await Lead.findById(leadId);
        if (!lead) {
            // Delete uploaded file if lead doesn't exist
            if (req.file.path) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(404).json({
                success: false,
                message: "Lead not found",
            });
        }

        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
            folder: "solar_compiled_files",
            resource_type: "raw", // For PDFs
        });

        // Delete local file after Cloudinary upload
        if (req.file.path) {
            fs.unlinkSync(req.file.path);
        }

        // Update lead with compiled file URL
        lead.compiledFile = uploadResult.secure_url;
        await lead.save();

        return res.json({
            success: true,
            message: "Compiled PDF uploaded successfully",
            data: {
                compiledFileUrl: uploadResult.secure_url,
                leadId: lead._id,
            },
        });
    } catch (err) {
        console.error("UPLOAD COMPILED FILE ERROR:", err);

        // Clean up file on error
        if (req.file?.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (cleanupErr) {
                console.error("File cleanup error:", cleanupErr);
            }
        }

        return res.status(500).json({
            success: false,
            message: "Failed to upload compiled file",
            error: err.message,
        });
    }
};

/**
 * Delete compiled file from lead
 * DELETE /api/leads/:leadId/compiled-file
 */
export const deleteCompiledFile = async (req, res) => {
    try {
        const { leadId } = req.params;

        const lead = await Lead.findById(leadId);
        if (!lead) {
            return res.status(404).json({
                success: false,
                message: "Lead not found",
            });
        }

        if (!lead.compiledFile) {
            return res.status(404).json({
                success: false,
                message: "No compiled file found for this lead",
            });
        }

        // Extract public_id from Cloudinary URL and delete
        const urlParts = lead.compiledFile.split("/");
        const fileName = urlParts[urlParts.length - 1];
        const publicId = `solar_compiled_files/${fileName}`;

        try {
            await cloudinary.uploader.destroy(publicId, {
                resource_type: "raw",
            });
        } catch (cloudinaryErr) {
            console.error("Cloudinary deletion error:", cloudinaryErr);
            // Continue even if Cloudinary deletion fails
        }

        // Remove from lead
        lead.compiledFile = "";
        await lead.save();

        return res.json({
            success: true,
            message: "Compiled file deleted successfully",
        });
    } catch (err) {
        console.error("DELETE COMPILED FILE ERROR:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to delete compiled file",
            error: err.message,
        });
    }
};

/**
 * Get compiled file URL
 * GET /api/leads/:leadId/compiled-file
 */
export const getCompiledFile = async (req, res) => {
    try {
        const { leadId } = req.params;

        const lead = await Lead.findById(leadId).select("compiledFile");
        if (!lead) {
            return res.status(404).json({
                success: false,
                message: "Lead not found",
            });
        }

        return res.json({
            success: true,
            data: {
                compiledFileUrl: lead.compiledFile || null,
            },
        });
    } catch (err) {
        console.error("GET COMPILED FILE ERROR:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to get compiled file",
            error: err.message,
        });
    }
};
