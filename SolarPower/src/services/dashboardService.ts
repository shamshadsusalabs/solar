// src/services/dashboardService.ts
import { apiFetch } from "./api";

export interface DashboardCardStats {
  totalInstallations: number;
  activeEmployees: number;
  totalFormsSubmitted: number;
}

export interface DashboardDailyInstall {
  date: string; // "2025-12-07"
  day: string;  // "Sun"
  count: number;
}

export interface DashboardEmployeeStat {
  employeeId: string;
  employeeCode: string;
  name: string;
  forms: number;
  createdAt?: string;
}

export interface AdminDashboardResponse {
  success: boolean;
  data: {
    cards: DashboardCardStats;
    dailyInstalls: DashboardDailyInstall[];
    employees: DashboardEmployeeStat[];
  };
}

export const getAdminDashboardService = async (accessToken: string) => {
  const data = await apiFetch<AdminDashboardResponse>("/api/admin/dashboard", {
    method: "GET",
    token: accessToken,
  });

  return data;
};
