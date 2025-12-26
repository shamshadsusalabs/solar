import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";

// ✅ Using environment variables for security
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "fallback-access-secret-key";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "fallback-refresh-secret-key";

const ACCESS_TOKEN_EXPIRY = "7d";
const REFRESH_TOKEN_EXPIRY = "30d";

export const generateTokens = (user) => {
  const payload = {
    id: user._id,
    role: user.role, // "admin", "employee", "manager", "store"
  };

  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });

  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
};
