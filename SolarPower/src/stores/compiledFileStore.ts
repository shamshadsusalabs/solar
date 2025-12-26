// src/stores/compiledFileStore.ts
import { create } from "zustand";
import {
    uploadCompiledFileService,
    getCompiledFileService,
    deleteCompiledFileService,
} from "../services/compiledFileService";

interface CompiledFileState {
    // State
    compiledFileUrl: string | null;
    uploading: boolean;
    loading: boolean;
    deleting: boolean;
    error: string | null;

    // Actions
    uploadCompiledFile: (
        leadId: string,
        pdfFile: { uri: string; name: string; type: string },
        token: string
    ) => Promise<void>;
    getCompiledFile: (leadId: string, token: string) => Promise<void>;
    deleteCompiledFile: (leadId: string, token: string) => Promise<void>;
    clearError: () => void;
    reset: () => void;
}

export const useCompiledFileStore = create<CompiledFileState>((set) => ({
    // Initial state
    compiledFileUrl: null,
    uploading: false,
    loading: false,
    deleting: false,
    error: null,

    // Upload compiled PDF
    uploadCompiledFile: async (leadId, pdfFile, token) => {
        set({ uploading: true, error: null });
        try {
            const response = await uploadCompiledFileService(leadId, pdfFile, token);
            if (response.success) {
                set({
                    compiledFileUrl: response.data?.compiledFileUrl || null,
                    uploading: false,
                });
            } else {
                set({
                    error: response.message || "Failed to upload compiled file",
                    uploading: false,
                });
            }
        } catch (err: any) {
            console.error("Upload compiled file error:", err);
            set({
                error: err?.response?.data?.message || err.message || "Upload failed",
                uploading: false,
            });
        }
    },

    // Get compiled file URL
    getCompiledFile: async (leadId, token) => {
        set({ loading: true, error: null });
        try {
            const response = await getCompiledFileService(leadId, token);
            if (response.success) {
                set({
                    compiledFileUrl: response.data?.compiledFileUrl || null,
                    loading: false,
                });
            } else {
                set({
                    error: response.message || "Failed to get compiled file",
                    loading: false,
                });
            }
        } catch (err: any) {
            console.error("Get compiled file error:", err);
            set({
                error: err?.response?.data?.message || err.message || "Failed to load",
                loading: false,
            });
        }
    },

    // Delete compiled file
    deleteCompiledFile: async (leadId, token) => {
        set({ deleting: true, error: null });
        try {
            const response = await deleteCompiledFileService(leadId, token);
            if (response.success) {
                set({
                    compiledFileUrl: null,
                    deleting: false,
                });
            } else {
                set({
                    error: response.message || "Failed to delete compiled file",
                    deleting: false,
                });
            }
        } catch (err: any) {
            console.error("Delete compiled file error:", err);
            set({
                error: err?.response?.data?.message || err.message || "Delete failed",
                deleting: false,
            });
        }
    },

    // Clear error
    clearError: () => set({ error: null }),

    // Reset state
    reset: () =>
        set({
            compiledFileUrl: null,
            uploading: false,
            loading: false,
            deleting: false,
            error: null,
        }),
}));
