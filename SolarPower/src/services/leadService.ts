// src/services/leadService.ts
import { apiFetch } from "./api";

export type LeadStatus =
  | "INTERESTED_CUSTOMERS"
  | "DOCUMENTS_RECEIVED"
  | "DOCUMENTS_UPLOADED_ON_PORTAL"
  | "FILE_SENT_TO_BANK"
  | "PAYMENT_RECEIVED"
  | "SYSTEM_DELIVERED"
  | "SYSTEM_INSTALLED"
  | "SYSTEM_COMMISSIONED"
  | "SUBSIDY_REDEEMED"
  | "SUBSIDY_DISBURSED"
  | "LEAD_CLOSE";

export interface LeadDocument {
  fileName: string;
  fileUrl: string;
}

export interface Lead {
  _id: string;
  salesManId: string;
  salesManName: string;
  salesManCode: string;

  customerName: string;
  contactNumber: string;
  addressText: string;

  documents: LeadDocument[];

  requiredSystemCapacity?: string;
  systemCostQuoted?: number;

  bankAccountName?: string;
  ifscCode?: string;
  branchDetails?: string;

  textInstructions?: string;

  compiledFile?: string; // Cloudinary URL for compiled PDF

  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
}

interface LeadResponse {
  success: boolean;
  message?: string;
  data: Lead;
}

interface LeadListResponse {
  success: boolean;
  data: Lead[];
}

/**
 * Create lead (with files) – hits: POST /api/leads/addlead
 */
export const createLeadService = async (
  formData: FormData,
  accessToken: string
) => {
  const data = await apiFetch<LeadResponse>("/api/leads/addlead", {
    method: "POST",
    body: formData,
    token: accessToken,
  });

  return data;
};

/**
 * Get list of leads – GET /api/leads?salesManId=...&status=...
 */
export const getLeadsService = async (
  accessToken: string,
  params?: { salesManId?: string; status?: LeadStatus }
) => {
  const searchParams = new URLSearchParams();

  if (params?.salesManId) searchParams.append("salesManId", params.salesManId);
  if (params?.status) searchParams.append("status", params.status);

  const query = searchParams.toString();
  const url = `/api/leads${query ? `?${query}` : ""}`;

  const data = await apiFetch<LeadListResponse>(url, {
    method: "GET",
    token: accessToken,
  });

  return data;
};


/**
 * Get single lead – GET /api/leads/:id
 */
export const getLeadByIdService = async (
  id: string,
  accessToken: string
) => {
  const data = await apiFetch<LeadResponse>(`/api/leads/${id}`, {
    method: "GET",
    token: accessToken,
  });

  return data;
};

/**
 * Update full lead – PUT /api/leads/updatebyId/:id
 * Accepts both FormData (for files) and JSON body
 */
export const updateLeadService = async (
  id: string,
  body: FormData | Partial<Lead>,
  accessToken: string
) => {
  const data = await apiFetch<LeadResponse>(`/api/leads/updatebyId/${id}`, {
    method: "PUT",
    body,
    token: accessToken,
  });

  return data;
};

/**
 * Update status only – PATCH /api/leads/:id/status
 */


/**
 * Delete lead – DELETE /api/leads/:id
 */
export const deleteLeadService = async (
  id: string,
  accessToken: string
) => {
  const data = await apiFetch<{ success: boolean; message?: string }>(
    `/api/leads/${id}`,
    {
      method: "DELETE",
      token: accessToken,
    }
  );

  return data;
};

/**
 * Update lead status by employee - PATCH /api/leads/employee/updatestatus/:id/status
 */
export const updateEmployeeLeadStatusService = async (
  leadId: string,
  status: LeadStatus,
  accessToken: string
) => {
  const data = await apiFetch<{ success: boolean; data: Lead }>(`/api/leads/employee/updatestatus/${leadId}/status`, {
    method: "PATCH",
    token: accessToken,
    body: { status },
  });

  return data;
};



// ... tumhara existing types (LeadStatus, Lead, LeadResponse, LeadListResponse, etc.)

