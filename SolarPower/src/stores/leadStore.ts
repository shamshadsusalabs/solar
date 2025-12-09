// src/stores/leadStore.ts
import { create } from "zustand";
import {
  createLeadService,
  getLeadsService,
  getLeadsBySalesIdService, // 👈 ye import bhi add kar dena
  Lead, getAllLeadsAdminService,     // ✅ NEW
  updateLeadStatusService,
  LeadStatus,
} from "../services/leadService";
import { useEmployeeAuthStore } from "./employeeAuthStore";
import { useAdminAuthStore } from "./adminAuthStore";
// =======================
// PEHLE WALA STORE (LEAD CREATE / ADMIN ETC.)
// =======================

export type NewLeadPayload = {
  customerName: string;
  contactNumber: string;
  addressText: string;
  gpsLocation?: string;
  rtsCapacityKw?: string;
  roofTopCapacityKw?: string;
  tropositeAmount?: string;
  bankName?: string;
  bankDetails?: string;
  documents?: { uri: string; type: string; name: string }[];
};

type LeadStoreState = {
  leads: Lead[];
  loading: boolean;
  creating: boolean;
  error: string | null;

  createLead: (payload: NewLeadPayload) => Promise<boolean>;
  fetchMyLeads: () => Promise<void>;
};

export const useLeadStore = create<LeadStoreState>((set, get) => ({
  leads: [],
  loading: false,
  creating: false,
  error: null,

  // ========== CREATE LEAD WITH AUTO REFRESH ==========
  createLead: async (payload: NewLeadPayload) => {
    const { employee } = useEmployeeAuthStore.getState();

    if (!employee) {
      set({ error: "Employee not logged in" });
      return false;
    }

    const formData = new FormData();

    // Salesman details
    formData.append("salesManId", employee.id);
    formData.append("salesManName", employee.name);
    formData.append("salesManCode", (employee as any).employeeCode);

    // Required fields
    formData.append("customerName", payload.customerName.trim());
    formData.append("contactNumber", payload.contactNumber.trim());
    formData.append("addressText", payload.addressText.trim());

    // Optional fields
    if (payload.gpsLocation)
      formData.append("gpsLocation", payload.gpsLocation.trim());
    if (payload.rtsCapacityKw)
      formData.append("rtsCapacityKw", payload.rtsCapacityKw);
    if (payload.roofTopCapacityKw)
      formData.append("roofTopCapacityKw", payload.roofTopCapacityKw);
    if (payload.tropositeAmount)
      formData.append("tropositeAmount", payload.tropositeAmount);
    if (payload.bankName) formData.append("bankName", payload.bankName);
    if (payload.bankDetails)
      formData.append("bankDetails", payload.bankDetails);

    // Documents
    if (payload.documents?.length) {
      payload.documents.forEach((doc) => {
        formData.append("documents", {
          uri: doc.uri,
          type: doc.type,
          name: doc.name,
        } as any);
      });
    }

    set({ creating: true, error: null });

    const runCreate = async () => {
      const { tokens } = useEmployeeAuthStore.getState();
      if (!tokens?.accessToken) {
        throw new Error("No access token");
        }
      return await createLeadService(formData, tokens.accessToken);
    };

    try {
      const res = await runCreate();

      set((state) => ({
        creating: false,
        leads: [res.data, ...state.leads],
      }));

      return true;
    } catch (err: any) {
      console.log("createLead error:", err);

      const message = err?.message?.toString().toLowerCase() || "";

      if (
        message.includes("jwt expired") ||
        (message.includes("token") && message.includes("expired")) ||
        (message.includes("token") && message.includes("invalid"))
      ) {
        try {
          const ok = await useEmployeeAuthStore
            .getState()
            .refreshEmployeeTokens();

          if (!ok) {
            set({
              creating: false,
              error: "Session expired. Please login again.",
            });
            return false;
          }

          const res2 = await runCreate();

          set((state) => ({
            creating: false,
            leads: [res2.data, ...state.leads],
          }));

          return true;
        } catch (e2: any) {
          console.log("createLead retry error:", e2);
          set({
            creating: false,
            error: e2?.message || "Failed to create lead after refresh",
          });
          return false;
        }
      }

      set({
        creating: false,
        error: message || "Failed to create lead",
      });
      return false;
    }
  },

  // ========== OLD SIMPLE FETCH (AGAR KAHIN AUR USE HO RAHA HO) ==========
  fetchMyLeads: async () => {
    const { employee, tokens } = useEmployeeAuthStore.getState();
    if (!employee || !tokens?.accessToken) return;

    set({ loading: true, error: null });

    try {
      const res = await getLeadsService(tokens.accessToken, {
        salesManId: employee.id,
      });

      set({
        loading: false,
        leads: res.data,
      });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.message || "Failed to load leads",
      });
    }
  },
}));

