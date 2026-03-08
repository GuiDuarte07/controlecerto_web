"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/shared/components/ui/button";
import { useAuthStore } from "../context/authContext";
import { Spinner } from "@/shared/components/ui/spinner";

export function LogoutButton() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("auth.logout");
  const { logout, isLoading } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
      router.push(`/${locale}/auth/login`);
    } catch {
      // Error is handled by store
    }
  };

  return (
    <Button onClick={handleLogout} disabled={isLoading} variant="outline">
      {isLoading ? (
        <>
          <Spinner className="mr-2" />
          {t("loading")}
        </>
      ) : (
        t("button")
      )}
    </Button>
  );
}
