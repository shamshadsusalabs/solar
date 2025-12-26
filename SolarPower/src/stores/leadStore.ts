// src/stores/leadStore.ts
import { create } from "zustand";
import {
  createLeadService,
  getLeadsService,
  getLeadsBySalesIdService, // 👈 ye import bhi add kar dena
  Lead, getAllLeadsAdminService,     // ✅ NEW
  updateLeadStatusService,
  updateEmployeeLeadStatusService,
  LeadStatus,
} from "../services/leadService";
import { useEmployeeAuthStore } from "./employeeAuthStore";
import { useAdminAuthStore } from "./adminAuthStore";
// Re-export LeadStatus so other files can import from here
export type { LeadStatus };
// =======================
// PEHLE WALA STORE (LEAD CREATE / ADMIN ETC.)
// =======================

export type NewLeadPayload = {
  customerName: string;
  contactNumber: string;
  addressText: string;
  requiredSystemCapacity?: string;
  systemCostQuoted?: string;
  bankAccountName?: string;
  ifscCode?: string;
  branchDetails?: string;
  textInstructions?: string;
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
    if (payload.requiredSystemCapacity)
      formData.append("requiredSystemCapacity", payload.requiredSystemCapacity.trim());
    if (payload.systemCostQuoted)
      formData.append("systemCostQuoted", payload.systemCostQuoted);
    if (payload.bankAccountName)
      formData.append("bankAccountName", payload.bankAccountName.trim());
    if (payload.ifscCode)
      formData.append("ifscCode", payload.ifscCode.trim());
    if (payload.branchDetails)
      formData.append("branchDetails", payload.branchDetails.trim());
    if (payload.textInstructions)
      formData.append("textInstructions", payload.textInstructions.trim());

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
            // Token refresh failed - user will be auto-logged out
            set({ creating: false });
            return false;
          }

          const res2 = await runCreate();

          set((state) => ({
            creating: false,
            leads: [res2.data, ...state.leads],
          }));

          return true;
        } catch (e2: any) {
          set({
            creating: false,
            error: e2?.message || "Failed to create lead",
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
  updateLeadStatus: (leadId: string, status: LeadStatus) => Promise<void>;
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
            // Token refresh failed - user will be auto-logged out
            set({ loading: false });
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
          set({
            loading: false,
            error: e2?.message || "Failed to load leads",
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
            // Token refresh failed - user will be auto-logged out
            set({ loading: false });
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
          set({
            loading: false,
            error: e2?.message || "Failed to load more leads",
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

  // 👉 update lead status
  updateLeadStatus: async (leadId: string, status: LeadStatus) => {
    const { tokens } = useEmployeeAuthStore.getState();
    if (!tokens?.accessToken) {
      set({ error: "No access token" });
      return;
    }

    try {
      await updateEmployeeLeadStatusService(leadId, status, tokens.accessToken);

      // Optimistically update in local state
      set((state) => ({
        leads: state.leads.map((lead) =>
          lead._id === leadId ? { ...lead, status } : lead
        ),
      }));
    } catch (err: any) {
      set({ error: err?.message || "Failed to update status" });
      throw err;
    }
  },
}));

// =======================
// CHIEF LEADS STORE (getAll + update status)
// =======================

type ChiefLeadsState = {
  leads: Lead[];
  loading: boolean;
  error: string | null;

  fetchAllLeads: (accessToken: string, contactNumber?: string) => Promise<void>;
  updateLeadStatus: (
    id: string,
    status: LeadStatus,
    accessToken: string
  ) => Promise<boolean>;
  clearLeads: () => void;
};

export const useChiefLeadsStore = create<ChiefLeadsState>((set, get) => ({
  leads: [],
  loading: false,
  error: null,

  // 🔹 Get ALL leads (chief)
  fetchAllLeads: async (accessToken: string, contactNumber?: string) => {
    if (!accessToken) {
      set({ error: "Chief not logged in" });
      return;
    }

    set({ loading: true, error: null });

    try {
      const { getAllLeadsChiefService } = await import("../services/leadService");
      const res = await getAllLeadsChiefService(accessToken, contactNumber);

      set({
        loading: false,
        leads: res.data,
      });
    } catch (err: any) {
      console.error("Failed to fetch chief leads:", err);
      set({
        loading: false,
        error: err?.message || "Failed to load leads",
      });
    }
  },

  // 🔹 Update lead status (chief)
  updateLeadStatus: async (
    id: string,
    status: LeadStatus,
    accessToken: string
  ) => {
    if (!accessToken) {
      set({ error: "Chief not logged in" });
      return false;
    }

    set({ loading: true, error: null });

    try {
      const { updateLeadStatusChiefService } = await import("../services/leadService");
      const res = await updateLeadStatusChiefService(id, status, accessToken);

      // Update local list
      set((state) => ({
        loading: false,
        leads: state.leads.map((lead) =>
          lead._id === id ? res.data : lead
        ),
      }));

      return true;
    } catch (err: any) {
      console.error("Failed to update lead status:", err);
      set({
        loading: false,
        error: err?.message || "Failed to update status",
      });
      return false;
    }
  },

  // 🔹 Clear leads (on logout)
  clearLeads: () => {
    set({ leads: [], error: null });
  },
}));

// =======================
// ADMIN LEADS STORE (getAll + update status)
// =======================

type AdminLeadsState = {
  leads: Lead[];
  loading: boolean;
  error: string | null;

  fetchAllLeads: (contactNumber?: string) => Promise<void>;
  updateLeadStatus: (id: string, status: LeadStatus) => Promise<boolean>;
};

export const useAdminLeadsStore = create<AdminLeadsState>((set, get) => ({
  leads: [],
  loading: false,
  error: null,

  // 🔹 Get ALL leads (admin only)
  fetchAllLeads: async (contactNumber?: string) => {
    const { tokens } = useAdminAuthStore.getState();
    const accessToken = tokens?.accessToken;

    if (!accessToken) {
      set({ error: "Admin not logged in" });
      return;
    }

    const runFetch = async () => {
      const { tokens: t } = useAdminAuthStore.getState();
      if (!t?.accessToken) throw new Error("No access token (admin)");
      return await getAllLeadsAdminService(t.accessToken, contactNumber);
    };

    set({ loading: true, error: null });

    try {
      const res = await runFetch();

      set({
        loading: false,
        leads: res.data,
      });
    } catch (err: any) {
      const message = err?.message?.toString().toLowerCase() || "";

      if (
        message.includes("jwt expired") ||
        (message.includes("token") && message.includes("expired")) ||
        (message.includes("token") && message.includes("invalid"))
      ) {
        try {
          const ok = await useAdminAuthStore.getState().refreshAdminTokens();

          if (!ok) {
            // Token refresh failed - admin will be auto-logged out
            set({ loading: false });
            return;
          }

          const res2 = await runFetch();

          set({
            loading: false,
            leads: res2.data,
          });

          return;
        } catch (e2: any) {
          set({
            loading: false,
            error: e2?.message || "Failed to load leads",
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
      const message = err?.message?.toString().toLowerCase() || "";

      if (
        message.includes("jwt expired") ||
        (message.includes("token") && message.includes("expired")) ||
        (message.includes("token") && message.includes("invalid"))
      ) {
        try {
          const ok = await useAdminAuthStore.getState().refreshAdminTokens();

          if (!ok) {
            // Token refresh failed - admin will be auto-logged out
            set({ loading: false });
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
          set({
            loading: false,
            error: e2?.message || "Failed to update lead status",
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

// =======================
// MANAGER LEADS STORE (getAll + update status)
// =======================

type ManagerLeadsState = {
  leads: Lead[];
  loading: boolean;
  error: string | null;

  fetchAllLeads: (accessToken: string, contactNumber?: string) => Promise<void>;
  updateLeadStatus: (
    id: string,
    status: LeadStatus,
    accessToken: string
  ) => Promise<boolean>;
  clearLeads: () => void;
};

export const useManagerLeadsStore = create<ManagerLeadsState>((set, get) => ({
  leads: [],
  loading: false,
  error: null,

  // 🔹 Get ALL leads (manager)
  fetchAllLeads: async (accessToken: string, contactNumber?: string) => {
    if (!accessToken) {
      set({ error: "Manager not logged in" });
      return;
    }

    set({ loading: true, error: null });

    try {
      const { getAllLeadsManagerService } = await import("../services/leadService");
      const res = await getAllLeadsManagerService(accessToken, contactNumber);

      set({
        loading: false,
        leads: res.data,
      });
    } catch (err: any) {
      console.error("Failed to fetch manager leads:", err);
      set({
        loading: false,
        error: err?.message || "Failed to load leads",
      });
    }
  },

  // 🔹 Update lead status (manager)
  updateLeadStatus: async (
    id: string,
    status: LeadStatus,
    accessToken: string
  ) => {
    if (!accessToken) {
      set({ error: "Manager not logged in" });
      return false;
    }

    set({ loading: true, error: null });

    try {
      const { updateLeadStatusManagerService } = await import("../services/leadService");
      const res = await updateLeadStatusManagerService(id, status, accessToken);

      // Update local list
      set((state) => ({
        loading: false,
        leads: state.leads.map((lead) =>
          lead._id === id ? res.data : lead
        ),
      }));

      return true;
    } catch (err: any) {
      console.error("Failed to update lead status:", err);
      set({
        loading: false,
        error: err?.message || "Failed to update status",
      });
      return false;
    }
  },

  // 🔹 Clear leads (on logout)
  clearLeads: () => {
    set({ leads: [], error: null });
  },
}));

// =======================
// GODOWN INCHARGE LEADS STORE (getAll + update status)
// =======================

type GodownInchargeLeadsState = {
  leads: Lead[];
  loading: boolean;
  error: string | null;

  fetchAllLeads: (accessToken: string, contactNumber?: string) => Promise<void>;
  updateLeadStatus: (
    id: string,
    status: LeadStatus,
    accessToken: string
  ) => Promise<boolean>;
  clearLeads: () => void;
};

export const useGodownInchargeLeadsStore = create<GodownInchargeLeadsState>((set, get) => ({
  leads: [],
  loading: false,
  error: null,

  // 🔹 Get ALL leads (godown incharge)
  fetchAllLeads: async (accessToken: string, contactNumber?: string) => {
    if (!accessToken) {
      set({ error: "Godown Incharge not logged in" });
      return;
    }

    set({ loading: true, error: null });

    try {
      const { getAllLeadsGodownInchargeService } = await import("../services/leadService");
      const res = await getAllLeadsGodownInchargeService(accessToken, contactNumber);

      set({
        loading: false,
        leads: res.data,
      });
    } catch (err: any) {
      console.error("Failed to fetch godown incharge leads:", err);
      set({
        loading: false,
        error: err?.message || "Failed to load leads",
      });
    }
  },

  // 🔹 Update lead status (godown incharge)
  updateLeadStatus: async (
    id: string,
    status: LeadStatus,
    accessToken: string
  ) => {
    if (!accessToken) {
      set({ error: "Godown Incharge not logged in" });
      return false;
    }

    set({ loading: true, error: null });

    try {
      const { updateLeadStatusGodownInchargeService } = await import("../services/leadService");
      const res = await updateLeadStatusGodownInchargeService(id, status, accessToken);

      // Update local list
      set((state) => ({
        loading: false,
        leads: state.leads.map((lead) =>
          lead._id === id ? res.data : lead
        ),
      }));

      return true;
    } catch (err: any) {
      console.error("Failed to update lead status:", err);
      set({
        loading: false,
        error: err?.message || "Failed to update status",
      });
      return false;
    }
  },

  // 🔹 Clear leads (on logout)
  clearLeads: () => {
    set({ leads: [], error: null });
  },
}));