// 👇 NEW: paginated response type (optional)
interface PaginatedLeadListResponse {
  success: boolean;
  data: Lead[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * NEW: Get leads by salesManId (employee side)
 * GET /api/leads/getAllBysalesId?salesManId=...&page=1&limit=10
 */
export const getLeadsBySalesIdService = async (
  accessToken: string,
  params: { salesManId: string; page?: number; limit?: number }
) => {
  const searchParams = new URLSearchParams();

  searchParams.append("salesManId", params.salesManId);
  if (params.page) searchParams.append("page", String(params.page));
  if (params.limit) searchParams.append("limit", String(params.limit));

  const query = searchParams.toString();
  const url = `/api/leads/getAllBysalesId${query ? `?${query}` : ""}`;

  const data = await apiFetch<PaginatedLeadListResponse>(url, {
    method: "GET",
    token: accessToken,
  });

  return data;
};

export const updateLeadStatusService = async (
  id: string,
  status: LeadStatus,
  accessToken: string
) => {
  const data = await apiFetch<LeadResponse>(
    `/api/leads/updatestatus/${id}/status`,   // ✅ NEW CORRECT PATH
    {
      method: "PATCH",
      body: { status },
      token: accessToken,                     // ✅ admin ka token pass karega caller
    }
  );

  return data;
};


// 👇 admin side – get ALL leads (no filter) – GET /api/leads/getAll
export const getAllLeadsAdminService = async (
  accessToken: string,
  contactNumber?: string
) => {
  const searchParams = new URLSearchParams();
  if (contactNumber) {
    searchParams.append("contactNumber", contactNumber);
  }

  const query = searchParams.toString();
  const url = `/api/leads/getAll${query ? `?${query}` : ""}`;

  const data = await apiFetch<LeadListResponse>(url, {
    method: "GET",
    token: accessToken,
  });

  return data;
};

// 👇 MANAGER: get ALL leads – GET /api/leads/manager/getAll
export const getAllLeadsManagerService = async (
  accessToken: string,
  contactNumber?: string
) => {
  const searchParams = new URLSearchParams();
  if (contactNumber) {
    searchParams.append("contactNumber", contactNumber);
  }

  const query = searchParams.toString();
  const url = `/api/leads/manager/getAll${query ? `?${query}` : ""}`;

  const data = await apiFetch<LeadListResponse>(url, {
    method: "GET",
    token: accessToken,
  });

  return data;
};

// 👇 MANAGER: update lead status – PATCH /api/leads/manager/updatestatus/:id/status
export const updateLeadStatusManagerService = async (
  id: string,
  status: LeadStatus,
  accessToken: string
) => {
  const data = await apiFetch<LeadResponse>(
    `/api/leads/manager/updatestatus/${id}/status`,
    {
      method: "PATCH",
      body: { status },
      token: accessToken,
    }
  );

  return data;
};

// 👇 CHIEF: get ALL leads – GET /api/leads/chief/getAll
export const getAllLeadsChiefService = async (
  accessToken: string,
  contactNumber?: string
) => {
  const searchParams = new URLSearchParams();
  if (contactNumber) {
    searchParams.append("contactNumber", contactNumber);
  }

  const query = searchParams.toString();
  const url = `/api/leads/chief/getAll${query ? `?${query}` : ""}`;

  const data = await apiFetch<LeadListResponse>(url, {
    method: "GET",
    token: accessToken,
  });

  return data;
};

// 👇 CHIEF: update lead status – PATCH /api/leads/chief/updatestatus/:id/status
export const updateLeadStatusChiefService = async (
  id: string,
  status: LeadStatus,
  accessToken: string
) => {
  const data = await apiFetch<LeadResponse>(
    `/api/leads/chief/updatestatus/${id}/status`,
    {
      method: "PATCH",
      body: { status },
      token: accessToken,
    }
  );

  return data;
};

// 👇 GODOWN INCHARGE: get ALL leads – GET /api/leads/godown-incharge/getAll
export const getAllLeadsGodownInchargeService = async (
  accessToken: string,
  contactNumber?: string
) => {
  const searchParams = new URLSearchParams();
  if (contactNumber) {
    searchParams.append("contactNumber", contactNumber);
  }

  const query = searchParams.toString();
  const url = `/api/leads/godown-incharge/getAll${query ? `?${query}` : ""}`;

  const data = await apiFetch<LeadListResponse>(url, {
    method: "GET",
    token: accessToken,
  });

  return data;
};

// 👇 GODOWN INCHARGE: update lead status – PATCH /api/leads/godown-incharge/updatestatus/:id/status
export const updateLeadStatusGodownInchargeService = async (
  id: string,
  status: LeadStatus,
  accessToken: string
) => {
  const data = await apiFetch<LeadResponse>(
    `/api/leads/godown-incharge/updatestatus/${id}/status`,
    {
      method: "PATCH",
      body: { status },
      token: accessToken,
    }
  );

  return data;
};

