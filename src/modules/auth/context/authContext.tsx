import { ApiError, toApiError } from "@/shared/lib/api-client";
import { create } from "zustand";
import type { AuthUser } from "../types/auth.types";
import { authService } from "../services/authService";
import {
  clearStoredAuthSession,
  persistStoredAuthSession,
  readStoredAuthSession,
} from "../utils/storage";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: ApiError | null;
}

interface AuthActions {
  initializeAuth: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearSession: () => void;
  clearError: () => void;
  isAuthenticated: () => boolean;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  user: null,
  accessToken: null,
  refreshToken: null,
  isInitialized: false,
  isLoading: false,
  error: null,

  // Actions
  clearError: () => set({ error: null }),

  clearSession: () => {
    clearStoredAuthSession();
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isInitialized: true,
      isLoading: false,
      error: null,
    });
  },

  initializeAuth: () => {
    const storedSession = readStoredAuthSession();

    if (!storedSession?.accessToken) {
      clearStoredAuthSession();
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isInitialized: true,
      });
      return;
    }

    set({
      user: storedSession.user ?? null,
      accessToken: storedSession.accessToken,
      refreshToken: storedSession.refreshToken,
      isInitialized: true,
    });
  },

  isAuthenticated: () => {
    const state = get();
    return !!state.accessToken;
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authService.login({ email, password });

      set({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        isInitialized: true,
        isLoading: false,
      });

      persistStoredAuthSession({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
    } catch (err) {
      const error = toApiError(err, "Login failed");
      set({ error, isLoading: false });
      throw error;
    }
  },

  register: async (name: string, email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authService.register({
        name,
        email,
        password,
      });

      set({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        isInitialized: true,
        isLoading: false,
      });

      persistStoredAuthSession({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
    } catch (err) {
      const error = toApiError(err, "Registration failed");
      set({ error, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });

    try {
      const state = get();
      const storedSession = readStoredAuthSession();
      const refreshToken = storedSession?.refreshToken ?? state.refreshToken;
      const accessToken = storedSession?.accessToken ?? state.accessToken;

      if (refreshToken) {
        await authService.logout(refreshToken, accessToken ?? undefined);
      }

      clearStoredAuthSession();
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isInitialized: true,
        isLoading: false,
      });
    } catch (err) {
      const error = toApiError(err, "Logout failed");
      set({ error, isLoading: false });
      throw error;
    }
  },
}));
