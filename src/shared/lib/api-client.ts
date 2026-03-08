import axios, {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const AUTH_STORAGE_KEY = "auth";
const REFRESH_TOKEN_PATH_PREFIX = "/api/auth/token/refresh/";
const AUTH_ROUTE_PATTERN = /^\/(pt|en)\/auth\/(login|register)\/?$/;

let refreshTokenPromise: Promise<string | null> | null = null;

export interface ApiErrorResponse {
  code?: number;
  detail?: string;
  errorType?: string;
  timestampUtc?: string;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  code?: number;
  errorType?: string;
  timestampUtc?: string;
  errors?: Record<string, string[]>;

  constructor(body: ApiErrorResponse = {}, statusCode?: number) {
    const message = buildPrimaryMessage(body, statusCode);
    super(message);
    this.name = "ApiError";
    this.code = body.code ?? statusCode;
    this.errorType = body.errorType;
    this.timestampUtc = body.timestampUtc;
    this.errors = body.errors;
  }
}

interface StoredAuthPayload {
  user?: unknown;
  accessToken?: string;
  refreshToken?: string;
}

interface RefreshTokenResponse {
  accessToken?: string;
  refreshToken?: string;
  user?: unknown;
}

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

function buildPrimaryMessage(body: ApiErrorResponse, statusCode?: number) {
  const fieldErrors = body.errors
    ? Object.values(body.errors).flat().filter(Boolean)
    : [];

  if (fieldErrors.length > 0) return fieldErrors[0];
  if (body.detail) return body.detail;
  if (statusCode) return `Request failed with status ${statusCode}`;
  return "Unexpected API error";
}

function normalizeErrorBody(rawBody: unknown): ApiErrorResponse {
  const body = (rawBody as Record<string, unknown>) || {};
  const errors = (body.errors || body.Errors) as
    | Record<string, string[]>
    | undefined;

  return {
    code:
      (body.code as number | undefined) ?? (body.Code as number | undefined),
    detail:
      (body.detail as string | undefined) ||
      (body.Detail as string | undefined) ||
      (body.message as string | undefined) ||
      (body.Message as string | undefined),
    errorType:
      (body.errorType as string | undefined) ||
      (body.ErrorType as string | undefined),
    timestampUtc:
      (body.timestampUtc as string | undefined) ||
      (body.TimestampUtc as string | undefined),
    errors: errors && typeof errors === "object" ? errors : undefined,
  };
}

function buildApiError(error: AxiosError): ApiError {
  const statusCode = error.response?.status;
  const body = error.response?.data;

  if (typeof body === "string" && body.trim().length > 0) {
    return new ApiError({ detail: body }, statusCode);
  }

  if (body && typeof body === "object") {
    return new ApiError(normalizeErrorBody(body), statusCode);
  }

  if (error.message) {
    return new ApiError({ detail: error.message }, statusCode);
  }

  return new ApiError({}, statusCode);
}

function parseStoredAuth(rawValue: string | null): StoredAuthPayload | null {
  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(rawValue) as StoredAuthPayload;
    if (!parsed || typeof parsed !== "object") return null;
    if (!parsed.accessToken || typeof parsed.accessToken !== "string") {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function readStoredAuth(): StoredAuthPayload | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  const parsed = parseStoredAuth(raw);
  if (!parsed) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
  return parsed;
}

function persistStoredAuth(payload: StoredAuthPayload): void {
  if (typeof window === "undefined") return;
  if (!payload.accessToken) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({
      user: payload.user ?? null,
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken ?? null,
    }),
  );
}

function clearStoredAuth(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

function getCurrentLocale() {
  if (typeof window === "undefined") return "pt";
  const firstSegment = window.location.pathname.split("/")[1];
  return firstSegment === "en" ? "en" : "pt";
}

function clearSessionAndRedirectToLogin() {
  clearStoredAuth();

  if (typeof window === "undefined") return;
  if (AUTH_ROUTE_PATTERN.test(window.location.pathname)) return;

  const locale = getCurrentLocale();
  window.location.replace(`/${locale}/auth/login`);
}

function isRefreshTokenRequest(url?: string) {
  if (!url) return false;
  return url.includes(REFRESH_TOKEN_PATH_PREFIX);
}

function resolveUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (!API_BASE_URL) {
    throw new ApiError({ detail: "API base URL is not configured." });
  }
  return `${API_BASE_URL}${path}`;
}

function normalizeRequestHeaders(
  headersInit?: HeadersInit,
): Record<string, string> {
  const normalized: Record<string, string> = {};
  const headers = new Headers(headersInit ?? {});
  headers.forEach((value, key) => {
    normalized[key] = value;
  });
  return normalized;
}

async function refreshAccessToken(): Promise<string | null> {
  const session = readStoredAuth();
  const refreshToken = session?.refreshToken;

  if (!refreshToken) return null;

  try {
    const response = await axios.request<RefreshTokenResponse>({
      method: "POST",
      url: resolveUrl(`${REFRESH_TOKEN_PATH_PREFIX}${refreshToken}`),
      headers: session.accessToken
        ? { Authorization: `Bearer ${session.accessToken}` }
        : undefined,
    });

    const newAccessToken = response.data?.accessToken;
    if (!newAccessToken) return null;

    persistStoredAuth({
      user: response.data?.user ?? session.user,
      accessToken: newAccessToken,
      refreshToken: response.data?.refreshToken ?? refreshToken,
    });

    return newAccessToken;
  } catch {
    return null;
  }
}

function getRefreshTokenPromise() {
  if (!refreshTokenPromise) {
    refreshTokenPromise = refreshAccessToken().finally(() => {
      refreshTokenPromise = null;
    });
  }

  return refreshTokenPromise;
}

const httpClient = axios.create();

httpClient.interceptors.request.use((config) => {
  const headers = AxiosHeaders.from(config.headers);
  const session = readStoredAuth();

  if (session?.accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  if (
    config.data !== undefined &&
    !(config.data instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  config.headers = headers;
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const requestConfig = error.config as RetriableRequestConfig | undefined;
    const statusCode = error.response?.status;
    const storedAuth = readStoredAuth();

    const shouldRetryWithRefresh =
      statusCode === 401 &&
      !!requestConfig &&
      !requestConfig._retry &&
      !!storedAuth?.refreshToken &&
      !isRefreshTokenRequest(requestConfig.url);

    if (shouldRetryWithRefresh && requestConfig) {
      requestConfig._retry = true;

      const refreshedAccessToken = await getRefreshTokenPromise();

      if (refreshedAccessToken) {
        const retryHeaders = AxiosHeaders.from(requestConfig.headers);
        retryHeaders.set("Authorization", `Bearer ${refreshedAccessToken}`);
        requestConfig.headers = retryHeaders;
        return httpClient(requestConfig);
      }

      clearSessionAndRedirectToLogin();
      throw new ApiError(
        { detail: "Session expired. Please log in again." },
        401,
      );
    }

    if (
      statusCode === 401 &&
      !!storedAuth?.accessToken &&
      !isRefreshTokenRequest(requestConfig?.url)
    ) {
      clearSessionAndRedirectToLogin();
    }

    throw buildApiError(error);
  },
);

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await httpClient.request<T>({
    url: resolveUrl(path),
    method: options.method ?? (options.body ? "POST" : "GET"),
    data: options.body,
    headers: normalizeRequestHeaders(options.headers),
    signal: options.signal ?? undefined,
  });

  const hasBody = response.status !== 204;
  if (!hasBody || response.data === "" || response.data === undefined) {
    return undefined as T;
  }

  return response.data as T;
}

export function toApiError(error: unknown, fallbackMessage: string): ApiError {
  if (error instanceof ApiError) return error;
  if (axios.isAxiosError(error)) return buildApiError(error);

  const message = error instanceof Error ? error.message : fallbackMessage;
  return new ApiError({ detail: message });
}
