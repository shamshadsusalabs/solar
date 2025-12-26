// src/store/adminAuthStore.ts

import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Admin, Tokens, UserRole } from "../types/auth";
import {
  loginAdminService,
  refreshAdminTokenService,
  logoutAdminService,
  updateAdminProfileService,
} from "../services/adminAuthService";
import { ADMIN_AUTH_STORAGE_KEY } from "../constants/storage";

type AdminAuthState = {
  role: UserRole | null; // practically "admin" ya null
  admin: Admin | null;
  tokens: Tokens | null;
  loading: boolean;
  error: string | null;

  // actions
  initAdminAuthFromStorage: () => Promise<void>;
  loginAdmin: (email: string, password: string) => Promise<boolean>;
  updateAdminProfile: (data: {
    email?: string;
    phoneNumber?: string;
    password?: string;
  }) => Promise<boolean>;
  refreshAdminTokens: () => Promise<boolean>;
  logoutAdmin: () => Promise<void>;
};

// helper: save
const saveAdminAuthToStorage = async (state: {
  role: UserRole | null;
  admin: Admin | null;
  tokens: Tokens | null;
}) => {
  try {
    await AsyncStorage.setItem(ADMIN_AUTH_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    // Silent error - storage write failed
  }
};

// helper: clear
const clearAdminAuthStorage = async () => {
  try {
    await AsyncStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
  } catch (err) {
    // Silent error - storage clear failed
  }
};

export const useAdminAuthStore = create<AdminAuthState>((set, get) => ({
  role: null,
  admin: null,
  tokens: null,
  loading: false,
  error: null,

  // 🔄 App start pe AsyncStorage → admin state
  initAdminAuthFromStorage: async () => {
    try {
      const raw = await AsyncStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);

      set({
        role: parsed.role ?? null,
        admin: parsed.admin ?? null,
        tokens: parsed.tokens ?? null,
      });
    } catch (err) {
      // Silent error - failed to load admin auth from storage
    }
  },

  // 🔐 Admin login
  loginAdmin: async (email, password) => {
    set({ loading: true, error: null });

    try {
      const data = await loginAdminService(email, password);

      const newState = {
        role: "admin" as UserRole,
        admin: data.admin,
        tokens: data.tokens,
      };

      set({
        ...newState,
        loading: false,
        error: null,
      });

      await saveAdminAuthToStorage(newState);

      return true;
    } catch (err: any) {
      set({
        loading: false,
        error: err?.message || "Admin login failed",
      });
      return false;
    }
  },

  // 📝 Update admin profile
  updateAdminProfile: async (data) => {
    const { tokens } = get();
    const accessToken = tokens?.accessToken;

    if (!accessToken) {
      set({ error: "No access token available" });
      return false;
    }

    set({ loading: true, error: null });

    try {
      const response = await updateAdminProfileService(data, accessToken);

      // Update admin in state
      const updatedAdmin: Admin = {
        id: response.admin.id,
        email: response.admin.email,
        phoneNumber: response.admin.phoneNumber,
        role: "admin", // Always admin for this store
      };

      const newState = {
        role: get().role,
        admin: updatedAdmin,
        tokens: get().tokens,
      };

      set({
        admin: updatedAdmin,
        loading: false,
        error: null,
      });

      await saveAdminAuthToStorage(newState);

      return true;
    } catch (err: any) {
      set({
        loading: false,
        error: err?.message || "Failed to update profile",
      });
      return false;
    }
  },

  // ♻️ Admin refresh token
  refreshAdminTokens: async () => {
    const { tokens } = get();

    if (!tokens?.refreshToken) {
      return false;
    }

    try {
      const data = await refreshAdminTokenService(tokens.refreshToken);
      const newTokens = data.tokens;

      const current = get();

      const newState = {
        role: current.role,
        admin: current.admin,
        tokens: newTokens,
      };

      set({ tokens: newTokens });
      await saveAdminAuthToStorage(newState);

      return true;
    } catch (err) {
      // Token refresh failed - silently logout
      await get().logoutAdmin();
      return false;
    }
  },

  // 🚪 Admin logout
  logoutAdmin: async () => {
    const { tokens } = get();
    const accessToken = tokens?.accessToken || "";

    try {
      if (accessToken) {
        await logoutAdminService(accessToken);
      }
    } catch (err) {
      // Silent error - logout API call failed, continue cleanup anyway
    }

    await clearAdminAuthStorage();

    set({
      role: null,
      admin: null,
      tokens: null,
      loading: false,
      error: null,
    });
  },
}));
