"use client";

import { useTranslations } from "next-intl";
import { AppLayout } from "@/shared/components/layout";
import { usePageHeader } from "@/shared/hooks/use-page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { ProfileSettingsCard } from "@/modules/auth/components/ProfileSettingsCard";
import { ChangePasswordSettingsCard } from "@/modules/auth/components/ChangePasswordSettingsCard";

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

          <Card>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="security" className="border-b-0">
                <AccordionTrigger className="px-6 py-5 hover:no-underline">
                  <div className="flex flex-col text-left">
                    <span className="text-base font-semibold">
                      {t("security.title")}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {t("security.description")}
                    </span>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-6 pb-6">
                  <ChangePasswordSettingsCard />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
