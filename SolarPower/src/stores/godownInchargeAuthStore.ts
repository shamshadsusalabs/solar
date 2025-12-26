// src/stores/godownInchargeAuthStore.ts

import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { UserRole } from "../types/auth";
import {
    loginGodownInchargeService,
    refreshGodownInchargeTokenService,
    getAllGodownInchargesService,
} from "../services/godownInchargeAuthService";

const GODOWN_INCHARGE_AUTH_STORAGE_KEY = "@solar_godown_incharge_auth";
const GODOWN_INCHARGE_LIST_STORAGE_KEY = "@solar_godown_incharge_list";

// ============= TYPES =============
export interface GodownIncharge {
    id: string;
    email: string;
    name: string;
    phoneNumber: string;
}

export interface Tokens {
    accessToken: string;
    refreshToken: string;
}

export type GodownInchargeItem = any;

type GodownInchargeAuthState = {
    // Auth state
    role: UserRole | null;
    godownIncharge: GodownIncharge | null;
    tokens: Tokens | null;
    loading: boolean;
    error: string | null;

    // Godown Incharge list state (for admin)
    godownInchargeList: GodownInchargeItem[];
    godownInchargeListLoading: boolean;
    godownInchargeListError: string | null;
    godownInchargeListLastFetched: number | null;

    // Actions
    initGodownInchargeAuthFromStorage: () => Promise<void>;
    loginGodownIncharge: (email: string, password: string) => Promise<boolean>;
    refreshGodownInchargeTokens: () => Promise<boolean>;
    logoutGodownIncharge: () => Promise<void>;

    // Godown Incharge list actions
    initGodownInchargeListFromStorage: () => Promise<void>;
    fetchGodownInchargeList: (adminToken: string) => Promise<void>;
    clearGodownInchargeListCache: () => Promise<void>;
};

// ============= HELPERS =============
const saveGodownInchargeAuthToStorage = async (state: {
    role: UserRole | null;
    godownIncharge: GodownIncharge | null;
    tokens: Tokens | null;
}) => {
    try {
        await AsyncStorage.setItem(GODOWN_INCHARGE_AUTH_STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
        // Silent error
    }
};

const clearGodownInchargeAuthFromStorage = async () => {
    try {
        await AsyncStorage.removeItem(GODOWN_INCHARGE_AUTH_STORAGE_KEY);
    } catch (err) {
        // Silent error
    }
};

const saveGodownInchargeListToStorage = async (data: {
    godownInchargeList: GodownInchargeItem[];
    lastFetched: number;
}) => {
    try {
        await AsyncStorage.setItem(GODOWN_INCHARGE_LIST_STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
        // Silent error
    }
};

const clearGodownInchargeListStorage = async () => {
    try {
        await AsyncStorage.removeItem(GODOWN_INCHARGE_LIST_STORAGE_KEY);
    } catch (err) {
        // Silent error
    }
};

// ============= STORE =============
export const useGodownInchargeAuthStore = create<GodownInchargeAuthState>((set, get) => ({
    // Auth state
    role: null,
    godownIncharge: null,
    tokens: null,
    loading: false,
    error: null,

    // Godown Incharge list state
    godownInchargeList: [],
    godownInchargeListLoading: false,
    godownInchargeListError: null,
    godownInchargeListLastFetched: null,

    // ============= INIT FROM STORAGE =============
    initGodownInchargeAuthFromStorage: async () => {
        try {
            const stored = await AsyncStorage.getItem(GODOWN_INCHARGE_AUTH_STORAGE_KEY);
            if (!stored) return;

            const parsed = JSON.parse(stored);
            set({
                role: parsed.role ?? null,
                godownIncharge: parsed.godownIncharge,
                tokens: parsed.tokens,
            });
        } catch (err) {
            // Silent error
        }
    },

    // ============= LOGIN =============
    loginGodownIncharge: async (email: string, password: string) => {
        set({ loading: true, error: null });

        try {
            const res = await loginGodownInchargeService(email, password);

            const godownIncharge: GodownIncharge = {
                id: res.data.id,
                email: res.data.email,
                name: res.data.name,
                phoneNumber: res.data.phoneNumber,
            };

            const tokens: Tokens = {
                accessToken: res.tokens.accessToken,
                refreshToken: res.tokens.refreshToken,
            };

            const newState = {
                role: "godown_incharge" as UserRole,
                godownIncharge,
                tokens,
            };

            set({ ...newState, loading: false });

            await saveGodownInchargeAuthToStorage(newState);

            return true;
        } catch (err: any) {
            set({
                loading: false,
                error: err?.message || "Login failed",
            });
            return false;
        }
    },

    // ============= REFRESH TOKENS =============
    refreshGodownInchargeTokens: async () => {
        const { tokens } = get();

        if (!tokens?.refreshToken) {
            set({ role: null, godownIncharge: null, tokens: null });
            await clearGodownInchargeAuthFromStorage();
            return false;
        }

        try {
            const res = await refreshGodownInchargeTokenService(tokens.refreshToken);

            const newTokens: Tokens = {
                accessToken: res.tokens.accessToken,
                refreshToken: res.tokens.refreshToken,
            };

            const current = get();

            const newState = {
                role: current.role,
                godownIncharge: current.godownIncharge,
                tokens: newTokens,
            };

            set({ tokens: newTokens });

            await saveGodownInchargeAuthToStorage(newState);

            return true;
        } catch (err) {
            set({ role: null, godownIncharge: null, tokens: null });
            await clearGodownInchargeAuthFromStorage();
            return false;
        }
    },

    // ============= LOGOUT =============
    logoutGodownIncharge: async () => {
        set({ role: null, godownIncharge: null, tokens: null, error: null });
        await clearGodownInchargeAuthFromStorage();
    },

    // ============= INIT GODOWN INCHARGE LIST FROM STORAGE =============
    initGodownInchargeListFromStorage: async () => {
        try {
            const raw = await AsyncStorage.getItem(GODOWN_INCHARGE_LIST_STORAGE_KEY);
            if (!raw) return;

            const parsed = JSON.parse(raw);

            set({
                godownInchargeList: parsed.godownInchargeList ?? [],
                godownInchargeListLastFetched: parsed.lastFetched ?? null,
            });
        } catch (err) {
            // Silent error
        }
    },

    // ============= FETCH GODOWN INCHARGE LIST =============
    fetchGodownInchargeList: async (adminToken: string) => {
        if (!adminToken) return;

        set({ godownInchargeListLoading: true, godownInchargeListError: null });

        try {
            const response = await getAllGodownInchargesService(adminToken);

            const godownInchargeList = response.data.map((gi: any) => ({
                ...gi,
                id: gi._id,
            }));

            const newState = {
                godownInchargeList,
                lastFetched: Date.now(),
            };

            set({
                godownInchargeList,
                godownInchargeListLastFetched: Date.now(),
                godownInchargeListLoading: false,
            });

            await saveGodownInchargeListToStorage(newState);
        } catch (err: any) {
            set({
                godownInchargeListLoading: false,
                godownInchargeListError: err?.message || "Failed to fetch godown incharges",
            });
        }
    },

    // ============= CLEAR GODOWN INCHARGE LIST CACHE =============
    clearGodownInchargeListCache: async () => {
        await clearGodownInchargeListStorage();
        set({
            godownInchargeList: [],
            godownInchargeListLoading: false,
            godownInchargeListError: null,
            godownInchargeListLastFetched: null,
        });
    },
}));
