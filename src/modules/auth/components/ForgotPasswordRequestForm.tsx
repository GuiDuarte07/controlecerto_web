"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import {
  forgotPasswordRequestSchema,
  type ForgotPasswordRequestFormData,
} from "../schemas/auth.schemas";
import { userService } from "../services/userService";

export function ForgotPasswordRequestForm() {
  const t = useTranslations("auth.forgotPasswordRequest");
  const locale = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<ForgotPasswordRequestFormData>({
    // @ts-ignore - Temporary Zod v4 resolver typing mismatch
    resolver: zodResolver(forgotPasswordRequestSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await userService.requestForgotPassword({ email: data.email });
      setIsSubmitted(true);
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

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("successTitle")}</CardTitle>
          <CardDescription>{t("successDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full" asChild>
            <Link href={`/${locale}/auth/login`}>{t("backToLogin")}</Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              form.reset();
              setIsSubmitted(false);
            }}
          >
            {t("sendAgain")}
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("email")}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t("emailPlaceholder")}
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

            <div className="text-center text-sm">
              <Link href={`/${locale}/auth/login`} className="text-primary hover:underline">
                {t("backToLogin")}
              </Link>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
