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
import { registerSchema, type RegisterFormData } from "../schemas/auth.schemas";

interface RegisterFormProps {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const t = useTranslations("auth.register");
  const locale = useLocale();
  const { register: registerUser, isLoading, error } = useAuthStore();
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
  } = useForm<RegisterFormData>({
    // @ts-expect-error - Zod v4 incompatibility with @hookform/resolvers
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const acceptTerms = watch("acceptTerms");

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data.name, data.email, data.password);
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
            <Label htmlFor="name">{t("name")}</Label>
            <Input
              id="name"
              type="text"
              placeholder={t("namePlaceholder")}
              {...register("name")}
              disabled={isLoading}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-xs text-destructive">
                {t(errors.name.message as any)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-email">{t("email")}</Label>
            <Input
              id="reg-email"
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

          <div className="space-y-2">
            <Label htmlFor="confirm-password">{t("confirmPassword")}</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder={t("confirmPasswordPlaceholder")}
              {...register("confirmPassword")}
              disabled={isLoading}
              aria-invalid={!!errors.confirmPassword}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">
                {t(errors.confirmPassword.message as any)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked) =>
                  setValue("acceptTerms", checked as boolean)
                }
              />
              <Label htmlFor="terms" className="text-xs font-normal leading-snug">
                {t("terms")}{" "}
                <Link href="#" className="text-primary hover:underline">
                  {t("termsLink")}
                </Link>{" "}
                {t("and")}{" "}
                <Link href="#" className="text-primary hover:underline">
                  {t("privacyLink")}
                </Link>
              </Label>
            </div>
            {errors.acceptTerms && (
              <p className="text-xs text-destructive">
                {t(errors.acceptTerms.message as any)}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner className="mr-2" />
                {t("signUpLoading")}
              </>
            ) : (
              t("signUp")
            )}
          </Button>

          <div className="text-center text-sm">
            {t("haveAccount")}{" "}
            <Link href={`/${locale}/auth/login`} className="text-primary hover:underline">
              {t("signIn")}
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
