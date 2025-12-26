// src/services/chiefDashboardService.ts
import { apiFetch } from "./api";

export interface ChiefDashboardTotals {
    totalLeads: number;
    activeLeads: number;
    closedLeads: number;
    totalSystemCostQuoted: number;
    totalDocuments: number;
}

export interface ChiefStatusSummaryItem {
    status: string;
    count: number;
}

export interface ChiefRecentLead {
    _id?: string;
    customerName: string;
    contactNumber: string;
    addressText: string;
    status: string;
    systemCostQuoted?: number;
    createdAt: string;
}

export interface ChiefDashboardResponse {
    success: boolean;
    data: {
        totals: ChiefDashboardTotals;
        statusSummary: ChiefStatusSummaryItem[];
        recentLeads: ChiefRecentLead[];
    };
}

export const getChiefDashboardService = async (accessToken: string) => {
    const data = await apiFetch<ChiefDashboardResponse>(
        "/api/chief/dashboard",
        {
            method: "GET",
            token: accessToken,
        }
    );

    return data;
};
