import jwt from "jsonwebtoken";

// ⚠️ Tum env nahi use karna chahte, isliye yahan hard-coded rakha hai.
// Production me inhe strong random string bana dena.
const ACCESS_TOKEN_SECRET = "your-access-token-secret-key";
const REFRESH_TOKEN_SECRET = "your-refresh-token-secret-key";

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

export const generateTokens = (user) => {
  const payload = {
    id: user._id,
    role: user.role, // "admin" ya "employee"
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
