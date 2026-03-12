"use client";

import type React from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Spinner } from "@/shared/components/ui/spinner";
import { useAuthStore } from "../context/authContext";
import { hasStoredAuthSession } from "../utils/storage";

interface AuthRouteGuardProps {
  children: React.ReactNode;
  locale: string;
}

function buildAuthPaths(locale: string) {
  return {
    loginPath: `/${locale}/auth/login`,
    registerPath: `/${locale}/auth/register`,
    forgotPasswordPath: `/${locale}/auth/forgot-password`,
    forgotPasswordTokenPrefix: `/${locale}/forgot-password/`,
    confirmEmailTokenPrefix: `/${locale}/confirm-email/`,
    homePath: `/${locale}/home`,
    rootPath: `/${locale}`,
  };
}

export function AuthRouteGuard({ children, locale }: AuthRouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const clearSession = useAuthStore((state) => state.clearSession);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  const {
    loginPath,
    registerPath,
    forgotPasswordPath,
    forgotPasswordTokenPrefix,
    confirmEmailTokenPrefix,
    homePath,
    rootPath,
  } =
    buildAuthPaths(locale);
  const isPublicRoute =
    pathname === loginPath ||
    pathname === registerPath ||
    pathname === forgotPasswordPath ||
    pathname.startsWith(forgotPasswordTokenPrefix) ||
    pathname.startsWith(confirmEmailTokenPrefix) ||
    pathname === homePath ||
    pathname === rootPath;

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

    if (!hasPersistedSession && !isPublicRoute) {
      router.replace(loginPath);
    }
  }, [
    clearSession,
    isAuthenticated,
    isInitialized,
    isLoading,
    isPublicRoute,
    loginPath,
    router,
  ]);

  if (!isPublicRoute && (!isInitialized || isLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!isPublicRoute && !hasStoredAuthSession()) {
    return null;
  }

  return <>{children}</>;
}