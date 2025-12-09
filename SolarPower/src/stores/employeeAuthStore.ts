// src/store/employeeAuthStore.ts

import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Employee, Tokens, UserRole } from "../types/auth";
import {
  loginEmployeeService,
  refreshEmployeeTokenService,
  logoutEmployeeService,

  getEmployeeProfileService,
  getEmployeeAadhaarStatusService,
  uploadEmployeeAadhaarService,

  EmployeeProfileResponse,
  EmployeeAadhaarStatusResponse,
} from "../services/employeeAuthService";

// ✅ ADMIN SERVICE
import {
  getAllEmployeesForAdminService,
  AdminEmployee,
} from "../services/employeeAuthService";

import { useAdminAuthStore } from "./adminAuthStore";
import { EMPLOYEE_AUTH_STORAGE_KEY } from "../constants/storage";

// ===================
// TYPES
// ===================
export type EmployeeProfile = EmployeeProfileResponse["employee"];
export type EmployeeAadhaarStatus = EmployeeAadhaarStatusResponse;

type EmployeeAuthState = {
  // 🔐 EMPLOYEE AUTH
  role: UserRole | null;
  employee: Employee | null;
  tokens: Tokens | null;
  loading: boolean;
  error: string | null;

  // 👤 EMPLOYEE PROFILE
  profile: EmployeeProfile | null;

  // 🆔 AADHAAR
  aadhaarStatus: EmployeeAadhaarStatus | null;
  loadingProfile: boolean;
  loadingAadhaar: boolean;

  // =====================
  // 🛡️ ADMIN EMPLOYEE LIST
  // =====================
  adminEmployees: AdminEmployee[];

  adminLoading: boolean;
  adminError: string | null;

  adminPage: number;
  adminLimit: number;
  adminTotal: number;
  adminTotalPages: number;
  adminSearch: string;

  // ===================
  // ACTIONS
  // ===================

  // EMPLOYEE AUTH
  initEmployeeAuthFromStorage: () => Promise<void>;
  loginEmployee: (employeeCode: string, password: string) => Promise<boolean>;
  refreshEmployeeTokens: () => Promise<boolean>;
  logoutEmployee: () => Promise<void>;

  // EMPLOYEE DATA
  fetchEmployeeProfile: () => Promise<void>;
  fetchEmployeeAadhaarStatus: () => Promise<void>;
  uploadEmployeeAadhaar: (formData: FormData) => Promise<boolean>;

  // ADMIN EMPLOYEE LIST
  setAdminSearch: (value: string) => void;
  setAdminPage: (page: number) => void;
  fetchAllEmployeesForAdmin: () => Promise<void>;
};

// ===================
// HELPERS
// ===================
const saveEmployeeAuthToStorage = async (state: {
  role: UserRole | null;
  employee: Employee | null;
  tokens: Tokens | null;
}) => {
  try {
    await AsyncStorage.setItem(
      EMPLOYEE_AUTH_STORAGE_KEY,
      JSON.stringify(state)
    );
  } catch (err) {
    console.log("saveEmployeeAuthToStorage error:", err);
  }
};

const clearEmployeeAuthStorage = async () => {
  try {
    await AsyncStorage.removeItem(EMPLOYEE_AUTH_STORAGE_KEY);
  } catch (err) {
    console.log("clearEmployeeAuthStorage error:", err);
  }
};

