"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { userService } from "../services/userService";

type ConfirmEmailStatus = "checking" | "success" | "error";

interface ConfirmEmailResultCardProps {
  token: string;
}

export function ConfirmEmailResultCard({
  token,
}: ConfirmEmailResultCardProps) {
  const t = useTranslations("auth.confirmEmail");
  const locale = useLocale();
  const [status, setStatus] = useState<ConfirmEmailStatus>("checking");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const confirmEmail = async () => {
      setStatus("checking");
      try {
        await userService.confirmEmail(token);
        if (!cancelled) {
          setStatus("success");
        }
      } catch {
        if (!cancelled) {
          setStatus("error");
        }
      }
    };

    void confirmEmail();

    return () => {
      cancelled = true;
    };
  }, [token, retryCount]);

  if (status === "checking") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("checkingTitle")}</CardTitle>
          <CardDescription>{t("checkingDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-4">
          <Spinner className="h-5 w-5" />
        </CardContent>
      </Card>
    );
  }

  if (status === "success") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("successTitle")}</CardTitle>
          <CardDescription>{t("successDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" asChild>
            <Link href={`/${locale}/auth/login`}>{t("goToLogin")}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t("errorTitle")}</CardTitle>
        <CardDescription>{t("errorDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          className="w-full"
          onClick={() => setRetryCount((current) => current + 1)}
        >
          {t("tryAgain")}
        </Button>
        <Button variant="ghost" className="w-full" asChild>
          <Link href={`/${locale}/auth/login`}>{t("goToLogin")}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
