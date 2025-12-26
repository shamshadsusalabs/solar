// src/services/managerAuthService.ts
import { apiFetch } from "./api";

// ============= TYPES =============
export interface ManagerLoginResponse {
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

// ============= GET ALL MANAGERS =============
export const getAllManagersService = async (adminAccessToken: string) => {
    const data = await apiFetch<{ success: boolean; data: any[] }>(
        "/api/manager",
        {
            method: "GET",
            token: adminAccessToken,
        }
    );

    return data;
};

// ============= LOGIN =============
export const loginManagerService = async (
    email: string,
    password: string
) => {
    const body = { email, password };

    const data = await apiFetch<ManagerLoginResponse>(
        "/api/manager/login",
        {
            method: "POST",
            body,
        }
    );

    return data;
};

// ============= REFRESH TOKEN =============
export const refreshManagerTokenService = async (refreshToken: string) => {
    const data = await apiFetch<RefreshTokenResponse>(
        "/api/manager/refresh-token",
        {
            method: "POST",
            body: { refreshToken },
        }
    );

    return data;
};

// ============= REGISTER (Admin only) =============
interface RegisterManagerBody {
    email: string;
    name: string;
    password: string;
    phoneNumber: string;
}

export const registerManagerService = async (
    body: RegisterManagerBody,
    adminAccessToken: string
) => {
    const data = await apiFetch<ManagerLoginResponse>(
        "/api/manager/register",
        {
            method: "POST",
            body,
            token: adminAccessToken,
        }
    );

    return data;
};

// ============= UPDATE (Admin only) =============
interface UpdateManagerBody {
    email?: string;
    name?: string;
    password?: string;
    phoneNumber?: string;
}

export const updateManagerService = async (
    id: string,
    body: UpdateManagerBody,
    adminAccessToken: string
) => {
    const data = await apiFetch<ManagerLoginResponse>(
        `/api/manager/${id}`,
        {
            method: "PUT",
            body,
            token: adminAccessToken,
        }
    );

    return data;
};

// ============= DELETE (Admin only) =============
export const deleteManagerService = async (
    id: string,
    adminAccessToken: string
) => {
    const data = await apiFetch<{ success: boolean; message: string }>(
        `/api/manager/${id}`,
        {
            method: "DELETE",
            token: adminAccessToken,
        }
    );

    return data;
};
