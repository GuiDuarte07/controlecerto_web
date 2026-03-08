"use client";

import { useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ApiError } from "@/shared/lib/api-client";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Spinner } from "@/shared/components/ui/spinner";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  accountFormSchema,
  type AccountFormData,
} from "../schemas/accounts.schemas";
import type { Account } from "../types/accounts.types";

type AccountDialogMode = "create" | "edit";

interface AccountDialogProps {
  open: boolean;
  mode: AccountDialogMode;
  account: Account | null;
  isSubmitting: boolean;
  error: ApiError | null;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: AccountFormData) => Promise<void>;
  onUpdate: (id: number, data: AccountFormData) => Promise<void>;
}

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

function resolveDialogValues(account: Account | null): AccountFormData {
  return {
    balance: account?.balance ?? 0,
    bank: account?.bank ?? "",
    description: account?.description ?? "",
    color: account?.color ?? "#2563EB",
  };
}

export function AccountDialog({
  open,
  mode,
  account,
  isSubmitting,
  error,
  onOpenChange,
  onCreate,
  onUpdate,
}: AccountDialogProps) {
  const t = useTranslations("accounts");
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AccountFormData>({
    // @ts-expect-error - Zod v4 incompatibility with @hookform/resolvers
    resolver: zodResolver(accountFormSchema),
    defaultValues: resolveDialogValues(account),
  });

  useEffect(() => {
    if (open) {
      reset(resolveDialogValues(account));
    }
  }, [account, open, reset]);

  const colorValue = watch("color") ?? "#2563EB";
  const descriptionValue = watch("description") ?? "";

  const pickerColorValue = useMemo(() => {
    if (HEX_COLOR_REGEX.test(colorValue)) {
      return colorValue;
    }

    return "#2563EB";
  }, [colorValue]);

  const resolveMessage = (message?: string) => {
    if (!message) {
      return "";
    }

    if (t.has(message)) {
      return t(message as never);
    }

    return message;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit"
              ? t("dialog.editTitle")
              : t("dialog.createTitle")}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? t("dialog.editDescription")
              : t("dialog.createDescription")}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(async (data) => {
            if (mode === "edit" && account) {
              await onUpdate(account.id, data as unknown as AccountFormData);
              return;
            }

            await onCreate(data as unknown as AccountFormData);
          })}
          className="space-y-4"
        >
          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {resolveMessage(error.message)}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="account-balance">{t("dialog.balance")}</Label>
              <Input
                id="account-balance"
                type="number"
                step="0.01"
                min="0"
                disabled={isSubmitting}
                {...register("balance", { valueAsNumber: true })}
              />
              {errors.balance && (
                <p className="text-xs text-destructive">
                  {resolveMessage(errors.balance.message)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="account-bank">{t("dialog.bank")}</Label>
              <Input
                id="account-bank"
                placeholder={t("dialog.bankPlaceholder")}
                disabled={isSubmitting}
                {...register("bank")}
              />
              {errors.bank && (
                <p className="text-xs text-destructive">
                  {resolveMessage(errors.bank.message)}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="account-description">{t("dialog.description")}</Label>
              <span className="text-xs text-muted-foreground">
                {descriptionValue.length}/100
              </span>
            </div>
            <Textarea
              id="account-description"
              placeholder={t("dialog.descriptionPlaceholder")}
              disabled={isSubmitting}
              maxLength={100}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-destructive">
                {resolveMessage(errors.description.message)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-color">{t("dialog.color")}</Label>
            <div className="flex items-center gap-3">
              <input
                id="account-color-picker"
                type="color"
                value={pickerColorValue}
                disabled={isSubmitting}
                onChange={(event) => {
                  setValue("color", event.target.value.toUpperCase(), {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
                className="h-10 w-12 cursor-pointer rounded-md border border-input bg-background p-1"
                aria-label={t("dialog.color")}
              />
              <Input
                id="account-color"
                placeholder="#A1D2F4"
                className="uppercase"
                disabled={isSubmitting}
                maxLength={7}
                {...register("color")}
              />
            </div>
            <p className="text-xs text-muted-foreground">{t("dialog.colorHint")}</p>
            {errors.color && (
              <p className="text-xs text-destructive">
                {resolveMessage(errors.color.message)}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              {t("actions.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2" />
                  {t("actions.saving")}
                </>
              ) : (
                t("actions.save")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
