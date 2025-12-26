// server/controllers/manager.controller.js
import Manager from "../models/manager.model.js";
import { generateTokens, verifyRefreshToken } from "../utils/token.js";

// ============= GET MANAGER PROFILE =============
export const getManagerProfile = async (req, res) => {
    try {
        const managerId = req.user.id;

        const manager = await Manager.findById(managerId).select(
            "-password -refreshToken"
        );

        if (!manager) {
            return res.status(404).json({
                success: false,
                message: "Manager not found",
            });
        }

        res.status(200).json({
            success: true,
            data: {
                id: manager._id,
                email: manager.email,
                name: manager.name,
                phoneNumber: manager.phoneNumber,
            },
        });
    } catch (error) {
        console.error("Get Manager Profile Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch profile",
        });
    }
};

// ============= GET ALL MANAGERS =============
export const getAllManagers = async (req, res) => {
    try {
        const managers = await Manager.find()
            .select("-password -refreshToken")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: managers,
        });
    } catch (error) {
        console.error("Get All Managers Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch managers",
        });
    }
};

// ============= REGISTER =============
export const registerManager = async (req, res) => {
    try {
        const { email, name, password, phoneNumber } = req.body;

        // Validation
        if (!email || !name || !password || !phoneNumber) {
            return res.status(400).json({
                success: false,
                message: "Email, name, password, and phone number are required",
            });
        }

        // Check if manager already exists
        const existingManager = await Manager.findOne({
            $or: [{ email }, { phoneNumber }],
        });

        if (existingManager) {
            return res.status(400).json({
                success: false,
                message: "Manager with this email or phone number already exists",
            });
        }

        // Create manager
        const manager = await Manager.create({
            email,
            name,
            password,
            phoneNumber,
        });

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens({
            _id: manager._id,
            role: "manager",
        });

        // Save refresh token
        manager.refreshToken = refreshToken;
        await manager.save();

        res.status(201).json({
            success: true,
            message: "Manager registered successfully",
            data: {
                id: manager._id,
                email: manager.email,
                name: manager.name,
                phoneNumber: manager.phoneNumber,
            },
            tokens: {
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        console.error("Register Manager Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to register manager",
        });
    }
};

// ============= LOGIN =============
export const loginManager = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        // Find manager
        const manager = await Manager.findOne({ email });

        if (!manager) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Check password
        const isPasswordValid = await manager.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens({
            _id: manager._id,
            role: "manager",
        });

        // Save refresh token
        manager.refreshToken = refreshToken;
        await manager.save();

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                id: manager._id,
                email: manager.email,
                name: manager.name,
                phoneNumber: manager.phoneNumber,
            },
            tokens: {
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        console.error("Login Manager Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to login",
        });
    }
};

// ============= REFRESH TOKEN =============
export const refreshManagerToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: "Refresh token is required",
            });
        }

        // Verify refresh token
        let decoded;
        try {
            decoded = verifyRefreshToken(refreshToken);
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired refresh token",
            });
        }

        // Find manager
        const manager = await Manager.findById(decoded.id);

        if (!manager || manager.refreshToken !== refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token",
            });
        }

        // Generate new tokens
        const tokens = generateTokens({
            _id: manager._id,
            role: "manager",
        });

        // Save new refresh token
        manager.refreshToken = tokens.refreshToken;
        await manager.save();

        res.status(200).json({
            success: true,
            message: "Tokens refreshed successfully",
            tokens,
        });
    } catch (error) {
        console.error("Refresh Token Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to refresh token",
        });
    }
};

// ============= UPDATE =============
export const updateManager = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, name, phoneNumber, password } = req.body;

        const manager = await Manager.findById(id);

        if (!manager) {
            return res.status(404).json({
                success: false,
                message: "Manager not found",
            });
        }

        // Update fields
        if (email) manager.email = email;
        if (name) manager.name = name;
        if (phoneNumber) manager.phoneNumber = phoneNumber;
        if (password) manager.password = password; // Will be hashed by pre-save hook

        await manager.save();

        res.status(200).json({
            success: true,
            message: "Manager updated successfully",
            data: {
                id: manager._id,
                email: manager.email,
                name: manager.name,
                phoneNumber: manager.phoneNumber,
            },
        });
    } catch (error) {
        console.error("Update Manager Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to update manager",
        });
    }
};

// ============= DELETE =============
export const deleteManager = async (req, res) => {
    try {
        const { id } = req.params;

        const manager = await Manager.findByIdAndDelete(id);

        if (!manager) {
            return res.status(404).json({
                success: false,
                message: "Manager not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Manager deleted successfully",
        });
    } catch (error) {
        console.error("Delete Manager Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to delete manager",
        });
    }
};
