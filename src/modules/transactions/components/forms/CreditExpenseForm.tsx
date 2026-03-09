"use client";

import { useEffect, useRef, useMemo } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
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
import { SearchableItemSelect } from "@/shared/components/SearchableItemSelect";
import { useCategoriesStore } from "@/modules/categories/context/categoriesContext";
import { useCreditCardsStore } from "@/modules/credit-cards/context/creditCardsContext";
import { BillTypeEnum, type ParentCategory } from "@/modules/categories";
import type { SearchableItem } from "@/shared/components/SearchableItemSelect";
import { creditExpenseFormSchema, type CreditExpenseFormData } from "../../schemas/transactions.schemas";
import { CurrencyInput } from "./CurrencyInput";
import { DatePickerInput } from "./DatePickerInput";

interface CreditExpenseFormProps {
  onSubmit: (data: CreditExpenseFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  initialData?: Partial<CreditExpenseFormData>;
}

function flattenExpenseCategories(parents: ParentCategory[]): SearchableItem[] {
  return parents
    .filter((p) => p.billType === BillTypeEnum.EXPENSE)
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

export function CreditExpenseForm({ onSubmit, onCancel, isSubmitting, initialData }: CreditExpenseFormProps) {
  const t = useTranslations("transactions");

  const expenseCategories = useCategoriesStore((s) => s.expenseCategories);
  const creditCards = useCreditCardsStore((s) => s.creditCards);

  const categoryOptions = useMemo(
    () => flattenExpenseCategories(expenseCategories),
    [expenseCategories],
  );

  const cardOptions = useMemo(
    () =>
      creditCards.map((c) => ({
        id: c.id,
        label: c.description || c.account.bank,
        color: c.account.color,
        iconName: "creditCard",
      })),
    [creditCards],
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

  const form = (useForm<CreditExpenseFormData>({
    // @ts-expect-error — Zod v4 + RHF resolver type mismatch
    resolver: zodResolver(creditExpenseFormSchema),
    defaultValues: {
      totalAmount: initialData?.totalAmount ?? undefined,
      totalInstallment: initialData?.totalInstallment ?? 1,
      installmentAmount: initialData?.installmentAmount ?? undefined,
      purchaseDate: initialData?.purchaseDate ?? new Date(),
      categoryId: initialData?.categoryId ?? undefined,
      creditCardId: initialData?.creditCardId ?? undefined,
      destination: initialData?.destination ?? "",
      description: initialData?.description ?? "",
    },
  }) as unknown) as UseFormReturn<CreditExpenseFormData>;

  const { formState: { errors }, watch, setValue } = form;

  const lastEditedField = useRef<"total" | "installment" | null>(null);

  const totalAmount = watch("totalAmount");
  const totalInstallment = watch("totalInstallment");
  const installmentAmount = watch("installmentAmount");

  useEffect(() => {
    if (lastEditedField.current === "total" || lastEditedField.current === null) return;
    if (totalAmount !== undefined && totalInstallment >= 1) {
      const calculated = totalAmount / totalInstallment;
      setValue("installmentAmount", Math.round(calculated * 100) / 100, { shouldValidate: false });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalAmount, totalInstallment]);

  useEffect(() => {
    if (lastEditedField.current !== "installment") return;
    if (installmentAmount !== undefined && totalInstallment >= 1) {
      const calculated = installmentAmount * totalInstallment;
      setValue("totalAmount", Math.round(calculated * 100) / 100, { shouldValidate: false });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [installmentAmount]);

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="totalAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("create.amount")}</FormLabel>
              <FormControl>
                <CurrencyInput
                  value={field.value}
                  onChange={(v) => {
                    lastEditedField.current = "total";
                    field.onChange(v);
                    if (v !== undefined && (totalInstallment ?? 1) >= 1) {
                      const calc = v / (totalInstallment ?? 1);
                      setValue("installmentAmount", Math.round(calc * 100) / 100, {
                        shouldValidate: false,
                      });
                    }
                  }}
                />
              </FormControl>
              <FormMessage>{errors.totalAmount && resolveErrorMessage(errors.totalAmount.message)}</FormMessage>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="totalInstallment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("create.installments")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    {...field}
                    onChange={(e) => {
                      lastEditedField.current = "total";
                      const v = parseInt(e.target.value, 10);
                      field.onChange(isNaN(v) ? 1 : v);
                      if (totalAmount !== undefined && !isNaN(v) && v >= 1) {
                        setValue("installmentAmount", Math.round((totalAmount / v) * 100) / 100, {
                          shouldValidate: false,
                        });
                      }
                    }}
                  />
                </FormControl>
                <FormMessage>{errors.totalInstallment && resolveErrorMessage(errors.totalInstallment.message)}</FormMessage>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="installmentAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("create.amountPerInstallment")}</FormLabel>
                <FormControl>
                  <CurrencyInput
                    value={field.value}
                    onChange={(v) => {
                      lastEditedField.current = "installment";
                      field.onChange(v);
                      if (v !== undefined && (totalInstallment ?? 1) >= 1) {
                        setValue("totalAmount", Math.round(v * (totalInstallment ?? 1) * 100) / 100, {
                          shouldValidate: false,
                        });
                      }
                    }}
                  />
                </FormControl>
                <FormMessage>{errors.installmentAmount && resolveErrorMessage(errors.installmentAmount.message)}</FormMessage>
              </FormItem>
            )}
          />
        </div>

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
          name="creditCardId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("create.card")}</FormLabel>
              <FormControl>
                <SearchableItemSelect
                  items={cardOptions}
                  value={field.value ?? null}
                  onChange={(v) => field.onChange(v ? Number(v) : undefined)}
                  placeholder={t("create.card")}
                />
              </FormControl>
              <FormMessage>{errors.creditCardId && resolveErrorMessage(errors.creditCardId.message)}</FormMessage>
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
                <Input {...field} maxLength={80} placeholder={t("create.destination")} />
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
                <Input {...field} maxLength={100} placeholder={t("create.description")} />
              </FormControl>
              <FormMessage>{errors.description && resolveErrorMessage(errors.description.message)}</FormMessage>
            </FormItem>
          )}
        />

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