// ===================
// STORE
// ===================
export const useEmployeeAuthStore = create<EmployeeAuthState>((set, get) => ({
  // 🔐 AUTH
  role: null,
  employee: null,
  tokens: null,
  loading: false,
  error: null,

  // 👤 PROFILE
  profile: null,

  // 🆔 AADHAAR
  aadhaarStatus: null,
  loadingProfile: false,
  loadingAadhaar: false,

  // 🛡️ ADMIN LIST
  adminEmployees: [],
  adminLoading: false,
  adminError: null,
  adminPage: 1,
  adminLimit: 20,
  adminTotal: 0,
  adminTotalPages: 0,
  adminSearch: "",

  // ======================
  // INIT STORAGE
  // ======================
  initEmployeeAuthFromStorage: async () => {
    try {
      const raw = await AsyncStorage.getItem(EMPLOYEE_AUTH_STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);

      set({
        role: parsed.role ?? null,
        employee: parsed.employee ?? null,
        tokens: parsed.tokens ?? null,
      });
    } catch (err) {
      console.log("initEmployeeAuthFromStorage error:", err);
    }
  },

  // ======================
  // LOGIN
  // ======================
  loginEmployee: async (employeeCode, password) => {
    set({ loading: true, error: null });

    try {
      const data = await loginEmployeeService(employeeCode, password);

      const newState = {
        role: "employee" as UserRole,
        employee: data.employee,
        tokens: data.tokens,
      };

      set({
        ...newState,
        loading: false,
      });

      await saveEmployeeAuthToStorage(newState);

      get().fetchEmployeeProfile();
      get().fetchEmployeeAadhaarStatus();

      return true;
    } catch (err: any) {
      set({
        loading: false,
        error: err?.message || "Employee login failed",
      });
      return false;
    }
  },

  // ======================
  // REFRESH TOKEN
  // ======================
  refreshEmployeeTokens: async () => {
    const { tokens } = get();

    if (!tokens?.refreshToken) return false;

    try {
      const data = await refreshEmployeeTokenService(tokens.refreshToken);
      const newTokens = data.tokens;

      const current = get();

      const newState = {
        role: current.role,
        employee: current.employee,
        tokens: newTokens,
      };

      set({ tokens: newTokens });
      await saveEmployeeAuthToStorage(newState);

      return true;
    } catch (err) {
      console.log("refreshEmployeeTokens error:", err);
      return false;
    }
  },

  // ======================
  // LOGOUT
  // ======================
  logoutEmployee: async () => {
    const { tokens } = get();
    const accessToken = tokens?.accessToken || "";

    try {
      if (accessToken) {
        await logoutEmployeeService(accessToken);
      }
    } catch {}

    await clearEmployeeAuthStorage();

    set({
      role: null,
      employee: null,
      tokens: null,
      loading: false,
      error: null,

      profile: null,
      aadhaarStatus: null,

      adminEmployees: [],
      adminLoading: false,
      adminError: null,
      adminPage: 1,
      adminTotal: 0,
      adminTotalPages: 0,
      adminSearch: "",
    });
  },

  // ======================
  // PROFILE
  // ======================
  fetchEmployeeProfile: async () => {
    const token = get().tokens?.accessToken;
    if (!token) return;

    set({ loadingProfile: true });

    try {
      const data = await getEmployeeProfileService(token);

      set({
        profile: data.employee,
        loadingProfile: false,
      });
    } catch {
      set({
        loadingProfile: false,
        error: "Failed to load employee profile",
      });
    }
  },

  // ======================
  // AADHAAR STATUS
  // ======================
  fetchEmployeeAadhaarStatus: async () => {
    const token = get().tokens?.accessToken;
    if (!token) return;

    set({ loadingAadhaar: true });

    try {
      const data = await getEmployeeAadhaarStatusService(token);

      set({
        aadhaarStatus: data,
        loadingAadhaar: false,
      });
    } catch {
      set({
        loadingAadhaar: false,
        error: "Failed to load Aadhaar status",
      });
    }
  },

  // ======================
  // UPLOAD AADHAAR
  // ======================
  uploadEmployeeAadhaar: async (formData: FormData) => {
    const token = get().tokens?.accessToken;
    if (!token) return false;

    set({ loadingAadhaar: true });

    try {
      const data = await uploadEmployeeAadhaarService(formData, token);
      const uploaded = data.employee;

      set({
        profile: {
          ...(get().profile || {}),
          id: uploaded._id,
          employeeCode: uploaded.employeeCode,
          name: uploaded.name,
          phoneNumber: uploaded.phoneNumber,
          role: uploaded.role,
          aadhaarNumber: uploaded.aadhaarNumber,
          aadhaarUrl: uploaded.aadhaarUrl,
        } as EmployeeProfile,
        aadhaarStatus: {
          isFilled: uploaded.isFilled,
          hasAadhaarNumber: !!uploaded.aadhaarNumber,
          hasAadhaarFile: !!uploaded.aadhaarUrl,
          employeeCode: uploaded.employeeCode,
          name: uploaded.name,
        },
        loadingAadhaar: false,
      });

      return true;
    } catch {
      set({
        loadingAadhaar: false,
        error: "Failed to upload Aadhaar",
      });
      return false;
    }
  },

  // ======================
  // ADMIN: SEARCH / PAGINATION
  // ======================
  setAdminSearch: (value) => {
    set({
      adminSearch: value,
      adminPage: 1,
    });
  },

  setAdminPage: (page) => set({ adminPage: page }),

  // ======================
  // ADMIN: FETCH EMPLOYEES
  // ======================
  fetchAllEmployeesForAdmin: async () => {
    const token = useAdminAuthStore.getState().tokens?.accessToken;
    if (!token) return;

    const { adminPage, adminLimit, adminSearch } = get();

    set({ adminLoading: true, adminError: null });

    try {
      const data = await getAllEmployeesForAdminService(token, {
        page: adminPage,
        limit: adminLimit,
        search: adminSearch,
      });

      set({
        adminEmployees: data.data,
        adminPage: data.pagination.page,
        adminLimit: data.pagination.limit,
        adminTotal: data.pagination.total,
        adminTotalPages: data.pagination.totalPages,
        adminLoading: false,
      });
    } catch (err: any) {
      console.log("fetchAllEmployeesForAdmin error:", err);

      set({
        adminLoading: false,
        adminError: err?.message || "Failed to load employees",
      });
    }
  },
}));
