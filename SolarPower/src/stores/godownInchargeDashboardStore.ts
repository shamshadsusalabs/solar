// src/stores/godownInchargeDashboardStore.ts

import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
    getGodownInchargeDashboardService,
    type GodownInchargeDashboardTotals,
    type GodownInchargeStatusSummaryItem,
    type GodownInchargeRecentLead,
} from "../services/godownInchargeDashboardService";

const GODOWN_INCHARGE_DASHBOARD_STORAGE_KEY = "@solar_godown_incharge_dashboard_data";

// ============= TYPES =============
type GodownInchargeDashboardState = {
    totals: GodownInchargeDashboardTotals | null;
    statusSummary: GodownInchargeStatusSummaryItem[];
    recentLeads: GodownInchargeRecentLead[];
    loading: boolean;
    error: string | null;
    lastFetched: number | null;

    // Actions
    initDashboardFromStorage: () => Promise<void>;
    fetchDashboard: (godownInchargeToken: string) => Promise<void>;
    clearDashboardCache: () => Promise<void>;
};

// ============= HELPERS =============
const saveDashboardToStorage = async (data: {
    totals: GodownInchargeDashboardTotals | null;
    statusSummary: GodownInchargeStatusSummaryItem[];
    recentLeads: GodownInchargeRecentLead[];
    lastFetched: number;
}) => {
    try {
        await AsyncStorage.setItem(GODOWN_INCHARGE_DASHBOARD_STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
        // Silent error
    }
};

const clearDashboardStorage = async () => {
    try {
        await AsyncStorage.removeItem(GODOWN_INCHARGE_DASHBOARD_STORAGE_KEY);
    } catch (err) {
        // Silent error
    }
};

// ============= STORE =============
export const useGodownInchargeDashboardStore = create<GodownInchargeDashboardState>((set, get) => ({
    totals: null,
    statusSummary: [],
    recentLeads: [],
    loading: false,
    error: null,
    lastFetched: null,

    // ============= INIT FROM STORAGE =============
    initDashboardFromStorage: async () => {
        try {
            const raw = await AsyncStorage.getItem(GODOWN_INCHARGE_DASHBOARD_STORAGE_KEY);
            if (!raw) return;

            const parsed = JSON.parse(raw);

            set({
                totals: parsed.totals ?? null,
                statusSummary: parsed.statusSummary ?? [],
                recentLeads: parsed.recentLeads ?? [],
                lastFetched: parsed.lastFetched ?? null,
            });
        } catch (err) {
            // Silent error
        }
    },

    // ============= FETCH DASHBOARD =============
    fetchDashboard: async (godownInchargeToken: string) => {
        if (!godownInchargeToken) {
            set({ error: "Godown Incharge not logged in" });
            return;
        }

        set({ loading: true, error: null });

        try {
            const res = await getGodownInchargeDashboardService(godownInchargeToken);

            const newState = {
                totals: res.data.totals,
                statusSummary: res.data.statusSummary,
                recentLeads: res.data.recentLeads,
                lastFetched: Date.now(),
            };

            set({
                ...newState,
                loading: false,
            });

            await saveDashboardToStorage(newState);
        } catch (err: any) {
            set({
                loading: false,
                error: err?.message || "Failed to load dashboard",
            });
        }
    },

    // ============= CLEAR CACHE =============
    clearDashboardCache: async () => {
        await clearDashboardStorage();
        set({
            totals: null,
            statusSummary: [],
            recentLeads: [],
            loading: false,
            error: null,
            lastFetched: null,
        });
    },
}));
