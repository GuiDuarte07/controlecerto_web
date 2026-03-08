import type { AuthUser } from "../types/auth.types";

export const AUTH_STORAGE_KEY = "auth";

export interface StoredAuthSession {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
}

function normalizeStoredAuth(raw: unknown): StoredAuthSession | null {
  if (!raw || typeof raw !== "object") return null;

  const payload = raw as Record<string, unknown>;
  const accessToken =
    typeof payload.accessToken === "string" &&
    payload.accessToken.trim().length > 0
      ? payload.accessToken
      : null;

  if (!accessToken) return null;

  const refreshToken =
    typeof payload.refreshToken === "string" &&
    payload.refreshToken.trim().length > 0
      ? payload.refreshToken
      : null;

  const user =
    payload.user && typeof payload.user === "object"
      ? (payload.user as AuthUser)
      : null;

  return {
    user,
    accessToken,
    refreshToken,
  };
}

export function readStoredAuthSession(): StoredAuthSession | null {
  if (typeof window === "undefined") return null;

  const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!rawValue) return null;

  try {
    return normalizeStoredAuth(JSON.parse(rawValue));
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function hasStoredAuthSession(): boolean {
  return !!readStoredAuthSession()?.accessToken;
}

export function persistStoredAuthSession(session: StoredAuthSession): void {
  if (typeof window === "undefined") return;

  if (!session.accessToken) {
    clearStoredAuthSession();
    return;
  }

  window.localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({
      user: session.user,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    }),
  );
}

export function clearStoredAuthSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}
