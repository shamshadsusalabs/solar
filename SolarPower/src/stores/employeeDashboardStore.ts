// src/stores/employeeDashboardStore.ts

import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
    getEmployeeDashboardService,
    type EmployeeDashboardTotals,
    type EmployeeStatusSummaryItem,
    type EmployeeRecentLead,
} from "../services/employeeDashboardService";

const EMPLOYEE_DASHBOARD_STORAGE_KEY = "@solar_employee_dashboard_data";

// ============= TYPES =============
type EmployeeDashboardState = {
    totals: EmployeeDashboardTotals | null;
    statusSummary: EmployeeStatusSummaryItem[];
    recentLeads: EmployeeRecentLead[];
    loading: boolean;
    error: string | null;
    lastFetched: number | null;

    // Actions
    initDashboardFromStorage: () => Promise<void>;
    fetchDashboard: (employeeToken: string) => Promise<void>;
    clearDashboardCache: () => Promise<void>;
};

// ============= HELPERS =============
const saveDashboardToStorage = async (data: {
    totals: EmployeeDashboardTotals | null;
    statusSummary: EmployeeStatusSummaryItem[];
    recentLeads: EmployeeRecentLead[];
    lastFetched: number;
}) => {
    try {
        await AsyncStorage.setItem(EMPLOYEE_DASHBOARD_STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
        // Silent error
    }
};

const clearDashboardStorage = async () => {
    try {
        await AsyncStorage.removeItem(EMPLOYEE_DASHBOARD_STORAGE_KEY);
    } catch (err) {
        // Silent error
    }
};

// ============= STORE =============
export const useEmployeeDashboardStore = create<EmployeeDashboardState>((set, get) => ({
    totals: null,
    statusSummary: [],
    recentLeads: [],
    loading: false,
    error: null,
    lastFetched: null,

    // ============= INIT FROM STORAGE =============
    initDashboardFromStorage: async () => {
        try {
            const raw = await AsyncStorage.getItem(EMPLOYEE_DASHBOARD_STORAGE_KEY);
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
    fetchDashboard: async (employeeToken: string) => {
        if (!employeeToken) {
            set({ error: "Employee not logged in" });
            return;
        }

        set({ loading: true, error: null });

        try {
            const res = await getEmployeeDashboardService(employeeToken);

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
