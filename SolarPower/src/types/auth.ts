// src/types/auth.ts

export type UserRole = "admin" | "employee" | "manager" | "chief" | "godown_incharge";

export type Admin = {
  id: string;
  email: string;
  phoneNumber: string;
  role: "admin";
};

export type Employee = {
  id: string;
  employeeCode: string;
  name: string;
  phoneNumber: string;
  role: "employee";
  isVerified: boolean;
};

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

export type AdminLoginResponse = {
  message: string;
  admin: Admin;
  tokens: Tokens;
};

export type EmployeeLoginResponse = {
  message: string;
  employee: Employee;
  tokens: Tokens;
};

export type RefreshTokenResponse = {
  tokens: Tokens;
};
