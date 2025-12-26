// src/services/adminAuthService.ts

import { apiFetch } from "./api";
import {
  AdminLoginResponse,
  RefreshTokenResponse,
} from "../types/auth";

// 🔐 Login
export const loginAdminService = async (email: string, password: string) => {
  const body = { email, password };

  const data = await apiFetch<AdminLoginResponse>(
    "/api/admin/auth/login",
    {
      method: "POST",
      body,
    }
  );

  return data;
};

// ♻️ Refresh token
export const refreshAdminTokenService = async (refreshToken: string) => {
  const body = { refreshToken };

  const data = await apiFetch<RefreshTokenResponse>(
    "/api/admin/auth/refresh-token",
    {
      method: "POST",
      body,
    }
  );

  return data;
};

// 🚪 Logout
export const logoutAdminService = async (accessToken: string) => {
  // backend me: POST /logout, auth middleware
  return apiFetch<{ message: string }>(
    "/api/admin/auth/logout",
    {
      method: "POST",
      token: accessToken,
    }
  );
};

// 📝 Update admin profile
export const updateAdminProfileService = async (
  body: {
    email?: string;
    phoneNumber?: string;
    password?: string;
  },
  accessToken: string
) => {
  const data = await apiFetch<{
    message: string;
    admin: {
      id: string;
      email: string;
      phoneNumber: string;
      role: string;
    };
  }>(
    "/api/admin/auth/update",
    {
      method: "PUT",
      body,
      token: accessToken,
    }
  );

  return data;
};
