// server/controllers/godownIncharge.controller.js
import GodownIncharge from "../models/godownIncharge.model.js";
import { generateTokens, verifyRefreshToken } from "../utils/token.js";

// ============= GET GODOWN INCHARGE PROFILE =============
export const getGodownInchargeProfile = async (req, res) => {
    try {
        const godownInchargeId = req.user.id;

        const godownIncharge = await GodownIncharge.findById(godownInchargeId).select(
            "-password -refreshToken"
        );

        if (!godownIncharge) {
            return res.status(404).json({
                success: false,
                message: "Godown Incharge not found",
            });
        }

        res.status(200).json({
            success: true,
            data: {
                id: godownIncharge._id,
                email: godownIncharge.email,
                name: godownIncharge.name,
                phoneNumber: godownIncharge.phoneNumber,
            },
        });
    } catch (error) {
        console.error("Get Godown Incharge Profile Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch profile",
        });
    }
};

// ============= GET ALL GODOWN INCHARGES =============
export const getAllGodownIncharges = async (req, res) => {
    try {
        const godownIncharges = await GodownIncharge.find()
            .select("-password -refreshToken")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: godownIncharges,
        });
    } catch (error) {
        console.error("Get All Godown Incharges Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch godown incharges",
        });
    }
};

// ============= REGISTER =============
export const registerGodownIncharge = async (req, res) => {
    try {
        const { email, name, password, phoneNumber } = req.body;

        // Validation
        if (!email || !name || !password || !phoneNumber) {
            return res.status(400).json({
                success: false,
                message: "Email, name, password, and phone number are required",
            });
        }

        // Check if godown incharge already exists
        const existingGodownIncharge = await GodownIncharge.findOne({
            $or: [{ email }, { phoneNumber }],
        });

        if (existingGodownIncharge) {
            return res.status(400).json({
                success: false,
                message: "Godown Incharge with this email or phone number already exists",
            });
        }

        // Create godown incharge
        const godownIncharge = await GodownIncharge.create({
            email,
            name,
            password,
            phoneNumber,
        });

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens({
            _id: godownIncharge._id,
            role: "godown_incharge",
        });

        // Save refresh token
        godownIncharge.refreshToken = refreshToken;
        await godownIncharge.save();

        res.status(201).json({
            success: true,
            message: "Godown Incharge registered successfully",
            data: {
                id: godownIncharge._id,
                email: godownIncharge.email,
                name: godownIncharge.name,
                phoneNumber: godownIncharge.phoneNumber,
            },
            tokens: {
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        console.error("Register Godown Incharge Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to register godown incharge",
        });
    }
};

// ============= LOGIN =============
export const loginGodownIncharge = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        // Find godown incharge
        const godownIncharge = await GodownIncharge.findOne({ email });

        if (!godownIncharge) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Check password
        const isPasswordValid = await godownIncharge.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens({
            _id: godownIncharge._id,
            role: "godown_incharge",
        });

        // Save refresh token
        godownIncharge.refreshToken = refreshToken;
        await godownIncharge.save();

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                id: godownIncharge._id,
                email: godownIncharge.email,
                name: godownIncharge.name,
                phoneNumber: godownIncharge.phoneNumber,
            },
            tokens: {
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        console.error("Login Godown Incharge Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to login",
        });
    }
};

// ============= REFRESH TOKEN =============
export const refreshGodownInchargeToken = async (req, res) => {
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

        // Find godown incharge
        const godownIncharge = await GodownIncharge.findById(decoded.id);

        if (!godownIncharge || godownIncharge.refreshToken !== refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token",
            });
        }

        // Generate new tokens
        const tokens = generateTokens({
            _id: godownIncharge._id,
            role: "godown_incharge",
        });

        // Save new refresh token
        godownIncharge.refreshToken = tokens.refreshToken;
        await godownIncharge.save();

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
export const updateGodownIncharge = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, name, phoneNumber, password } = req.body;

        const godownIncharge = await GodownIncharge.findById(id);

        if (!godownIncharge) {
            return res.status(404).json({
                success: false,
                message: "Godown Incharge not found",
            });
        }

        // Update fields
        if (email) godownIncharge.email = email;
        if (name) godownIncharge.name = name;
        if (phoneNumber) godownIncharge.phoneNumber = phoneNumber;
        if (password) godownIncharge.password = password; // Will be hashed by pre-save hook

        await godownIncharge.save();

        res.status(200).json({
            success: true,
            message: "Godown Incharge updated successfully",
            data: {
                id: godownIncharge._id,
                email: godownIncharge.email,
                name: godownIncharge.name,
                phoneNumber: godownIncharge.phoneNumber,
            },
        });
    } catch (error) {
        console.error("Update Godown Incharge Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to update godown incharge",
        });
    }
};

// ============= DELETE =============
export const deleteGodownIncharge = async (req, res) => {
    try {
        const { id } = req.params;

        const godownIncharge = await GodownIncharge.findByIdAndDelete(id);

        if (!godownIncharge) {
            return res.status(404).json({
                success: false,
                message: "Godown Incharge not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Godown Incharge deleted successfully",
        });
    } catch (error) {
        console.error("Delete Godown Incharge Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to delete godown incharge",
        });
    }
};
