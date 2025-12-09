// src/services/employeeDashboardService.ts
import { apiFetch } from "./api";

export interface EmployeeDashboardTotals {
  totalLeads: number;
  activeLeads: number;
  closedLeads: number;
  totalTropositeAmount: number;
  totalDocuments: number;
}

export interface EmployeeStatusSummaryItem {
  status: string;
  count: number;
}

export interface EmployeeRecentLead {
  _id?: string;
  customerName: string;
  contactNumber: string;
  addressText: string;
  status: string;
  tropositeAmount?: number;
  createdAt: string;
}

export interface EmployeeDashboardResponse {
  success: boolean;
  data: {
    totals: EmployeeDashboardTotals;
    statusSummary: EmployeeStatusSummaryItem[];
    recentLeads: EmployeeRecentLead[];
  };
}

export const getEmployeeDashboardService = async (accessToken: string) => {
  const data = await apiFetch<EmployeeDashboardResponse>(
    "/api/employee/dashboard",
    {
      method: "GET",
      token: accessToken,
    }
  );

  return data;
};
