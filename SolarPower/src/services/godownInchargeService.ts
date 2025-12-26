// src/services/godownInchargeService.ts
import { apiFetch } from "./api";

export interface GodownInchargeProfile {
    id: string;
    email: string;
    name: string;
    phoneNumber: string;
}

export interface GodownInchargeProfileResponse {
    success: boolean;
    data: GodownInchargeProfile;
}

/**
 * Fetch current godown incharge's profile
 */
export const getGodownInchargeProfileService = async (
    accessToken: string
): Promise<GodownInchargeProfileResponse> => {
    try {
        const response = await apiFetch<GodownInchargeProfileResponse>(
            "/api/godown-incharge/profile",
            {
                method: "GET",
                token: accessToken,
            }
        );

        return response;
    } catch (error: any) {
        const errorMessage =
            error?.message || "Failed to fetch godown incharge profile";
        throw new Error(errorMessage);
    }
};
