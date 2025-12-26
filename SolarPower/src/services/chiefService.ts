import { apiFetch } from "./api";

export interface ChiefProfile {
    id: string;
    email: string;
    name: string;
    phoneNumber: string;
}

export interface ChiefProfileResponse {
    success: boolean;
    data: ChiefProfile;
}

/**
 * Fetch current chief's profile
 */
export const getChiefProfileService = async (
    accessToken: string
): Promise<ChiefProfileResponse> => {
    try {
        const response = await apiFetch<ChiefProfileResponse>(
            "/api/chief/profile",
            {
                method: "GET",
                token: accessToken,
            }
        );

        return response;
    } catch (error: any) {
        const errorMessage =
            error?.message || "Failed to fetch chief profile";
        throw new Error(errorMessage);
    }
};
