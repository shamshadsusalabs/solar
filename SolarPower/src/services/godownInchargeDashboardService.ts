// src/services/godownInchargeDashboardService.ts
import { apiFetch } from "./api";

export interface GodownInchargeDashboardTotals {
    totalLeads: number;
    activeLeads: number;
    closedLeads: number;
    totalSystemCostQuoted: number;
    totalDocuments: number;
}

export interface GodownInchargeStatusSummaryItem {
    status: string;
    count: number;
}

export interface GodownInchargeRecentLead {
    _id?: string;
    customerName: string;
    contactNumber: string;
    addressText: string;
    status: string;
    systemCostQuoted?: number;
    createdAt: string;
}

export interface GodownInchargeDashboardResponse {
    success: boolean;
    data: {
        totals: GodownInchargeDashboardTotals;
        statusSummary: GodownInchargeStatusSummaryItem[];
        recentLeads: GodownInchargeRecentLead[];
    };
}

export const getGodownInchargeDashboardService = async (accessToken: string) => {
    const data = await apiFetch<GodownInchargeDashboardResponse>(
        "/api/godown-incharge/dashboard",
        {
            method: "GET",
            token: accessToken,
        }
    );

    return data;
};
