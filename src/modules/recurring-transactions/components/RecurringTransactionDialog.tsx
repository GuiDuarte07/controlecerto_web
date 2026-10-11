"use client";

import { useEffect, useMemo } from "react";
import { useForm, useWatch, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import { Switch } from "@/shared/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { SearchableItemSelect, type SearchableItem } from "@/shared/components/SearchableItemSelect";
import { useAccountsStore } from "@/modules/accounts/context/accountsContext";
import { toAccountSearchableItem } from "@/modules/accounts";
import { BillTypeEnum, type ParentCategory } from "@/modules/categories";
import { useCategoriesStore } from "@/modules/categories/context/categoriesContext";
import { CurrencyInput } from "@/modules/transactions/components/forms/CurrencyInput";
import { recurringTransactionFormSchema, type RecurringTransactionFormData } from "../schemas/recurring-transactions.schemas";
import type { RecurringTransaction } from "../types/recurring-transactions.types";

interface RecurringTransactionDialogProps {
  open: boolean;
  transaction: RecurringTransaction | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: RecurringTransactionFormData) => Promise<void>;
}

const DAYS = [0, 1, 2, 3, 4, 5, 6];
const MONTH_DAYS = Array.from({ length: 28 }, (_, index) => index + 1);
const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

function toDate(value?: string | null) {
  return value ? new Date(`${value.slice(0, 10)}T12:00:00`) : null;
}

function flattenCategories(parents: ParentCategory[], billType: BillTypeEnum): SearchableItem[] {
  return parents
    .filter((parent) => parent.billType === billType)
    .flatMap((parent) => [
      { id: parent.id, label: parent.name, color: parent.color, iconName: parent.icon },
      ...parent.subCategories.map((category) => ({ id: category.id, label: category.name, color: category.color, iconName: category.icon })),
    ]);
}

function getDefaultValues(transaction: RecurringTransaction | null): RecurringTransactionFormData {
  return {
    description: transaction?.description ?? "",
    amount: transaction?.amount ?? undefined as never,
    destination: transaction?.destination ?? "",
    justForRecord: transaction?.justForRecord ?? false,
    type: transaction?.type ?? "EXPENSE",
    startDate: toDate(transaction?.startDate) ?? new Date(),
    endDate: toDate(transaction?.endDate),
    accountId: transaction?.accountId ?? undefined as never,
    categoryId: transaction?.categoryId ?? undefined as never,
    isActive: transaction?.isActive ?? true,
    recurrenceRule: {
      frequency: transaction?.recurrenceRule.frequency ?? "MONTHLY",
      isEveryDay: transaction?.recurrenceRule.isEveryDay ?? true,
      daysOfWeek: transaction?.recurrenceRule.daysOfWeek ?? "",
      dayOfWeek: transaction?.recurrenceRule.dayOfWeek ?? 1,
      dayOfMonth: transaction?.recurrenceRule.dayOfMonth ?? 1,
      monthOfYear: transaction?.recurrenceRule.monthOfYear ?? 1,
      dayOfMonthForYearly: transaction?.recurrenceRule.dayOfMonthForYearly ?? 1,
      interval: transaction?.recurrenceRule.interval ?? 1,
    },
  };
}

