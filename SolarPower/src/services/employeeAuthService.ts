// src/services/employeeAuthService.ts

import { apiFetch } from "./api";
import {
  EmployeeLoginResponse,
  RefreshTokenResponse,
} from "../types/auth";

// 🔐 Login
export const loginEmployeeService = async (
  employeeCode: string,
  password: string
) => {
  const body = { employeeCode, password };

  const data = await apiFetch<EmployeeLoginResponse>(
    "/api/employee/auth/login",
    {
      method: "POST",
      body,
    }
  );

  return data;
};

// 🆕 Register employee
interface RegisterEmployeeBody {
  employeeCode: string;
  name: string;
  phoneNumber: string;
  password: string;
}

interface RegisterEmployeeResponse {
  message: string;
  employee: {
    id: string;
    employeeCode: string;
    name: string;
    phoneNumber: string;
    role: "employee";
    isVerified?: boolean;
  };
}

export const registerEmployeeService = async (
  body: RegisterEmployeeBody,
  adminAccessToken: string
) => {
  const data = await apiFetch<RegisterEmployeeResponse>(
    "/api/employee/auth/register", // ya jo bhi tumhara backend route hai
    {
      method: "POST",
      body,
      token: adminAccessToken, // ✅ admin ka token jaa raha hai
    }
  );

  return data;
};

// 🧍‍♂️ Get logged-in employee profile
export interface EmployeeProfileResponse {
  employee: {
    id: string;
    employeeCode: string;
    name: string;
    phoneNumber: string;
    role: "employee";
    isVerified?: boolean;
    aadhaarNumber?: string | null;
    aadhaarUrl?: string | null;
    createdAt?: string;
  };
}

export const getEmployeeProfileService = async (accessToken: string) => {
  const data = await apiFetch<EmployeeProfileResponse>(
    "/api/employee/auth/me",
    {
      method: "GET",
      token: accessToken,
    }
  );

  return data;
};

// ♻️ Refresh token
export const refreshEmployeeTokenService = async (refreshToken: string) => {
  const body = { refreshToken };

  const data = await apiFetch<RefreshTokenResponse>(
    "/api/employee/auth/refresh-token",
    {
      method: "POST",
      body,
    }
  );

  return data;
};

// 🚪 Logout
export const logoutEmployeeService = async (accessToken: string) => {
  return apiFetch<{ message: string }>(
    "/api/employee/auth/logout",
    {
      method: "POST",
      token: accessToken,
    }
  );
};

// 🧾 Aadhaar upload response type
export interface UploadEmployeeAadhaarResponse {
  message: string;
  employee: {
    _id: string;
    employeeCode: string;
    name: string;
    phoneNumber: string;
    aadhaarNumber: string | null;
    aadhaarUrl: string | null;
    isFilled: boolean;
    role: "employee";
  };
}

// 📤 Upload Aadhaar (multipart/form-data)
// ⚠️ formData me "aadhaarNumber" + "aadhaarFile" (image) hona chahiye
export const uploadEmployeeAadhaarService = async (
  formData: FormData,
  accessToken: string
) => {
  const data = await apiFetch<UploadEmployeeAadhaarResponse>(
    "/api/employee/aadhaar",
    {
      method: "PATCH",
      token: accessToken,
      body: formData,
    }
  );

  return data;
};

// ✅ Aadhaar status
export interface EmployeeAadhaarStatusResponse {
  isFilled: boolean;
  hasAadhaarNumber: boolean;
  hasAadhaarFile: boolean;
  employeeCode: string;
  name: string;
}

export const getEmployeeAadhaarStatusService = async (
  accessToken: string
) => {
  const data = await apiFetch<EmployeeAadhaarStatusResponse>(
    "/api/employee/aadhaar/status",
    {
      method: "GET",
      token: accessToken,
    }
  );

  return data;
};

export interface AdminEmployee {
  _id: string;
  employeeCode: string;
  name: string;
  phoneNumber: string;
  aadhaarNumber: string | null;
  aadhaarUrl: string | null;
  isFilled: boolean;
  role: "employee";
  createdAt: string;
}

// 🔹 Response type
export interface AdminEmployeesListResponse {
  data: AdminEmployee[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 🔹 Service: Get all employees (admin only)
export const getAllEmployeesForAdminService = async (
  accessToken: string,
  options?: {
    page?: number;
    limit?: number;
    search?: string;
  }
) => {
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 20;
  const search = options?.search ?? "";

  const query = new URLSearchParams();
  query.append("page", String(page));
  query.append("limit", String(limit));
  if (search) {
    query.append("search", search);
  }

  const url = `/api/employee/auth/employees?${query.toString()}`;

  const data = await apiFetch<AdminEmployeesListResponse>(url, {
    method: "GET",
    token: accessToken,
  });

  return data;
};