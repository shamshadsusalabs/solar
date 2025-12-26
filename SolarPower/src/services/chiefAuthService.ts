import { apiFetch } from "./api";

// ============= TYPES =============
export interface ChiefLoginResponse {
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

// ============= GET ALL CHIEFS =============
export const getAllChiefsService = async (adminAccessToken: string) => {
    const data = await apiFetch<{ success: boolean; data: any[] }>(
        "/api/chief",
        {
            method: "GET",
            token: adminAccessToken,
        }
    );

    return data;
};

// ============= LOGIN =============
export const loginChiefService = async (
    email: string,
    password: string
) => {
    const body = { email, password };

    const data = await apiFetch<ChiefLoginResponse>(
        "/api/chief/login",
        {
            method: "POST",
            body,
        }
    );

    return data;
};

// ============= REFRESH TOKEN =============
export const refreshChiefTokenService = async (refreshToken: string) => {
    const data = await apiFetch<RefreshTokenResponse>(
        "/api/chief/refresh-token",
        {
            method: "POST",
            body: { refreshToken },
        }
    );

    return data;
};

// ============= REGISTER (Admin only) =============
interface RegisterChiefBody {
    email: string;
    name: string;
    password: string;
    phoneNumber: string;
}

export const registerChiefService = async (
    body: RegisterChiefBody,
    adminAccessToken: string
) => {
    const data = await apiFetch<ChiefLoginResponse>(
        "/api/chief/register",
        {
            method: "POST",
            body,
            token: adminAccessToken,
        }
    );

    return data;
};

// ============= UPDATE (Admin only) =============
interface UpdateChiefBody {
    email?: string;
    name?: string;
    password?: string;
    phoneNumber?: string;
}

export const updateChiefService = async (
    id: string,
    body: UpdateChiefBody,
    adminAccessToken: string
) => {
    const data = await apiFetch<ChiefLoginResponse>(
        `/api/chief/${id}`,
        {
            method: "PUT",
            body,
            token: adminAccessToken,
        }
    );

    return data;
};

// ============= DELETE (Admin only) =============
export const deleteChiefService = async (
    id: string,
    adminAccessToken: string
) => {
    const data = await apiFetch<{ success: boolean; message: string }>(
        `/api/chief/${id}`,
        {
            method: "DELETE",
            token: adminAccessToken,
        }
    );

    return data;
};
