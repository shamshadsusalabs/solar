// src/stores/chiefDashboardStore.ts

import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
    getChiefDashboardService,
    type ChiefDashboardTotals,
    type ChiefStatusSummaryItem,
    type ChiefRecentLead,
} from "../services/chiefDashboardService";

const CHIEF_DASHBOARD_STORAGE_KEY = "@solar_chief_dashboard_data";

// ============= TYPES =============
type ChiefDashboardState = {
    totals: ChiefDashboardTotals | null;
    statusSummary: ChiefStatusSummaryItem[];
    recentLeads: ChiefRecentLead[];
    loading: boolean;
    error: string | null;
    lastFetched: number | null;

    // Actions
    initDashboardFromStorage: () => Promise<void>;
    fetchDashboard: (chiefToken: string) => Promise<void>;
    clearDashboardCache: () => Promise<void>;
};

// ============= HELPERS =============
const saveDashboardToStorage = async (data: {
    totals: ChiefDashboardTotals | null;
    statusSummary: ChiefStatusSummaryItem[];
    recentLeads: ChiefRecentLead[];
    lastFetched: number;
}) => {
    try {
        await AsyncStorage.setItem(CHIEF_DASHBOARD_STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
        // Silent error
    }
};

const clearDashboardStorage = async () => {
    try {
        await AsyncStorage.removeItem(CHIEF_DASHBOARD_STORAGE_KEY);
    } catch (err) {
        // Silent error
    }
};

// ============= STORE =============
export const useChiefDashboardStore = create<ChiefDashboardState>((set, get) => ({
    totals: null,
    statusSummary: [],
    recentLeads: [],
    loading: false,
    error: null,
    lastFetched: null,

    // ============= INIT FROM STORAGE =============
    initDashboardFromStorage: async () => {
        try {
            const raw = await AsyncStorage.getItem(CHIEF_DASHBOARD_STORAGE_KEY);
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
    fetchDashboard: async (chiefToken: string) => {
        if (!chiefToken) {
            set({ error: "Chief not logged in" });
            return;
        }

        set({ loading: true, error: null });

        try {
            const res = await getChiefDashboardService(chiefToken);

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
