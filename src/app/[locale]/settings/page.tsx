"use client";

import { useTranslations } from "next-intl";
import { AppLayout } from "@/shared/components/layout";
import { usePageHeader } from "@/shared/hooks/use-page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { ProfileSettingsCard } from "@/modules/auth/components/ProfileSettingsCard";

export default function SettingsPage() {
  const t = useTranslations("settings");

  usePageHeader({
    title: t("title"),
    description: t("description"),
  });

  return (
    <AppLayout>
      <div className="px-4 sm:px-6 py-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("profile.title")}</CardTitle>
              <CardDescription>{t("profile.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileSettingsCard />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
