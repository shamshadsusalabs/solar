// src/services/godownInchargeAuthService.ts
import { apiFetch } from "./api";

// ============= TYPES =============
export interface GodownInchargeLoginResponse {
    success: boolean;
    message: string;
    data: {
        id: string;
        email: string;
        name: string;
        phoneNumber: string;
    };
    tokens: {
        accessToken: string;
        refreshToken: string;
    };
}

export interface RefreshTokenResponse {
    success: boolean;
    message: string;
    tokens: {
        accessToken: string;
        refreshToken: string;
    };
}

// ============= GET ALL GODOWN INCHARGES =============
export const getAllGodownInchargesService = async (adminAccessToken: string) => {
    const data = await apiFetch<{ success: boolean; data: any[] }>(
        "/api/godown-incharge",
        {
            method: "GET",
            token: adminAccessToken,
        }
    );

    return data;
};

// ============= LOGIN =============
export const loginGodownInchargeService = async (
    email: string,
    password: string
) => {
    const body = { email, password };

    const data = await apiFetch<GodownInchargeLoginResponse>(
        "/api/godown-incharge/login",
        {
            method: "POST",
            body,
        }
    );

    return data;
};

// ============= REFRESH TOKEN =============
export const refreshGodownInchargeTokenService = async (refreshToken: string) => {
    const data = await apiFetch<RefreshTokenResponse>(
        "/api/godown-incharge/refresh-token",
        {
            method: "POST",
            body: { refreshToken },
        }
    );

    return data;
};

// ============= REGISTER (Admin only) =============
interface RegisterGodownInchargeBody {
    email: string;
    name: string;
    password: string;
    phoneNumber: string;
}

export const registerGodownInchargeService = async (
    body: RegisterGodownInchargeBody,
    adminAccessToken: string
) => {
    const data = await apiFetch<GodownInchargeLoginResponse>(
        "/api/godown-incharge/register",
        {
            method: "POST",
            body,
            token: adminAccessToken,
        }
    );

    return data;
};

// ============= UPDATE (Admin only) =============
interface UpdateGodownInchargeBody {
    email?: string;
    name?: string;
    password?: string;
    phoneNumber?: string;
}

export const updateGodownInchargeService = async (
    id: string,
    body: UpdateGodownInchargeBody,
    adminAccessToken: string
) => {
    const data = await apiFetch<GodownInchargeLoginResponse>(
        `/api/godown-incharge/${id}`,
        {
            method: "PUT",
            body,
            token: adminAccessToken,
        }
    );

    return data;
};

// ============= DELETE (Admin only) =============
export const deleteGodownInchargeService = async (
    id: string,
    adminAccessToken: string
) => {
    const data = await apiFetch<{ success: boolean; message: string }>(
        `/api/godown-incharge/${id}`,
        {
            method: "DELETE",
            token: adminAccessToken,
        }
    );

    return data;
};
