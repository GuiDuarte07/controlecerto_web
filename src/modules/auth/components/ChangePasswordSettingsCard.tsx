"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from "../schemas/auth.schemas";
import { userService } from "../services/userService";

export function ChangePasswordSettingsCard() {
  const t = useTranslations("settings.security");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ChangePasswordFormData>({
    // @ts-ignore - Temporary Zod v4 resolver typing mismatch
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      await userService.changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      form.reset();
      toast.success(t("changePassword.success"));
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : t("changePassword.error");
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-sm font-medium">{t("changePassword.menuTitle")}</p>
        <p className="text-xs text-muted-foreground">
          {t("changePassword.menuDescription")}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-4">
          <FormField
            control={form.control}
            name="oldPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("changePassword.oldPassword")}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={t("changePassword.oldPasswordPlaceholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("changePassword.newPassword")}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={t("changePassword.newPasswordPlaceholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmNewPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("changePassword.confirmNewPassword")}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={t("changePassword.confirmNewPasswordPlaceholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? t("changePassword.submitting")
              : t("changePassword.submit")}
          </Button>
        </form>
      </Form>
    </div>
  );
}
