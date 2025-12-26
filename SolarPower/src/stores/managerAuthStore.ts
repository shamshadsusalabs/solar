// src/stores/managerAuthStore.ts
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { UserRole } from "../types/auth";
import {
    loginManagerService,
    refreshManagerTokenService,
    ManagerLoginResponse,
    getAllManagersService,
} from "../services/managerAuthService";

const MANAGER_AUTH_STORAGE_KEY = "@solar_manager_auth";
const MANAGER_LIST_STORAGE_KEY = "@solar_manager_list";

// ============= TYPES =============
export interface Manager {
    id: string;
    email: string;
    name: string;
    phoneNumber: string;
}

export interface Tokens {
    accessToken: string;
    refreshToken: string;
}

export type ManagerItem = any; // Manager from list API

type ManagerAuthState = {
    // Auth state
    role: UserRole | null;
    manager: Manager | null;
    tokens: Tokens | null;
    loading: boolean;
    error: string | null;

    // Manager list state (for admin)
    managerList: ManagerItem[];
    managerListLoading: boolean;
    managerListError: string | null;
    managerListLastFetched: number | null;

    // Actions
    initManagerAuthFromStorage: () => Promise<void>;
    loginManager: (email: string, password: string) => Promise<boolean>;
    refreshManagerTokens: () => Promise<boolean>;
    logoutManager: () => Promise<void>;

    // Manager list actions
    initManagerListFromStorage: () => Promise<void>;
    fetchManagerList: (adminToken: string) => Promise<void>;
    clearManagerListCache: () => Promise<void>;
};

// ============= HELPERS =============
const saveManagerAuthToStorage = async (state: {
    role: UserRole | null;
    manager: Manager | null;
    tokens: Tokens | null;
}) => {
    try {
        await AsyncStorage.setItem(
            MANAGER_AUTH_STORAGE_KEY,
            JSON.stringify(state)
        );
    } catch (err) {
        // Silent error
    }
};

const clearManagerAuthFromStorage = async () => {
    try {
        await AsyncStorage.removeItem(MANAGER_AUTH_STORAGE_KEY);
    } catch (err) {
        // Silent error
    }
};

const saveManagerListToStorage = async (data: {
    managerList: ManagerItem[];
    lastFetched: number;
}) => {
    try {
        await AsyncStorage.setItem(
            MANAGER_LIST_STORAGE_KEY,
            JSON.stringify(data)
        );
    } catch (err) {
        // Silent error
    }
};

const clearManagerListStorage = async () => {
    try {
        await AsyncStorage.removeItem(MANAGER_LIST_STORAGE_KEY);
    } catch (err) {
        // Silent error
    }
};

// ============= STORE =============
export const useManagerAuthStore = create<ManagerAuthState>((set, get) => ({
    // Auth state
    role: null,
    manager: null,
    tokens: null,
    loading: false,
    error: null,

    // Manager list state
    managerList: [],
    managerListLoading: false,
    managerListError: null,
    managerListLastFetched: null,

    // ============= INIT FROM STORAGE =============
    initManagerAuthFromStorage: async () => {
        try {
            const stored = await AsyncStorage.getItem(MANAGER_AUTH_STORAGE_KEY);
            if (!stored) return;

            const parsed = JSON.parse(stored);
            set({
                role: parsed.role ?? null,
                manager: parsed.manager,
                tokens: parsed.tokens,
            });
        } catch (err) {
            // Silent error
        }
    },

    // ============= LOGIN =============
    loginManager: async (email: string, password: string) => {
        set({ loading: true, error: null });

        try {
            const res = await loginManagerService(email, password);

            const manager: Manager = {
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
                role: "manager" as UserRole,
                manager,
                tokens,
            };

            set({ ...newState, loading: false });

            await saveManagerAuthToStorage(newState);

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
    refreshManagerTokens: async () => {
        const { tokens } = get();

        if (!tokens?.refreshToken) {
            set({ role: null, manager: null, tokens: null });
            await clearManagerAuthFromStorage();
            return false;
        }

        try {
            const res = await refreshManagerTokenService(tokens.refreshToken);

            const newTokens: Tokens = {
                accessToken: res.tokens.accessToken,
                refreshToken: res.tokens.refreshToken,
            };

            const current = get();

            const newState = {
                role: current.role,
                manager: current.manager,
                tokens: newTokens,
            };

            set({ tokens: newTokens });

            await saveManagerAuthToStorage(newState);

            return true;
        } catch (err) {
            set({ role: null, manager: null, tokens: null });
            await clearManagerAuthFromStorage();
            return false;
        }
    },

    // ============= LOGOUT =============
    logoutManager: async () => {
        set({ role: null, manager: null, tokens: null, error: null });
        await clearManagerAuthFromStorage();
    },

    // ============= INIT MANAGER LIST FROM STORAGE =============
    initManagerListFromStorage: async () => {
        try {
            const raw = await AsyncStorage.getItem(MANAGER_LIST_STORAGE_KEY);
            if (!raw) return;

            const parsed = JSON.parse(raw);

            set({
                managerList: parsed.managerList ?? [],
                managerListLastFetched: parsed.lastFetched ?? null,
            });
        } catch (err) {
            // Silent error
        }
    },

    // ============= FETCH MANAGER LIST =============
    fetchManagerList: async (adminToken: string) => {
        if (!adminToken) return;

        set({ managerListLoading: true, managerListError: null });

        try {
            const response = await getAllManagersService(adminToken);

            // Map _id to id for consistency
            const managerList = response.data.map((mgr: any) => ({
                ...mgr,
                id: mgr._id,
            }));

            const newState = {
                managerList,
                lastFetched: Date.now(),
            };

            set({
                managerList,
                managerListLastFetched: Date.now(),
                managerListLoading: false,
            });

            await saveManagerListToStorage(newState);
        } catch (err: any) {
            set({
                managerListLoading: false,
                managerListError: err?.message || "Failed to fetch managers",
            });
        }
    },

    // ============= CLEAR MANAGER LIST CACHE =============
    clearManagerListCache: async () => {
        await clearManagerListStorage();
        set({
            managerList: [],
            managerListLoading: false,
            managerListError: null,
            managerListLastFetched: null,
        });
    },
}));
