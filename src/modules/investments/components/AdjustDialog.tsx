"use client";

import { useEffect, useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { CurrencyInput } from "@/modules/transactions/components/forms/CurrencyInput";
import { DatePickerInput } from "@/modules/transactions/components/forms/DatePickerInput";
import {
  adjustSchema,
  type AdjustFormData,
} from "../schemas/investments.schemas";

interface AdjustDialogProps {
  open: boolean;
  currentValue: number;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: AdjustFormData) => Promise<void>;
}

export function AdjustDialog({
  open,
  currentValue,
  isSubmitting,
  onClose,
  onSubmit,
}: AdjustDialogProps) {
  const t = useTranslations("investments");
  const locale = useLocale();
  const [confirmData, setConfirmData] = useState<AdjustFormData | null>(null);

  const currencyFormatter = new Intl.NumberFormat(locale === "pt" ? "pt-BR" : "en-US", {
    style: "currency",
    currency: "BRL",
  });

  const form = (useForm<AdjustFormData>({
    // @ts-ignore - Temporary Zod v4 resolver typing mismatch
    resolver: zodResolver(adjustSchema),
    defaultValues: {
      newTotalValue: undefined,
      occurredAt: new Date(),
      note: "",
    },
  }) as unknown) as UseFormReturn<AdjustFormData>;

  useEffect(() => {
    if (open) {
      form.reset({ newTotalValue: undefined, occurredAt: new Date(), note: "" });
      setConfirmData(null);
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

  const handleSubmit = (data: AdjustFormData) => {
    if (data.newTotalValue < currentValue) {
      setConfirmData(data);
      return;
    }
    void onSubmit(data);
  };

  const reduction = confirmData ? currentValue - confirmData.newTotalValue : 0;

  return (
    <>
      <Dialog open={open && !confirmData} onOpenChange={(o) => { if (!o) onClose(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("adjust.title")}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="newTotalValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.newTotalValue")}</FormLabel>
                    <FormControl>
                      <CurrencyInput
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage>{resolveError(form.formState.errors.newTotalValue?.message)}</FormMessage>
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

      <AlertDialog open={!!confirmData} onOpenChange={(o) => { if (!o) setConfirmData(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("adjust.reduceTitle")}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <p>
                  {t("adjust.reduceDescription", {
                    newValue: currencyFormatter.format(confirmData?.newTotalValue ?? 0),
                    currentValue: currencyFormatter.format(currentValue),
                    reduction: currencyFormatter.format(reduction),
                  })}
                </p>
                <p>{t("adjust.reduceSuggestion")}</p>
                <p className="font-medium text-foreground">{t("adjust.reduceConfirmQuestion")}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmData(null)}>
              {t("actions.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmData) {
                  void onSubmit(confirmData);
                  setConfirmData(null);
                }
              }}
            >
              {t("adjust.confirmReduceButton")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
