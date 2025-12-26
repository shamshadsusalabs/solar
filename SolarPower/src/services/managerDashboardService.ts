// src/services/managerDashboardService.ts
import { apiFetch } from "./api";

export interface ManagerDashboardTotals {
    totalLeads: number;
    activeLeads: number;
    closedLeads: number;
    totalSystemCostQuoted: number;
    totalDocuments: number;
}

export interface ManagerStatusSummaryItem {
    status: string;
    count: number;
}

export interface ManagerRecentLead {
    _id?: string;
    customerName: string;
    contactNumber: string;
    addressText: string;
    status: string;
    systemCostQuoted?: number;
    createdAt: string;
}

export interface ManagerDashboardResponse {
    success: boolean;
    data: {
        totals: ManagerDashboardTotals;
        statusSummary: ManagerStatusSummaryItem[];
        recentLeads: ManagerRecentLead[];
    };
}

export const getManagerDashboardService = async (accessToken: string) => {
    const data = await apiFetch<ManagerDashboardResponse>(
        "/api/manager/dashboard",
        {
            method: "GET",
            token: accessToken,
        }
    );

    return data;
};
