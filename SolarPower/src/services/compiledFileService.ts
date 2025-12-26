// src/services/compiledFileService.ts
import { apiFetch } from "./api";

export interface CompiledFileResponse {
    success: boolean;
    message?: string;
    data?: {
        compiledFileUrl: string | null;
        leadId?: string;
    };
}

/**
 * Upload compiled PDF file for a lead
 * @param leadId - Lead ID
 * @param pdfFile - PDF file object (from react-native-document-picker or similar)
 * @param token - Access token (admin/manager/chief)
 */
export const uploadCompiledFileService = async (
    leadId: string,
    pdfFile: {
        uri: string;
        name: string;
        type: string;
    },
    token: string
): Promise<CompiledFileResponse> => {
    const formData = new FormData();
    formData.append("compiledFile", {
        uri: pdfFile.uri,
        name: pdfFile.name,
        type: pdfFile.type || "application/pdf",
    } as any);

    return await apiFetch<CompiledFileResponse>(`/api/leads/${leadId}/compiled-file`, {
        method: "POST",
        body: formData,
        token,
    });
};

/**
 * Get compiled file URL for a lead
 * @param leadId - Lead ID
 * @param token - Access token
 */
export const getCompiledFileService = async (
    leadId: string,
    token: string
): Promise<CompiledFileResponse> => {
    return await apiFetch<CompiledFileResponse>(`/api/leads/${leadId}/compiled-file`, {
        method: "GET",
        token,
    });
};

/**
 * Delete compiled file from a lead
 * @param leadId - Lead ID
 * @param token - Access token (admin/manager/chief)
 */
export const deleteCompiledFileService = async (
    leadId: string,
    token: string
): Promise<CompiledFileResponse> => {
    return await apiFetch<CompiledFileResponse>(`/api/leads/${leadId}/compiled-file`, {
        method: "DELETE",
        token,
    });
};
