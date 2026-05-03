"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { AppLayout } from "@/shared/components/layout";
import { AdminTicketDetailPageContent } from "@/modules/tickets";
import { useAuthStore } from "@/modules/auth";

export default function AdminTicketDetailPage() {
  const router = useRouter();
  const locale = useLocale();
  const params = useParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const isAdmin = !!user && (user.isAdmin || user.userType === "ADMIN" || user.userType === 1);
  const ticketId = Number(params.id);

  useEffect(() => {
    if (!user) return;
    if (!isAdmin) {
      router.replace(`/${locale}/dashboard`);
    }
  }, [isAdmin, locale, router, user]);

  if (!isAdmin) return null;

  return (
    <AppLayout>
      <AdminTicketDetailPageContent ticketId={ticketId} />
    </AppLayout>
  );
}

