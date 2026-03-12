"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { useAuthStore } from "../context/authContext";
import { Spinner } from "@/shared/components/ui/spinner";
import { loginSchema, type LoginFormData } from "../schemas/auth.schemas";

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const t = useTranslations("auth.login");
  const locale = useLocale();
  const { login, isLoading, error } = useAuthStore();
  const apiErrorDetails =
    error?.errors
      ? Object.entries(error.errors)
          .flatMap(([field, messages]) =>
            (messages || []).map((message) => `${field}: ${message}`)
          )
          .filter(Boolean)
      : [];
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<LoginFormData>({
    // @ts-expect-error - Zod v4 incompatibility with @hookform/resolvers
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const rememberMe = watch("rememberMe");

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      onSuccess?.();
    } catch {
      // Error is handled by store
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("subtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <p className="font-medium">{error.message}</p>
              {apiErrorDetails.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs">
                  {apiErrorDetails.map((detail) => (
                    <li key={detail}>- {detail}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("emailPlaceholder")}
              {...register("email")}
              disabled={isLoading}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-xs text-destructive">
                {t(errors.email.message as any)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t("passwordPlaceholder")}
              {...register("password")}
              disabled={isLoading}
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p className="text-xs text-destructive">
                {t(errors.password.message as any)}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) =>
                  setValue("rememberMe", checked as boolean)
                }
              />
              <Label htmlFor="remember" className="text-sm font-normal">
                {t("rememberMe")}
              </Label>
            </div>
            <Link href={`/${locale}/auth/forgot-password`} className="text-sm text-primary hover:underline">
              {t("forgotPassword")}
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner className="mr-2" />
                {t("signInLoading")}
              </>
            ) : (
              t("signIn")
            )}
          </Button>

          <div className="text-center text-sm">
            {t("noAccount")}{" "}
            <Link href={`/${locale}/auth/register`} className="text-primary hover:underline">
              {t("signUp")}
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
