"use client";

import { useEffect } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";
import { SearchableItemSelect } from "@/shared/components/SearchableItemSelect";
import { CurrencyInput } from "@/modules/transactions/components/forms/CurrencyInput";
import { DatePickerInput } from "@/modules/transactions/components/forms/DatePickerInput";
import { useAccountsStore } from "@/modules/accounts/context/accountsContext";
import { toAccountSearchableItem } from "@/modules/accounts";
import {
  depositWithdrawSchema,
  type DepositWithdrawFormData,
} from "../schemas/investments.schemas";

interface DepositWithdrawDialogProps {
  open: boolean;
  mode: "deposit" | "withdraw";
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: DepositWithdrawFormData) => Promise<void>;
}

export function DepositWithdrawDialog({
  open,
  mode,
  isSubmitting,
  onClose,
  onSubmit,
}: DepositWithdrawDialogProps) {
  const t = useTranslations("investments");
  const accounts = useAccountsStore((s) => s.accounts);

  const accountOptions = useMemo(
    () => accounts.map(toAccountSearchableItem),
    [accounts],
  );

  const form = (useForm<DepositWithdrawFormData>({
    // @ts-ignore - Temporary Zod v4 resolver typing mismatch
    resolver: zodResolver(depositWithdrawSchema),
    defaultValues: {
      amount: undefined,
      accountId: undefined,
      occurredAt: new Date(),
      note: "",
    },
  }) as unknown) as UseFormReturn<DepositWithdrawFormData>;

  useEffect(() => {
    if (open) {
      form.reset({
        amount: undefined,
        accountId: undefined,
        occurredAt: new Date(),
        note: "",
      });
    }
  }, [open, form]);

  const resolveError = (message?: string) => {
    if (!message) return "";
    try {
      return t(message as Parameters<typeof t>[0]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_e) {
      return message;
    }
  };

  const title = mode === "deposit" ? t("deposit.title") : t("withdraw.title");
  const accountLabel = mode === "deposit" ? t("deposit.accountLabel") : t("withdraw.accountLabel");

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.amount")}</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage>{resolveError(form.formState.errors.amount?.message)}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{accountLabel}</FormLabel>
                  <FormControl>
                    <SearchableItemSelect
                      items={accountOptions}
                      value={field.value ?? null}
                      onChange={(val) => field.onChange(val ? Number(val) : undefined)}
                      placeholder={t("fields.accountPlaceholder")}
                      searchPlaceholder={t("fields.accountSearchPlaceholder")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="occurredAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.date")}</FormLabel>
                  <FormControl>
                    <DatePickerInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="dd/mm/yyyy"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.note")}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={t("fields.notePlaceholder")}
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage>{resolveError(form.formState.errors.note?.message)}</FormMessage>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                {t("actions.cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("actions.saving") : t("actions.confirm")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
