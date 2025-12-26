// src/services/managerService.ts
import { apiFetch } from "./api";

export interface ManagerProfile {
    id: string;
    email: string;
    name: string;
    phoneNumber: string;
}

export interface ManagerProfileResponse {
    success: boolean;
    data: ManagerProfile;
}

/**
 * Fetch current manager's profile
 */
export const getManagerProfileService = async (
    accessToken: string
): Promise<ManagerProfileResponse> => {
    try {
        const response = await apiFetch<ManagerProfileResponse>(
            "/api/manager/profile",
            {
                method: "GET",
                token: accessToken,
            }
        );

        return response;
    } catch (error: any) {
        const errorMessage =
            error?.message || "Failed to fetch manager profile";
        throw new Error(errorMessage);
    }
};