// =======================
// NAYA STORE: EMPLOYEE LIST SCREEN (with pagination + token refresh)
// =======================

type EmployeeLeadsState = {
  leads: Lead[];
  loading: boolean;
  error: string | null;

  page: number;
  limit: number;
  total: number;
  hasMore: boolean;

  fetchFirstPage: () => Promise<void>;
  fetchNextPage: () => Promise<void>;
  refresh: () => Promise<void>;
};

export const useEmployeeLeadsStore = create<EmployeeLeadsState>((set, get) => ({
  leads: [],
  loading: false,
  error: null,

  page: 1,
  limit: 10,
  total: 0,
  hasMore: true,

  // 👉 first page
  fetchFirstPage: async () => {
    const { employee } = useEmployeeAuthStore.getState();
    if (!employee) {
      set({ error: "Employee not logged in" });
      return;
    }

    const runFetch = async () => {
      const { tokens } = useEmployeeAuthStore.getState();
      if (!tokens?.accessToken) {
        throw new Error("No access token");
      }
      return await getLeadsBySalesIdService(tokens.accessToken, {
        salesManId: employee.id,
        page: 1,
        limit: get().limit,
      });
    };

    set({ loading: true, error: null });

    try {
      const res = await runFetch();
      const page = res.pagination?.page ?? 1;
      const limit = res.pagination?.limit ?? get().limit;
      const total = res.pagination?.total ?? res.data.length;
      const totalPages = res.pagination?.totalPages ?? 1;

      set({
        loading: false,
        leads: res.data,
        page,
        limit,
        total,
        hasMore: page < totalPages,
      });
    } catch (err: any) {
      console.log("fetchFirstPage error:", err);
      const message = err?.message?.toString().toLowerCase() || "";

      if (
        message.includes("jwt expired") ||
        (message.includes("token") && message.includes("expired")) ||
        (message.includes("token") && message.includes("invalid"))
      ) {
        try {
          const ok = await useEmployeeAuthStore
            .getState()
            .refreshEmployeeTokens();

          if (!ok) {
            set({
              loading: false,
              error: "Session expired. Please login again.",
            });
            return;
          }

          const res2 = await runFetch();

          const page2 = res2.pagination?.page ?? 1;
          const limit2 = res2.pagination?.limit ?? get().limit;
          const total2 = res2.pagination?.total ?? res2.data.length;
          const totalPages2 = res2.pagination?.totalPages ?? 1;

          set({
            loading: false,
            leads: res2.data,
            page: page2,
            limit: limit2,
            total: total2,
            hasMore: page2 < totalPages2,
          });

          return;
        } catch (e2: any) {
          console.log("fetchFirstPage retry error:", e2);
          set({
            loading: false,
            error:
              e2?.message || "Failed to load leads after token refresh",
          });
          return;
        }
      }

      set({
        loading: false,
        error: message || "Failed to load leads",
      });
    }
  },

  // 👉 next page
  fetchNextPage: async () => {
    const { employee } = useEmployeeAuthStore.getState();
    const { page, limit, hasMore, leads } = get();

    if (!employee || !hasMore) return;

    const nextPage = page + 1;

    const runFetch = async () => {
      const { tokens } = useEmployeeAuthStore.getState();
      if (!tokens?.accessToken) {
        throw new Error("No access token");
      }
      return await getLeadsBySalesIdService(tokens.accessToken, {
        salesManId: employee.id,
        page: nextPage,
        limit,
      });
    };

    set({ loading: true, error: null });

    try {
      const res = await runFetch();

      const newLeads = res.data || [];
      const total = res.pagination?.total ?? get().total;
      const totalPages = res.pagination?.totalPages ?? nextPage;

      set({
        loading: false,
        leads: [...leads, ...newLeads],
        page: nextPage,
        total,
        hasMore: nextPage < totalPages,
      });
    } catch (err: any) {
      console.log("fetchNextPage error:", err);
      const message = err?.message?.toString().toLowerCase() || "";

      if (
        message.includes("jwt expired") ||
        (message.includes("token") && message.includes("expired")) ||
        (message.includes("token") && message.includes("invalid"))
      ) {
        try {
          const ok = await useEmployeeAuthStore
            .getState()
            .refreshEmployeeTokens();

          if (!ok) {
            set({
              loading: false,
              error: "Session expired. Please login again.",
            });
            return;
          }

          const res2 = await runFetch();

          const newLeads2 = res2.data || [];
          const total2 = res2.pagination?.total ?? get().total;
          const totalPages2 = res2.pagination?.totalPages ?? nextPage;

          set({
            loading: false,
            leads: [...leads, ...newLeads2],
            page: nextPage,
            total: total2,
            hasMore: nextPage < totalPages2,
          });

          return;
        } catch (e2: any) {
          console.log("fetchNextPage retry error:", e2);
          set({
            loading: false,
            error:
              e2?.message ||
              "Failed to load more leads after token refresh",
          });
          return;
        }
      }

      set({
        loading: false,
        error: message || "Failed to load more leads",
      });
    }
  },

  // 👉 refresh = first page dubara
  refresh: async () => {
    await get().fetchFirstPage();
  },
}));


