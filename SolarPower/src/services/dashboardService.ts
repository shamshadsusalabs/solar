// src/services/dashboardService.ts
import { apiFetch } from "./api";

export interface DashboardCardStats {
  totalEmployees: number;
  totalManagers: number;
  totalChiefs: number;
  totalGodownIncharges: number;
  totalLeads: number;
  activeLeads: number;
  completedLeads: number;
}

export interface LeadStatusCount {
  status: string;
  count: number;
}

export interface RecentLead {
  _id: string;
  customerName: string;
  salesManName: string;
  status: string;
  createdAt: string;
}

export interface TopEmployee {
  employeeId: string;
  employeeCode: string;
  name: string;
  leadCount: number;
}

export interface AdminDashboardResponse {
  success: boolean;
  data: {
    cards: DashboardCardStats;
    statusBreakdown: LeadStatusCount[];
    recentLeads: RecentLead[];
    topEmployees: TopEmployee[];
  };
}

export const getAdminDashboardService = async (accessToken: string) => {
  const data = await apiFetch<AdminDashboardResponse>("/api/admin/dashboard", {
    method: "GET",
    token: accessToken,
  });

  return data;
};
