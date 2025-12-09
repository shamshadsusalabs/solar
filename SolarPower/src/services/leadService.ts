// src/services/leadService.ts
import { apiFetch } from "./api";

export type LeadStatus =
  | "UNDER_DISCUSSION"
  | "DOCUMENT_RECEIVED"
  | "DOCUMENT_UPLOAD_OVER_PORTAL"
  | "FILE_SEND_TO_BANK"
  | "FUNDS_DISBURSED_BY_BANK"
  | "MERGED_DOCUMENT_UPLOAD"
  | "MATERIAL_DELIVERED"
  | "SYSTEM_INSTALLED"
  | "SYSTEM_COMMISSIONED"
  | "SUBSIDY_REDEEMED"
  | "LEAD_CLOSED"
  | "REFERRAL_RECEIVED";

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
  gpsLocation?: string;

  documents: LeadDocument[];

  rtsCapacityKw?: number;
  roofTopCapacityKw?: number;
  tropositeAmount?: number;

  bankName?: string;
  bankDetails?: string;

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
 * Update full lead – PUT /api/leads/:id
 */
export const updateLeadService = async (
  id: string,
  body: Partial<Lead>,
  accessToken: string
) => {
  const data = await apiFetch<LeadResponse>(`/api/leads/${id}`, {
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
export const getAllLeadsAdminService = async (accessToken: string) => {
  const data = await apiFetch<LeadListResponse>("/api/leads/getAll", {
    method: "GET",
    token: accessToken,
  });

  return data;
};
