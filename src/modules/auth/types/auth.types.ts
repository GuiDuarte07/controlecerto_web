import type { ApiError } from "@/shared/lib/api-client";

export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface AuthRegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    name: string;
    emailConfirmed?: boolean;
  };
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  emailConfirmed?: boolean;
}

export interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isInitialized: boolean;
  isLoading: boolean;
  isAuthenticated: () => boolean;
  initializeAuth: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearSession: () => void;
  error: ApiError | null;
  clearError: () => void;
}
