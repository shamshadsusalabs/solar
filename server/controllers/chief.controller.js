// server/controllers/chief.controller.js
import Chief from "../models/chief.model.js";
import { generateTokens, verifyRefreshToken } from "../utils/token.js";

// ============= GET CHIEF PROFILE =============
export const getChiefProfile = async (req, res) => {
    try {
        const chiefId = req.user.id;

        const chief = await Chief.findById(chiefId).select(
            "-password -refreshToken"
        );

        if (!chief) {
            return res.status(404).json({
                success: false,
                message: "Chief not found",
            });
        }

        res.status(200).json({
            success: true,
            data: {
                id: chief._id,
                email: chief.email,
                name: chief.name,
                phoneNumber: chief.phoneNumber,
            },
        });
    } catch (error) {
        console.error("Get Chief Profile Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch profile",
        });
    }
};

// ============= GET ALL CHIEFS =============
export const getAllChiefs = async (req, res) => {
    try {
        const chiefs = await Chief.find()
            .select("-password -refreshToken")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: chiefs,
        });
    } catch (error) {
        console.error("Get All Chiefs Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch chiefs",
        });
    }
};

// ============= REGISTER =============
export const registerChief = async (req, res) => {
    try {
        const { email, name, password, phoneNumber } = req.body;

        // Validation
        if (!email || !name || !password || !phoneNumber) {
            return res.status(400).json({
                success: false,
                message: "Email, name, password, and phone number are required",
            });
        }

        // Check if chief already exists
        const existingChief = await Chief.findOne({
            $or: [{ email }, { phoneNumber }],
        });

        if (existingChief) {
            return res.status(400).json({
                success: false,
                message: "Chief with this email or phone number already exists",
            });
        }

        // Create chief
        const chief = await Chief.create({
            email,
            name,
            password,
            phoneNumber,
        });

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens({
            _id: chief._id,
            role: "chief",
        });

        // Save refresh token
        chief.refreshToken = refreshToken;
        await chief.save();

        res.status(201).json({
            success: true,
            message: "Chief registered successfully",
            data: {
                id: chief._id,
                email: chief.email,
                name: chief.name,
                phoneNumber: chief.phoneNumber,
            },
            tokens: {
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        console.error("Register Chief Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to register chief",
        });
    }
};

// ============= LOGIN =============
export const loginChief = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        // Find chief
        const chief = await Chief.findOne({ email });

        if (!chief) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Check password
        const isPasswordValid = await chief.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens({
            _id: chief._id,
            role: "chief",
        });

        // Save refresh token
        chief.refreshToken = refreshToken;
        await chief.save();

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                id: chief._id,
                email: chief.email,
                name: chief.name,
                phoneNumber: chief.phoneNumber,
            },
            tokens: {
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        console.error("Login Chief Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to login",
        });
    }
};

// ============= REFRESH TOKEN =============
export const refreshChiefToken = async (req, res) => {
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

        // Find chief
        const chief = await Chief.findById(decoded.id);

        if (!chief || chief.refreshToken !== refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token",
            });
        }

        // Generate new tokens
        const tokens = generateTokens({
            _id: chief._id,
            role: "chief",
        });

        // Save new refresh token
        chief.refreshToken = tokens.refreshToken;
        await chief.save();

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
export const updateChief = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, name, phoneNumber, password } = req.body;

        const chief = await Chief.findById(id);

        if (!chief) {
            return res.status(404).json({
                success: false,
                message: "Chief not found",
            });
        }

        // Update fields
        if (email) chief.email = email;
        if (name) chief.name = name;
        if (phoneNumber) chief.phoneNumber = phoneNumber;
        if (password) chief.password = password; // Will be hashed by pre-save hook

        await chief.save();

        res.status(200).json({
            success: true,
            message: "Chief updated successfully",
            data: {
                id: chief._id,
                email: chief.email,
                name: chief.name,
                phoneNumber: chief.phoneNumber,
            },
        });
    } catch (error) {
        console.error("Update Chief Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to update chief",
        });
    }
};

// ============= DELETE =============
export const deleteChief = async (req, res) => {
    try {
        const { id } = req.params;

        const chief = await Chief.findByIdAndDelete(id);

        if (!chief) {
            return res.status(404).json({
                success: false,
                message: "Chief not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Chief deleted successfully",
        });
    } catch (error) {
        console.error("Delete Chief Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to delete chief",
        });
    }
};