// =======================
// ADMIN LEADS STORE (getAll + update status)
// =======================

type AdminLeadsState = {
  leads: Lead[];
  loading: boolean;
  error: string | null;

  fetchAllLeads: () => Promise<void>;
  updateLeadStatus: (id: string, status: LeadStatus) => Promise<boolean>;
};

export const useAdminLeadsStore = create<AdminLeadsState>((set, get) => ({
  leads: [],
  loading: false,
  error: null,

  // 🔹 Get ALL leads (admin only)
  fetchAllLeads: async () => {
    const { tokens } = useAdminAuthStore.getState();
    const accessToken = tokens?.accessToken;

    if (!accessToken) {
      set({ error: "Admin not logged in" });
      return;
    }

    const runFetch = async () => {
      const { tokens: t } = useAdminAuthStore.getState();
      if (!t?.accessToken) throw new Error("No access token (admin)");
      return await getAllLeadsAdminService(t.accessToken);
    };

    set({ loading: true, error: null });

    try {
      const res = await runFetch();

      set({
        loading: false,
        leads: res.data,
      });
    } catch (err: any) {
      console.log("admin fetchAllLeads error:", err);
      const message = err?.message?.toString().toLowerCase() || "";

      if (
        message.includes("jwt expired") ||
        (message.includes("token") && message.includes("expired")) ||
        (message.includes("token") && message.includes("invalid"))
      ) {
        try {
          const ok = await useAdminAuthStore.getState().refreshAdminTokens();

          if (!ok) {
            set({
              loading: false,
              error: "Admin session expired. Please login again.",
            });
            return;
          }

          const res2 = await runFetch();

          set({
            loading: false,
            leads: res2.data,
          });

          return;
        } catch (e2: any) {
          console.log("admin fetchAllLeads retry error:", e2);
          set({
            loading: false,
            error:
              e2?.message ||
              "Failed to load leads after admin token refresh",
          });
          return;
        }
      }

      set({
        loading: false,
        error: message || "Failed to load leads",
      });
    }
  },

  // 🔹 Update lead status (admin only)
  updateLeadStatus: async (id, status) => {
    const { tokens } = useAdminAuthStore.getState();
    const accessToken = tokens?.accessToken;

    if (!accessToken) {
      set({ error: "Admin not logged in" });
      return false;
    }

    const runUpdate = async () => {
      const { tokens: t } = useAdminAuthStore.getState();
      if (!t?.accessToken) throw new Error("No access token (admin)");
      return await updateLeadStatusService(id, status, t.accessToken);
    };

    set({ loading: true, error: null });

    try {
      const res = await runUpdate();

      // local list me status update karo
      set((state) => ({
        loading: false,
        leads: state.leads.map((lead) =>
          lead._id === id ? res.data : lead
        ),
      }));

      return true;
    } catch (err: any) {
      console.log("admin updateLeadStatus error:", err);
      const message = err?.message?.toString().toLowerCase() || "";

      if (
        message.includes("jwt expired") ||
        (message.includes("token") && message.includes("expired")) ||
        (message.includes("token") && message.includes("invalid"))
      ) {
        try {
          const ok = await useAdminAuthStore.getState().refreshAdminTokens();

          if (!ok) {
            set({
              loading: false,
              error: "Admin session expired. Please login again.",
            });
            return false;
          }

          const res2 = await runUpdate();

          set((state) => ({
            loading: false,
            leads: state.leads.map((lead) =>
              lead._id === id ? res2.data : lead
            ),
          }));

          return true;
        } catch (e2: any) {
          console.log("admin updateLeadStatus retry error:", e2);
          set({
            loading: false,
            error:
              e2?.message ||
              "Failed to update status after admin token refresh",
          });
          return false;
        }
      }

      set({
        loading: false,
        error: message || "Failed to update lead status",
      });

      return false;
    }
  },
}));
