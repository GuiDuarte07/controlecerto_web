"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Spinner } from "@/shared/components/ui/spinner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "../schemas/auth.schemas";
import { userService } from "../services/userService";

type ResetPasswordStatus = "checking" | "valid" | "invalid" | "success";

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const t = useTranslations("auth.resetPassword");
  const locale = useLocale();
  const [status, setStatus] = useState<ResetPasswordStatus>("checking");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<ResetPasswordFormData>({
    // @ts-expect-error - Zod v4 incompatibility with @hookform/resolvers
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    let cancelled = false;

    const verifyToken = async () => {
      setStatus("checking");
      try {
        await userService.verifyForgotPasswordToken(token);
        if (!cancelled) {
          setStatus("valid");
        }
      } catch {
        if (!cancelled) {
          setStatus("invalid");
        }
      }
    };

    void verifyToken();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const onSubmit = form.handleSubmit(async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await userService.resetForgotPassword(token, {
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      setStatus("success");
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : t("error");
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  });

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

  if (status === "invalid") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("invalidTitle")}</CardTitle>
          <CardDescription>{t("invalidDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button asChild className="w-full">
            <Link href={`/${locale}/auth/forgot-password`}>
              {t("requestNewToken")}
            </Link>
          </Button>
          <Button variant="ghost" className="w-full" asChild>
            <Link href={`/${locale}/auth/login`}>{t("backToLogin")}</Link>
          </Button>
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
          <Button asChild className="w-full">
            <Link href={`/${locale}/auth/login`}>{t("backToLogin")}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("subtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            {submitError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {submitError}
              </div>
            )}

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("password")}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t("passwordPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("confirmPassword")}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t("confirmPasswordPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? t("submitting") : t("submit")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
