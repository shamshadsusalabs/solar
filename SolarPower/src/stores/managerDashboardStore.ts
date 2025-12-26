// src/stores/managerDashboardStore.ts

import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
    getManagerDashboardService,
    type ManagerDashboardTotals,
    type ManagerStatusSummaryItem,
    type ManagerRecentLead,
} from "../services/managerDashboardService";

const MANAGER_DASHBOARD_STORAGE_KEY = "@solar_manager_dashboard_data";

// ============= TYPES =============
type ManagerDashboardState = {
    totals: ManagerDashboardTotals | null;
    statusSummary: ManagerStatusSummaryItem[];
    recentLeads: ManagerRecentLead[];
    loading: boolean;
    error: string | null;
    lastFetched: number | null;

    // Actions
    initDashboardFromStorage: () => Promise<void>;
    fetchDashboard: (managerToken: string) => Promise<void>;
    clearDashboardCache: () => Promise<void>;
};

// ============= HELPERS =============
const saveDashboardToStorage = async (data: {
    totals: ManagerDashboardTotals | null;
    statusSummary: ManagerStatusSummaryItem[];
    recentLeads: ManagerRecentLead[];
    lastFetched: number;
}) => {
    try {
        await AsyncStorage.setItem(MANAGER_DASHBOARD_STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
        // Silent error
    }
};

const clearDashboardStorage = async () => {
    try {
        await AsyncStorage.removeItem(MANAGER_DASHBOARD_STORAGE_KEY);
    } catch (err) {
        // Silent error
    }
};

// ============= STORE =============
export const useManagerDashboardStore = create<ManagerDashboardState>((set, get) => ({
    totals: null,
    statusSummary: [],
    recentLeads: [],
    loading: false,
    error: null,
    lastFetched: null,

    // ============= INIT FROM STORAGE =============
    initDashboardFromStorage: async () => {
        try {
            const raw = await AsyncStorage.getItem(MANAGER_DASHBOARD_STORAGE_KEY);
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
    fetchDashboard: async (managerToken: string) => {
        if (!managerToken) {
            set({ error: "Manager not logged in" });
            return;
        }

        set({ loading: true, error: null });

        try {
            const res = await getManagerDashboardService(managerToken);

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
