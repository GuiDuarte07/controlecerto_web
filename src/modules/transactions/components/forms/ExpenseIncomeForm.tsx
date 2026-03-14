"use client";

import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
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
import { Switch } from "@/shared/components/ui/switch";
import { Label } from "@/shared/components/ui/label";
import { SearchableItemSelect } from "@/shared/components/SearchableItemSelect";
import { useCategoriesStore } from "@/modules/categories/context/categoriesContext";
import { useAccountsStore } from "@/modules/accounts/context/accountsContext";
import { toAccountSearchableItem } from "@/modules/accounts";
import { BillTypeEnum, type ParentCategory } from "@/modules/categories";
import type { SearchableItem } from "@/shared/components/SearchableItemSelect";
import { expenseIncomeFormSchema, type ExpenseIncomeFormData } from "../../schemas/transactions.schemas";
import type { TransactionType } from "../../types/transactions.types";
import { CurrencyInput } from "./CurrencyInput";
import { DatePickerInput } from "./DatePickerInput";

interface ExpenseIncomeFormProps {
  type: "EXPENSE" | "INCOME";
  onSubmit: (data: ExpenseIncomeFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  initialData?: Partial<ExpenseIncomeFormData>;
}

function flattenCategories(
  parents: ParentCategory[],
  billType: BillTypeEnum,
): SearchableItem[] {
  return parents
    .filter((p) => p.billType === billType)
    .flatMap((parent) => [
      { id: parent.id, label: parent.name, color: parent.color, iconName: parent.icon },
      ...parent.subCategories.map((sub) => ({
        id: sub.id,
        label: sub.name,
        color: sub.color,
        iconName: sub.icon,
      })),
    ]);
}

export function ExpenseIncomeForm({ type, onSubmit, onCancel, isSubmitting, initialData }: ExpenseIncomeFormProps) {
  const t = useTranslations("transactions");

  const expenseCategories = useCategoriesStore((s) => s.expenseCategories);
  const incomeCategories = useCategoriesStore((s) => s.incomeCategories);
  const accounts = useAccountsStore((s) => s.accounts);

  const categoryOptions = useMemo(() => {
    const billType = type === "EXPENSE" ? BillTypeEnum.EXPENSE : BillTypeEnum.INCOME;
    const parents = type === "EXPENSE" ? expenseCategories : incomeCategories;
    return flattenCategories(parents, billType);
  }, [type, expenseCategories, incomeCategories]);

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

  const form = (useForm<ExpenseIncomeFormData>({
    // @ts-ignore - Temporary Zod v4 resolver typing mismatch
    resolver: zodResolver(expenseIncomeFormSchema),
    defaultValues: {
      amount: initialData?.amount ?? undefined,
      purchaseDate: initialData?.purchaseDate ?? new Date(),
      categoryId: initialData?.categoryId ?? undefined,
      accountId: initialData?.accountId ?? undefined,
      destination: initialData?.destination ?? "",
      description: initialData?.description ?? "",
      observations: initialData?.observations ?? "",
      justForRecord: initialData?.justForRecord ?? false,
    },
  }) as unknown) as UseFormReturn<ExpenseIncomeFormData>;

  const { formState: { errors }, watch, setValue } = form;
  const justForRecord = watch("justForRecord");

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("create.amount")}</FormLabel>
              <FormControl>
                <CurrencyInput
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage>{errors.amount && resolveErrorMessage(errors.amount.message)}</FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="purchaseDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("create.date")}</FormLabel>
              <FormControl>
                <DatePickerInput value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage>{errors.purchaseDate && resolveErrorMessage(errors.purchaseDate.message)}</FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("create.category")}</FormLabel>
              <FormControl>
                <SearchableItemSelect
                  items={categoryOptions}
                  value={field.value ?? null}
                  onChange={(v) => field.onChange(v ? Number(v) : undefined)}
                  placeholder={t("create.category")}
                />
              </FormControl>
              <FormMessage>{errors.categoryId && resolveErrorMessage(errors.categoryId.message)}</FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="accountId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("create.account")}</FormLabel>
              <FormControl>
                <SearchableItemSelect
                  items={accountOptions}
                  value={field.value ?? null}
                  onChange={(v) => field.onChange(v ? Number(v) : undefined)}
                  placeholder={t("create.account")}
                />
              </FormControl>
              <FormMessage>{errors.accountId && resolveErrorMessage(errors.accountId.message)}</FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="destination"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("create.destination")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  maxLength={80}
                  placeholder={t("create.destination")}
                />
              </FormControl>
              <FormMessage>{errors.destination && resolveErrorMessage(errors.destination.message)}</FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("create.description")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  maxLength={100}
                  placeholder={t("create.description")}
                />
              </FormControl>
              <FormMessage>{errors.description && resolveErrorMessage(errors.description.message)}</FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="observations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("create.observations")}</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  maxLength={300}
                  placeholder={t("create.observations")}
                  className="resize-none"
                  rows={3}
                />
              </FormControl>
              <FormMessage>{errors.observations && resolveErrorMessage(errors.observations.message)}</FormMessage>
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
              {t("create.justForRecord")}
            </Label>
            <span className="text-xs text-muted-foreground">{t("create.justForRecordHint")}</span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            {t("create.cancel")}
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? t("create.saving") : t("create.save")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
