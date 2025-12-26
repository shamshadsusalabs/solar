// src/stores/dashboardStore.ts

import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
    getAdminDashboardService,
    type DashboardCardStats,
    type LeadStatusCount,
    type RecentLead,
    type TopEmployee,
} from "../services/dashboardService";

const DASHBOARD_STORAGE_KEY = "@solar_dashboard_data";

// ============= TYPES =============
type DashboardState = {
    cards: DashboardCardStats | null;
    statusBreakdown: LeadStatusCount[];
    recentLeads: RecentLead[];
    topEmployees: TopEmployee[];
    loading: boolean;
    error: string | null;
    lastFetched: number | null;

    // Actions
    initDashboardFromStorage: () => Promise<void>;
    fetchDashboard: (adminToken: string) => Promise<void>;
    clearDashboardCache: () => Promise<void>;
};

// ============= HELPERS =============
const saveDashboardToStorage = async (data: {
    cards: DashboardCardStats | null;
    statusBreakdown: LeadStatusCount[];
    recentLeads: RecentLead[];
    topEmployees: TopEmployee[];
    lastFetched: number;
}) => {
    try {
        await AsyncStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
        // Silent error
    }
};

const clearDashboardStorage = async () => {
    try {
        await AsyncStorage.removeItem(DASHBOARD_STORAGE_KEY);
    } catch (err) {
        // Silent error
    }
};

// ============= STORE =============
export const useDashboardStore = create<DashboardState>((set, get) => ({
    cards: null,
    statusBreakdown: [],
    recentLeads: [],
    topEmployees: [],
    loading: false,
    error: null,
    lastFetched: null,

    // ============= INIT FROM STORAGE =============
    initDashboardFromStorage: async () => {
        try {
            const raw = await AsyncStorage.getItem(DASHBOARD_STORAGE_KEY);
            if (!raw) return;

            const parsed = JSON.parse(raw);

            set({
                cards: parsed.cards ?? null,
                statusBreakdown: parsed.statusBreakdown ?? [],
                recentLeads: parsed.recentLeads ?? [],
                topEmployees: parsed.topEmployees ?? [],
                lastFetched: parsed.lastFetched ?? null,
            });
        } catch (err) {
            // Silent error
        }
    },

    // ============= FETCH DASHBOARD =============
    fetchDashboard: async (adminToken: string) => {
        if (!adminToken) {
            set({ error: "Admin not logged in" });
            return;
        }

        set({ loading: true, error: null });

        try {
            const res = await getAdminDashboardService(adminToken);

            const newState = {
                cards: res.data.cards,
                statusBreakdown: res.data.statusBreakdown,
                recentLeads: res.data.recentLeads,
                topEmployees: res.data.topEmployees,
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
            cards: null,
            statusBreakdown: [],
            recentLeads: [],
            topEmployees: [],
            loading: false,
            error: null,
            lastFetched: null,
        });
    },
}));
