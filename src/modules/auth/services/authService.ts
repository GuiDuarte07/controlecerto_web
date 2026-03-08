import { apiFetch } from "@/shared/lib/api-client";
import type {
  AuthLoginRequest,
  AuthRegisterRequest,
  AuthResponse,
} from "../types/auth.types";

async function login(credentials: AuthLoginRequest): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/auth/token", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

async function register(data: AuthRegisterRequest): Promise<AuthResponse> {
  await apiFetch<void>("/api/users", {
    method: "POST",
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      password: data.password,
    }),
  });

  return login({
    email: data.email,
    password: data.password,
  });
}

async function logout(
  refreshToken: string,
  accessToken?: string,
): Promise<void> {
  await apiFetch<void>(`/api/auth/logout/${refreshToken}`, {
    method: "POST",
    headers: accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : undefined,
  });
}

async function refreshToken(refreshToken: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>(`/api/auth/token/refresh/${refreshToken}`, {
    method: "POST",
  });
}

export const authService = {
  login,
  register,
  logout,
  refreshToken,
};
