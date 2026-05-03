"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { AppLayout } from "@/shared/components/layout";
import { usePageHeader } from "@/shared/hooks/use-page-header";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { useAuthStore } from "@/modules/auth";
import { userService } from "@/modules/auth/services/userService";
import { ProfileSettingsCard } from "@/modules/auth/components/ProfileSettingsCard";
import { ChangePasswordSettingsCard } from "@/modules/auth/components/ChangePasswordSettingsCard";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const updateUser = useAuthStore((s) => s.updateUser);
  const isAdmin = !!user && (user.isAdmin || user.userType === "ADMIN" || user.userType === 1);
  const hasSyncedUserRef = useRef(false);

  useEffect(() => {
    if (!accessToken || hasSyncedUserRef.current) return;

    hasSyncedUserRef.current = true;

    void userService
      .getDetails()
      .then((details) => {
        updateUser(details);
      })
      .catch(() => {
        // Keep cached session if refresh fails; auth interceptor handles 401 cases.
      });
  }, [accessToken, updateUser]);

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
              <CardTitle className="flex items-center gap-2">
                <span>{t("profile.title")}</span>
                {isAdmin ? <Badge variant="secondary">{t("profile.adminTag")}</Badge> : null}
              </CardTitle>
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
