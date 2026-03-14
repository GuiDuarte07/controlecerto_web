"use client";

import { useEffect, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  createNoteContextSchema,
  type CreateNoteContextFormData,
} from "../schemas/notes.schemas";
import type { CreateNotePayload } from "../types/notes.types";

interface NotesCreateDialogProps {
  open: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (payload: CreateNotePayload) => Promise<void>;
}

function getDefaultFormValues() {
  const now = new Date();

  return {
    contextType: "general" as const,
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
}

export function NotesCreateDialog({
  open,
  isSubmitting,
  onOpenChange,
  onCreate,
}: NotesCreateDialogProps) {
  const t = useTranslations("notes");
  const locale = useLocale();

  const form = (useForm<CreateNoteContextFormData>({
    // @ts-ignore - Temporary Zod v4 resolver typing mismatch
    resolver: zodResolver(createNoteContextSchema),
    defaultValues: getDefaultFormValues(),
  }) as unknown) as UseFormReturn<CreateNoteContextFormData>;

  const contextType = useWatch({
    control: form.control,
    name: "contextType",
  });

  useEffect(() => {
    if (!open) return;

    form.reset(getDefaultFormValues());
  }, [form, open]);

  const now = useMemo(() => new Date(), []);

  const yearOptions = useMemo(() => {
    const currentYear = now.getFullYear();
    return Array.from({ length: 11 }, (_, index) => currentYear - 5 + index);
  }, [now]);

  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      const label = new Intl.DateTimeFormat(locale, { month: "long" }).format(
        new Date(2000, index, 1),
      );

      return {
        value: month,
        label,
      };
    });
  }, [locale]);

  const resolveFormMessage = (message?: string) => {
    if (!message) return "";
    return t.has(message) ? t(message as never) : message;
  };

  const onSubmit = form.handleSubmit(async (data) => {
    const payload: CreateNotePayload =
      data.contextType === "general"
        ? {
            contextType: "general",
            title: t("defaults.generalTitle"),
            content: "",
          }
        : {
            contextType: "period",
            title: t("defaults.periodTitle", {
              month: String(data.month ?? 1).padStart(2, "0"),
              year: data.year ?? new Date().getFullYear(),
            }),
            content: "",
            year: data.year ?? new Date().getFullYear(),
            month: data.month ?? 1,
          };

    await onCreate(payload);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("createDialog.title")}</DialogTitle>
          <DialogDescription>{t("createDialog.description")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="contextType"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("createDialog.contextLabel")}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={(value) =>
                        field.onChange(value as "general" | "period")
                      }
                      className="grid gap-3"
                    >
                      <label className="flex cursor-pointer items-center gap-2 rounded-md border p-3">
                        <RadioGroupItem value="general" />
                        <span className="text-sm">{t("createDialog.generalOption")}</span>
                      </label>
                      <label className="flex cursor-pointer items-center gap-2 rounded-md border p-3">
                        <RadioGroupItem value="period" />
                        <span className="text-sm">{t("createDialog.periodOption")}</span>
                      </label>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage>
                    {resolveFormMessage(fieldState.error?.message)}
                  </FormMessage>
                </FormItem>
              )}
            />

            {contextType === "period" && (
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="month"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>{t("search.monthLabel")}</FormLabel>
                      <Select
                        value={String(field.value ?? "")}
                        onValueChange={(value) => field.onChange(Number(value))}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={t("search.monthPlaceholder")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {monthOptions.map((item) => (
                            <SelectItem key={item.value} value={String(item.value)}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage>
                        {resolveFormMessage(fieldState.error?.message)}
                      </FormMessage>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="year"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>{t("search.yearLabel")}</FormLabel>
                      <Select
                        value={String(field.value ?? "")}
                        onValueChange={(value) => field.onChange(Number(value))}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={t("search.yearPlaceholder")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {yearOptions.map((item) => (
                            <SelectItem key={item} value={String(item)}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage>
                        {resolveFormMessage(fieldState.error?.message)}
                      </FormMessage>
                    </FormItem>
                  )}
                />
              </div>
            )}

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
                {isSubmitting ? t("actions.creating") : t("actions.create")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
