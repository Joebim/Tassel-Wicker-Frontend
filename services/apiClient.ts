import { useAuthStore } from "@/store/authStore";

export type ApiErrorShape = {
  error?: string;
  message?: string;
  requestId?: string;
  details?: unknown;
};

function joinUrl(base: string, path: string) {
  const b = base.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

export function getApiBaseUrl() {
  // If unset, we assume same-origin (useful with Next rewrites or reverse proxy).
  // In dev we default to the backend guide base URL to reduce setup friction.
  const configured = (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim();
  if (configured) return configured;
  if (process.env.NODE_ENV === "development") return "http://localhost:4000";
  return "";
}

export function apiUrl(path: string) {
  const base = getApiBaseUrl();
  if (!base) return path; // same-origin
  return joinUrl(base, path);
}

function isFormData(body: unknown): body is FormData {
  return typeof FormData !== "undefined" && body instanceof FormData;
}

async function parseJsonSafely(res: Response) {
  const text = await res.text().catch(() => "");
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function refreshAccessToken() {
  const { refreshToken } = useAuthStore.getState();
  if (!refreshToken) return false;

  const res = await fetch(apiUrl("/api/auth/refresh"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) return false;
  const data = (await parseJsonSafely(res)) as {
    token?: string;
    refreshToken?: string;
  } | null;
  if (!data?.token || !data?.refreshToken) return false;

  useAuthStore
    .getState()
    .setTokens({ token: data.token, refreshToken: data.refreshToken });
  return true;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean; retryOnAuthFail?: boolean } = {}
): Promise<T> {
  const {
    auth = true,
    retryOnAuthFail = true,
    headers,
    body,
    ...rest
  } = options;
  const token = useAuthStore.getState().token;

  const finalHeaders = new Headers(headers);
  if (auth && token) finalHeaders.set("Authorization", `Bearer ${token}`);

  // Only set JSON content-type if not sending FormData
  const sendingForm = isFormData(body);
  if (!sendingForm && body && !finalHeaders.has("Content-Type")) {
    finalHeaders.set("Content-Type", "application/json");
  }

  const doFetch = () =>
    fetch(apiUrl(path), {
      ...rest,
      headers: finalHeaders,
      body,
    });

  let res = await doFetch();

  if (res.status === 401 && auth && retryOnAuthFail) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // retry with new token
      finalHeaders.set(
        "Authorization",
        `Bearer ${useAuthStore.getState().token}`
      );
      res = await doFetch();
    }
  }

  if (!res.ok) {
    const data = (await parseJsonSafely(res)) as ApiErrorShape | string | null;
    const message =
      typeof data === "string"
        ? data
        : data?.message || data?.error || res.statusText || "Request failed";
    const err: Error & { status?: number; data?: unknown } = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  const json = (await parseJsonSafely(res)) as T;
  return json;
}
