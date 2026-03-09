"use client";

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
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Switch } from "@/shared/components/ui/switch";
import { Label } from "@/shared/components/ui/label";
import { SearchableItemSelect } from "@/shared/components/SearchableItemSelect";
import { useAccountsStore } from "@/modules/accounts/context/accountsContext";
import { toAccountSearchableItem } from "@/modules/accounts";
import { CurrencyInput } from "@/modules/transactions/components/forms/CurrencyInput";
import { DatePickerInput } from "@/modules/transactions/components/forms/DatePickerInput";
import {
  invoicePaymentFormSchema,
  type InvoicePaymentFormData,
} from "../schemas/invoicePayment.schemas";

interface InvoicePaymentDialogProps {
  open: boolean;
  remainingAmount: number;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: InvoicePaymentFormData) => Promise<void>;
}

export function InvoicePaymentDialog({
  open,
  remainingAmount,
  isSubmitting,
  onClose,
  onSubmit,
}: InvoicePaymentDialogProps) {
  const t = useTranslations("invoices");
  const accounts = useAccountsStore((s) => s.accounts);

  const accountOptions = useMemo(
    () => accounts.map(toAccountSearchableItem),
    [accounts],
  );

  const resolveErrorMessage = (message?: string) => {
    if (!message) return "";
    try {
      return t(message as Parameters<typeof t>[0]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_e) {
      return message;
    }
  };

  const form = (useForm<InvoicePaymentFormData>({
    // @ts-expect-error — Zod v4 + RHF resolver type mismatch
    resolver: zodResolver(invoicePaymentFormSchema),
    defaultValues: {
      accountId: undefined,
      amountPaid: remainingAmount > 0 ? remainingAmount : undefined,
      description: "",
      paymentDate: new Date(),
      justForRecord: false,
    },
  }) as unknown) as UseFormReturn<InvoicePaymentFormData>;

  const { formState: { errors }, watch, setValue } = form;
  const justForRecord = watch("justForRecord");

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data);
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("payment.title")}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
            <FormField
              control={form.control}
              name="accountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("payment.account")}</FormLabel>
                  <FormControl>
                    <SearchableItemSelect
                      items={accountOptions}
                      value={field.value ?? null}
                      onChange={(v) => field.onChange(v ? Number(v) : undefined)}
                      placeholder={t("payment.account")}
                    />
                  </FormControl>
                  <FormMessage>
                    {errors.accountId && resolveErrorMessage(errors.accountId.message)}
                  </FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amountPaid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("payment.amount")}</FormLabel>
                  <FormControl>
                    <CurrencyInput value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage>
                    {errors.amountPaid && resolveErrorMessage(errors.amountPaid.message)}
                  </FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("payment.description")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      maxLength={100}
                      placeholder={t("payment.description")}
                    />
                  </FormControl>
                  <FormMessage>
                    {errors.description && resolveErrorMessage(errors.description.message)}
                  </FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("payment.paymentDate")}</FormLabel>
                  <FormControl>
                    <DatePickerInput value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage>
                    {errors.paymentDate && resolveErrorMessage(errors.paymentDate.message)}
                  </FormMessage>
                </FormItem>
              )}
            />

            <div className="flex items-center gap-3 rounded-md border p-3">
              <Switch
                id="justForRecord"
                checked={justForRecord}
                onCheckedChange={(v) => setValue("justForRecord", v)}
              />
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="justForRecord" className="text-sm font-medium">
                  {t("payment.justForRecord")}
                </Label>
                <span className="text-xs text-muted-foreground">
                  {t("payment.justForRecordHint")}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                {t("actions.cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? t("payment.saving") : t("payment.save")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
