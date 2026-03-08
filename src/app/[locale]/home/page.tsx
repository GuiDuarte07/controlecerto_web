"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Spinner } from "@/shared/components/ui/spinner";
import { useAuthStore } from "@/modules/auth/context/authContext";
import { hasStoredAuthSession } from "@/modules/auth/utils/storage";

export default function HomePage() {
  const router = useRouter();
  const locale = useLocale();
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    if (!isInitialized) {
      initializeAuth();
    }
  }, [initializeAuth, isInitialized]);

  useEffect(() => {
    if (!isInitialized || isLoading) return;

    const hasSession = hasStoredAuthSession();

    if (hasSession) {
      router.replace(`/${locale}/dashboard`);
    } else {
      router.replace(`/${locale}/auth/login`);
    }
  }, [isInitialized, isLoading, locale, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
}
