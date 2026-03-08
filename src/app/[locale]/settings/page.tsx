"use client";

import { useTranslations } from "next-intl";
import { AppLayout } from "@/shared/components/layout";
import { usePageHeader } from "@/shared/hooks/use-page-header";
import { Card, CardContent } from "@/shared/components/ui/card";

export default function SettingsPage() {
  const t = useTranslations("settings");

  usePageHeader({
    title: t("title"),
    description: t("description"),
  });

  return (
    <AppLayout>
      <div className="px-4 sm:px-6 py-6">
        <Card>
          <CardContent className="pt-6">
            <h2 className="mb-4 text-xl font-semibold">Conteúdo em Desenvolvimento</h2>
            <p className="text-muted-foreground">
              Em breve você poderá configurar suas preferências.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
