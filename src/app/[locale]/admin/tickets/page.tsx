"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/shared/components/layout";
import { AdminTicketsPageContent } from "@/modules/tickets";
import { useAuthStore } from "@/modules/auth";

export default function AdminTicketsPage() {
  const router = useRouter();
  const locale = useLocale();
  const user = useAuthStore((s) => s.user);
  const isAdmin = !!user && (user.isAdmin || user.userType === "ADMIN" || user.userType === 1);

  useEffect(() => {
    if (!user) return;
    if (!isAdmin) {
      router.replace(`/${locale}/dashboard`);
    }
  }, [isAdmin, locale, router, user]);

  if (!isAdmin) return null;

  return (
    <AppLayout>
      <AdminTicketsPageContent />
    </AppLayout>
  );
}

