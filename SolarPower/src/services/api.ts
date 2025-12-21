// src/services/api.ts

export const BASE_URL = "https://solar-uyzf.onrender.com";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: any;
  token?: string | null;
};

export const apiFetch = async <T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> => {
  const { method = "GET", body, token } = options;

  // ✅ Common headers
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let finalBody: any = undefined;

  // ✅ 1) Agar FormData hai → multipart/form-data request
  if (body instanceof FormData) {
    finalBody = body;
    // ⚠️ Yahan "Content-Type" mat lagao
    // React Native / fetch khud "multipart/form-data; boundary=..." set karega
  }
  // ✅ 2) Normal JSON body
  else if (body !== undefined && body !== null) {
    headers["Content-Type"] = "application/json";
    finalBody = JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: finalBody,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = data?.message || "Request failed";
    throw new Error(msg);
  }

  return data as T;
};
