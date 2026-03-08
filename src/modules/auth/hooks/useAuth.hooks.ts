"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useAuthStore } from "../context/authContext";
import { hasStoredAuthSession } from "../utils/storage";

/**
 * Hook para proteger rotas que requerem autenticação
 * Redireciona para login se usuário não estiver autenticado
 */
export function useProtectedRoute() {
  const router = useRouter();
  const locale = useLocale();
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const clearSession = useAuthStore((state) => state.clearSession);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    if (!isInitialized) {
      initializeAuth();
    }
  }, [initializeAuth, isInitialized]);

  useEffect(() => {
    if (!isInitialized || isLoading) return;

    const hasPersistedSession = hasStoredAuthSession();
    if (!hasPersistedSession && isAuthenticated) {
      clearSession();
    }

    if (!hasPersistedSession || !isAuthenticated) {
      router.replace(`/${locale}/auth/login`);
    }
  }, [clearSession, isAuthenticated, isInitialized, isLoading, locale, router]);

  return {
    isProtected: isAuthenticated,
    isLoading: isLoading || !isInitialized,
  };
}

/**
 * Hook para redirecionar usuários autenticados para dashboard
 * Útil em páginas de login/register
 */
export function useRedirectIfAuthenticated(redirectTo?: string) {
  const router = useRouter();
  const locale = useLocale();
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const clearSession = useAuthStore((state) => state.clearSession);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    if (!isInitialized) {
      initializeAuth();
    }
  }, [initializeAuth, isInitialized]);

  useEffect(() => {
    if (!isInitialized || isLoading) return;

    const hasPersistedSession = hasStoredAuthSession();
    if (!hasPersistedSession) {
      if (isAuthenticated) {
        clearSession();
      }
      return;
    }

    if (isAuthenticated) {
      router.replace(redirectTo || `/${locale}`);
    }
  }, [
    clearSession,
    isAuthenticated,
    isInitialized,
    isLoading,
    locale,
    redirectTo,
    router,
  ]);

  return { isLoading: isLoading || !isInitialized };
}