export function RecurringTransactionDialog({ open, transaction, isSubmitting, onOpenChange, onSubmit }: RecurringTransactionDialogProps) {
  const t = useTranslations("recurringTransactions");
  const accounts = useAccountsStore((state) => state.accounts);
  const expenseCategories = useCategoriesStore((state) => state.expenseCategories);
  const incomeCategories = useCategoriesStore((state) => state.incomeCategories);

  const form = (useForm<RecurringTransactionFormData>({
    resolver: zodResolver(recurringTransactionFormSchema),
    defaultValues: getDefaultValues(transaction),
  }) as unknown) as UseFormReturn<RecurringTransactionFormData>;

  const type = useWatch({ control: form.control, name: "type" });
  const frequency = useWatch({ control: form.control, name: "recurrenceRule.frequency" });
  const isEveryDay = useWatch({ control: form.control, name: "recurrenceRule.isEveryDay" });
  const selectedDays = useWatch({ control: form.control, name: "recurrenceRule.daysOfWeek" }) ?? "";

  const accountOptions = useMemo(() => accounts.map(toAccountSearchableItem), [accounts]);
  const categoryOptions = useMemo(
    () => flattenCategories(type === "EXPENSE" ? expenseCategories : incomeCategories, type === "EXPENSE" ? BillTypeEnum.EXPENSE : BillTypeEnum.INCOME),
    [expenseCategories, incomeCategories, type],
  );

  useEffect(() => {
    if (open) form.reset(getDefaultValues(transaction));
  }, [form, open, transaction]);

  const resolveError = (message?: string) => (message && t.has(message) ? t(message as never) : message);

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data);
  });

  const toggleDay = (day: number, checked: boolean) => {
    const updatedDays = new Set(selectedDays.split("").filter(Boolean));
    if (checked) updatedDays.add(String(day));
    else updatedDays.delete(String(day));
    form.setValue("recurrenceRule.daysOfWeek", Array.from(updatedDays).sort().join(""), { shouldValidate: true });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] w-[95vw] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{transaction ? t("dialog.editTitle") : t("dialog.createTitle")}</DialogTitle>
          <DialogDescription>{transaction ? t("dialog.editDescription") : t("dialog.createDescription")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem><FormLabel>{t("fields.type")}</FormLabel><FormControl>
                  <ToggleGroup type="single" value={field.value} onValueChange={(value) => value && field.onChange(value)} className="justify-start">
                    <ToggleGroupItem value="EXPENSE" className="flex-1">{t("types.expense")}</ToggleGroupItem>
                    <ToggleGroupItem value="INCOME" className="flex-1">{t("types.income")}</ToggleGroupItem>
                  </ToggleGroup>
                </FormControl><FormMessage>{resolveError(form.formState.errors.type?.message)}</FormMessage></FormItem>
              )} />
              <FormField control={form.control} name="amount" render={({ field }) => (
                <FormItem><FormLabel>{t("fields.amount")}</FormLabel><FormControl><CurrencyInput value={field.value} onChange={field.onChange} /></FormControl><FormMessage>{resolveError(form.formState.errors.amount?.message)}</FormMessage></FormItem>
              )} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>{t("fields.description")}</FormLabel><FormControl><Input {...field} maxLength={200} placeholder={t("fields.descriptionPlaceholder")} /></FormControl><FormMessage>{resolveError(form.formState.errors.description?.message)}</FormMessage></FormItem>
              )} />
              <FormField control={form.control} name="destination" render={({ field }) => (
                <FormItem><FormLabel>{t("fields.destination")}</FormLabel><FormControl><Input {...field} maxLength={80} placeholder={t("fields.destinationPlaceholder")} /></FormControl><FormMessage>{resolveError(form.formState.errors.destination?.message)}</FormMessage></FormItem>
              )} />
              <FormField control={form.control} name="accountId" render={({ field }) => (
                <FormItem><FormLabel>{t("fields.account")}</FormLabel><FormControl><SearchableItemSelect items={accountOptions} value={field.value ?? null} onChange={(value) => field.onChange(value ? Number(value) : undefined)} placeholder={t("fields.accountPlaceholder")} /></FormControl><FormMessage>{resolveError(form.formState.errors.accountId?.message)}</FormMessage></FormItem>
              )} />
              <FormField control={form.control} name="categoryId" render={({ field }) => (
                <FormItem><FormLabel>{t("fields.category")}</FormLabel><FormControl><SearchableItemSelect items={categoryOptions} value={field.value ?? null} onChange={(value) => field.onChange(value ? Number(value) : undefined)} placeholder={t("fields.categoryPlaceholder")} /></FormControl><FormMessage>{resolveError(form.formState.errors.categoryId?.message)}</FormMessage></FormItem>
              )} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="startDate" render={({ field }) => (
                <FormItem><FormLabel>{t("fields.startDate")}</FormLabel><FormControl><Input type="date" value={format(field.value, "yyyy-MM-dd")} onChange={(event) => field.onChange(event.target.value ? new Date(`${event.target.value}T12:00:00`) : undefined)} /></FormControl><FormMessage>{resolveError(form.formState.errors.startDate?.message)}</FormMessage></FormItem>
              )} />
              <FormField control={form.control} name="endDate" render={({ field }) => (
                <FormItem><FormLabel>{t("fields.endDate")}</FormLabel><FormControl><Input type="date" value={field.value ? format(field.value, "yyyy-MM-dd") : ""} onChange={(event) => field.onChange(event.target.value ? new Date(`${event.target.value}T12:00:00`) : null)} /></FormControl><FormMessage>{resolveError(form.formState.errors.endDate?.message)}</FormMessage></FormItem>
              )} />
            </div>

            <section className="space-y-4 rounded-lg border p-4">
              <div><h3 className="text-sm font-semibold">{t("recurrence.title")}</h3><p className="text-sm text-muted-foreground">{t("recurrence.description")}</p></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="recurrenceRule.frequency" render={({ field }) => (
                  <FormItem><FormLabel>{t("recurrence.frequency")}</FormLabel><Select value={field.value} onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>
                    <SelectItem value="DAILY">{t("frequency.daily")}</SelectItem><SelectItem value="WEEKLY">{t("frequency.weekly")}</SelectItem><SelectItem value="MONTHLY">{t("frequency.monthly")}</SelectItem><SelectItem value="YEARLY">{t("frequency.yearly")}</SelectItem>
                  </SelectContent></Select><FormMessage>{resolveError(form.formState.errors.recurrenceRule?.frequency?.message)}</FormMessage></FormItem>
                )} />
                <FormField control={form.control} name="recurrenceRule.interval" render={({ field }) => (
                  <FormItem><FormLabel>{t("recurrence.interval")}</FormLabel><FormControl><Input type="number" min={1} value={field.value} onChange={(event) => field.onChange(Number(event.target.value))} /></FormControl><FormMessage>{resolveError(form.formState.errors.recurrenceRule?.interval?.message)}</FormMessage></FormItem>
                )} />
              </div>

              {frequency === "DAILY" && <FormField control={form.control} name="recurrenceRule.isEveryDay" render={({ field }) => (
                <FormItem className="space-y-3"><div className="flex items-center justify-between gap-3"><FormLabel>{t("recurrence.everyDay")}</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></div>
                  {!isEveryDay && <div className="flex flex-wrap gap-3">{DAYS.map((day) => <label key={day} className="flex items-center gap-1.5 text-sm"><Checkbox checked={selectedDays.includes(String(day))} onCheckedChange={(checked) => toggleDay(day, checked === true)} />{t(`weekdays.${day}`)}</label>)}</div>}
                  <FormMessage>{resolveError(form.formState.errors.recurrenceRule?.daysOfWeek?.message)}</FormMessage></FormItem>
              )} />}

              {frequency === "WEEKLY" && <FormField control={form.control} name="recurrenceRule.dayOfWeek" render={({ field }) => (
                <FormItem><FormLabel>{t("recurrence.dayOfWeek")}</FormLabel><Select value={String(field.value ?? 1)} onValueChange={(value) => field.onChange(Number(value))}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{DAYS.map((day) => <SelectItem key={day} value={String(day)}>{t(`weekdays.${day}`)}</SelectItem>)}</SelectContent></Select><FormMessage>{resolveError(form.formState.errors.recurrenceRule?.dayOfWeek?.message)}</FormMessage></FormItem>
              )} />}

              {frequency === "MONTHLY" && <FormField control={form.control} name="recurrenceRule.dayOfMonth" render={({ field }) => (
                <FormItem><FormLabel>{t("recurrence.dayOfMonth")}</FormLabel><Select value={String(field.value ?? 1)} onValueChange={(value) => field.onChange(Number(value))}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="-1">{t("recurrence.lastDay")}</SelectItem>{MONTH_DAYS.map((day) => <SelectItem key={day} value={String(day)}>{day}</SelectItem>)}</SelectContent></Select><FormMessage>{resolveError(form.formState.errors.recurrenceRule?.dayOfMonth?.message)}</FormMessage></FormItem>
              )} />}

              {frequency === "YEARLY" && <div className="grid gap-4 sm:grid-cols-2"><FormField control={form.control} name="recurrenceRule.monthOfYear" render={({ field }) => (
                <FormItem><FormLabel>{t("recurrence.month")}</FormLabel><Select value={String(field.value ?? 1)} onValueChange={(value) => field.onChange(Number(value))}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{MONTHS.map((month) => <SelectItem key={month} value={String(month)}>{t(`months.${month}`)}</SelectItem>)}</SelectContent></Select></FormItem>
              )} /><FormField control={form.control} name="recurrenceRule.dayOfMonthForYearly" render={({ field }) => (
                <FormItem><FormLabel>{t("recurrence.dayOfMonth")}</FormLabel><Select value={String(field.value ?? 1)} onValueChange={(value) => field.onChange(Number(value))}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{MONTH_DAYS.map((day) => <SelectItem key={day} value={String(day)}>{day}</SelectItem>)}</SelectContent></Select><FormMessage>{resolveError(form.formState.errors.recurrenceRule?.monthOfYear?.message)}</FormMessage></FormItem>
              )} /></div>}
            </section>

            <div className="grid gap-3 sm:grid-cols-2">
              <FormField control={form.control} name="justForRecord" render={({ field }) => <FormItem className="flex items-center justify-between rounded-lg border p-3"><FormLabel>{t("fields.justForRecord")}</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>} />
              {transaction && <FormField control={form.control} name="isActive" render={({ field }) => <FormItem className="flex items-center justify-between rounded-lg border p-3"><FormLabel>{t("fields.isActive")}</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>} />}
            </div>

            <DialogFooter><Button type="button" variant="ghost" disabled={isSubmitting} onClick={() => onOpenChange(false)}>{t("actions.cancel")}</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting ? t("actions.saving") : t("actions.save")}</Button></DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
