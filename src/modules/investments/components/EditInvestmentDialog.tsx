"use client";

import { useEffect } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
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
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";
import { DatePickerInput } from "@/modules/transactions/components/forms/DatePickerInput";
import {
  editInvestmentSchema,
  type EditInvestmentFormData,
} from "../schemas/investments.schemas";
import type { Investment } from "../types/investments.types";

interface EditInvestmentDialogProps {
  open: boolean;
  investment: Investment;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: EditInvestmentFormData) => Promise<void>;
}

export function EditInvestmentDialog({
  open,
  investment,
  isSubmitting,
  onClose,
  onSubmit,
}: EditInvestmentDialogProps) {
  const t = useTranslations("investments");

  const form = (useForm<EditInvestmentFormData>({
    // @ts-ignore - Temporary Zod v4 resolver typing mismatch
    resolver: zodResolver(editInvestmentSchema),
    defaultValues: {
      name: investment.name,
      startDate: new Date(investment.startDate),
      description: investment.description ?? "",
    },
  }) as unknown) as UseFormReturn<EditInvestmentFormData>;

  useEffect(() => {
    if (open) {
      form.reset({
        name: investment.name,
        startDate: new Date(investment.startDate),
        description: investment.description ?? "",
      });
    }
  }, [open, investment.id, form]); // eslint-disable-line react-hooks/exhaustive-deps

  const resolveError = (message?: string) => {
    if (!message) return "";
    try {
      return t(message as Parameters<typeof t>[0]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_e) {
      return message;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("edit.title")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.name")}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t("fields.namePlaceholder")} />
                  </FormControl>
                  <FormMessage>{resolveError(form.formState.errors.name?.message)}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.startDate")}</FormLabel>
                  <FormControl>
                    <DatePickerInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="dd/mm/yyyy"
                    />
                  </FormControl>
                  <FormMessage>{resolveError(form.formState.errors.startDate?.message)}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.description")}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={t("fields.descriptionPlaceholder")}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage>{resolveError(form.formState.errors.description?.message)}</FormMessage>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                {t("actions.cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("actions.saving") : t("actions.save")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
