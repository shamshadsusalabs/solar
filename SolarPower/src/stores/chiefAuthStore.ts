// src/stores/chiefAuthStore.ts

import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { UserRole } from "../types/auth";
import {
    loginChiefService,
    refreshChiefTokenService,
    getAllChiefsService,
} from "../services/chiefAuthService";

const CHIEF_AUTH_STORAGE_KEY = "@solar_chief_auth";
const CHIEF_LIST_STORAGE_KEY = "@solar_chief_list";

// ============= TYPES =============
export interface Chief {
    id: string;
    email: string;
    name: string;
    phoneNumber: string;
}

export interface Tokens {
    accessToken: string;
    refreshToken: string;
}

export type ChiefItem = any;

type ChiefAuthState = {
    // Auth state
    role: UserRole | null;
    chief: Chief | null;
    tokens: Tokens | null;
    loading: boolean;
    error: string | null;

    // Chief list state (for admin)
    chiefList: ChiefItem[];
    chiefListLoading: boolean;
    chiefListError: string | null;
    chiefListLastFetched: number | null;

    // Actions
    initChiefAuthFromStorage: () => Promise<void>;
    loginChief: (email: string, password: string) => Promise<boolean>;
    refreshChiefTokens: () => Promise<boolean>;
    logoutChief: () => Promise<void>;

    // Chief list actions
    initChiefListFromStorage: () => Promise<void>;
    fetchChiefList: (adminToken: string) => Promise<void>;
    clearChiefListCache: () => Promise<void>;
};

// ============= HELPERS =============
const saveChiefAuthToStorage = async (state: {
    role: UserRole | null;
    chief: Chief | null;
    tokens: Tokens | null;
}) => {
    try {
        await AsyncStorage.setItem(CHIEF_AUTH_STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
        // Silent error
    }
};

const clearChiefAuthFromStorage = async () => {
    try {
        await AsyncStorage.removeItem(CHIEF_AUTH_STORAGE_KEY);
    } catch (err) {
        // Silent error
    }
};

const saveChiefListToStorage = async (data: {
    chiefList: ChiefItem[];
    lastFetched: number;
}) => {
    try {
        await AsyncStorage.setItem(CHIEF_LIST_STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
        // Silent error
    }
};

const clearChiefListStorage = async () => {
    try {
        await AsyncStorage.removeItem(CHIEF_LIST_STORAGE_KEY);
    } catch (err) {
        // Silent error
    }
};

// ============= STORE =============
export const useChiefAuthStore = create<ChiefAuthState>((set, get) => ({
    // Auth state
    role: null,
    chief: null,
    tokens: null,
    loading: false,
    error: null,

    // Chief list state
    chiefList: [],
    chiefListLoading: false,
    chiefListError: null,
    chiefListLastFetched: null,

    // ============= INIT FROM STORAGE =============
    initChiefAuthFromStorage: async () => {
        try {
            const stored = await AsyncStorage.getItem(CHIEF_AUTH_STORAGE_KEY);
            if (!stored) return;

            const parsed = JSON.parse(stored);
            set({
                role: parsed.role ?? null,
                chief: parsed.chief,
                tokens: parsed.tokens,
            });
        } catch (err) {
            // Silent error
        }
    },

    // ============= LOGIN =============
    loginChief: async (email: string, password: string) => {
        set({ loading: true, error: null });

        try {
            const res = await loginChiefService(email, password);

            const chief: Chief = {
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
                role: "chief" as UserRole,
                chief,
                tokens,
            };

            set({ ...newState, loading: false });

            await saveChiefAuthToStorage(newState);

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
    refreshChiefTokens: async () => {
        const { tokens } = get();

        if (!tokens?.refreshToken) {
            set({ role: null, chief: null, tokens: null });
            await clearChiefAuthFromStorage();
            return false;
        }

        try {
            const res = await refreshChiefTokenService(tokens.refreshToken);

            const newTokens: Tokens = {
                accessToken: res.tokens.accessToken,
                refreshToken: res.tokens.refreshToken,
            };

            const current = get();

            const newState = {
                role: current.role,
                chief: current.chief,
                tokens: newTokens,
            };

            set({ tokens: newTokens });

            await saveChiefAuthToStorage(newState);

            return true;
        } catch (err) {
            set({ role: null, chief: null, tokens: null });
            await clearChiefAuthFromStorage();
            return false;
        }
    },

    // ============= LOGOUT =============
    logoutChief: async () => {
        set({ role: null, chief: null, tokens: null, error: null });
        await clearChiefAuthFromStorage();
    },

    // ============= INIT CHIEF LIST FROM STORAGE =============
    initChiefListFromStorage: async () => {
        try {
            const raw = await AsyncStorage.getItem(CHIEF_LIST_STORAGE_KEY);
            if (!raw) return;

            const parsed = JSON.parse(raw);

            set({
                chiefList: parsed.chiefList ?? [],
                chiefListLastFetched: parsed.lastFetched ?? null,
            });
        } catch (err) {
            // Silent error
        }
    },

    // ============= FETCH CHIEF LIST =============
    fetchChiefList: async (adminToken: string) => {
        if (!adminToken) return;

        set({ chiefListLoading: true, chiefListError: null });

        try {
            const response = await getAllChiefsService(adminToken);

            const chiefList = response.data.map((chief: any) => ({
                ...chief,
                id: chief._id,
            }));

            const newState = {
                chiefList,
                lastFetched: Date.now(),
            };

            set({
                chiefList,
                chiefListLastFetched: Date.now(),
                chiefListLoading: false,
            });

            await saveChiefListToStorage(newState);
        } catch (err: any) {
            set({
                chiefListLoading: false,
                chiefListError: err?.message || "Failed to fetch chiefs",
            });
        }
    },

    // ============= CLEAR CHIEF LIST CACHE =============
    clearChiefListCache: async () => {
        await clearChiefListStorage();
        set({
            chiefList: [],
            chiefListLoading: false,
            chiefListError: null,
            chiefListLastFetched: null,
        });
    },
}));
