"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { endOfMonth, format, startOfMonth, startOfYear, subDays, subMonths } from "date-fns";
import { Filter, RotateCcw, Search } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Switch } from "@/shared/components/ui/switch";
import { Badge } from "@/shared/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/components/ui/collapsible";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { analyticsFiltersSchema, type AnalyticsFilters as Filters } from "../../schemas/analytics.schemas";
import { defaultAnalyticsFilters, useAnalyticsStore } from "../../context/analyticsContext";
import type { AnalyticsTransaction } from "../../types/analytics.types";
import { CurrencyInput } from "../forms/CurrencyInput";
import { AnalyticsSelect } from "./AnalyticsSelect";
import { useCategoriesStore } from "@/modules/categories/context/categoriesContext";

interface Props { records: AnalyticsTransaction[]; isLoading: boolean }

export function AnalyticsFilters({ records, isLoading }: Props) {
  const t = useTranslations("transactions.analytics");
  const translate = useTranslations();
  const filters = useAnalyticsStore(s => s.filters);
  const applyFilters = useAnalyticsStore(s => s.applyFilters);
  const expenseCategories = useCategoriesStore(s => s.expenseCategories);
  const incomeCategories = useCategoriesStore(s => s.incomeCategories);
  const fetchExpenseCategories = useCategoriesStore(s => s.fetchExpense);
  const fetchIncomeCategories = useCategoriesStore(s => s.fetchIncome);
  const form = useForm<Filters>({
    // @ts-expect-error - Installed resolver and Zod versions have incompatible type declarations.
    resolver: zodResolver(analyticsFiltersSchema), defaultValues: filters,
  });
  useEffect(() => form.reset(filters), [filters, form]);
  useEffect(() => {
    if (expenseCategories.length === 0) void fetchExpenseCategories();
    if (incomeCategories.length === 0) void fetchIncomeCategories();
  }, [expenseCategories.length, fetchExpenseCategories, fetchIncomeCategories, incomeCategories.length]);
  const options = useMemo(() => {
    const accounts = new Map<string, string>();
    const cards = new Map<string, string>();
    const expenseCategoryOptions = new Map<string, string>();
    const incomeCategoryOptions = new Map<string, string>();
    for (const r of records) {
      accounts.set(String(r.accountId), r.accountName);
      if (r.cardId) cards.set(String(r.cardId), r.cardName ?? r.accountName);
      const categories = r.type === "INCOME" ? incomeCategoryOptions : expenseCategoryOptions;
      categories.set(`parent:${r.parentCategoryId ?? r.categoryId}`, r.parentCategoryName ?? r.categoryName);
      if (r.parentCategoryId) categories.set(`category:${r.categoryId}`, `↳ ${r.parentCategoryName} / ${r.categoryName}`);
    }
    for (const parent of expenseCategories) {
      expenseCategoryOptions.set(`parent:${parent.id}`, parent.name);
      for (const category of parent.subCategories)
        expenseCategoryOptions.set(`category:${category.id}`, `↳ ${parent.name} / ${category.name}`);
    }
    for (const parent of incomeCategories) {
      incomeCategoryOptions.set(`parent:${parent.id}`, parent.name);
      for (const category of parent.subCategories)
        incomeCategoryOptions.set(`category:${category.id}`, `↳ ${parent.name} / ${category.name}`);
    }
    const list = (map: Map<string, string>) => [{ value: "all", label: t("all") }, ...[...map].sort((a, b) => a[1].localeCompare(b[1])).map(([value, label]) => ({ value, label }))];
    const categoryList = (map: Map<string, string>, group: string) => [...map]
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([value, label]) => ({ value, label, group }));
    return {
      accounts: list(accounts),
      cards: list(cards),
      categories: [
        { value: "all", label: t("all") },
        ...categoryList(expenseCategoryOptions, t("expense")),
        ...categoryList(incomeCategoryOptions, t("income")),
      ],
    };
  }, [expenseCategories, incomeCategories, records, t]);

  const preset = (kind: "month" | "previousMonth" | "quarter" | "year" | "twelveMonths") => {
    const now = new Date();
    const start = kind === "month" ? startOfMonth(now) : kind === "previousMonth" ? startOfMonth(subMonths(now, 1)) : kind === "quarter" ? subDays(now, 89) : kind === "year" ? startOfYear(now) : startOfMonth(subMonths(now, 11));
    const end = kind === "previousMonth" ? endOfMonth(subMonths(now, 1)) : now;
    form.setValue("startDate", format(start, "yyyy-MM-dd"));
    form.setValue("endDate", format(end, "yyyy-MM-dd"));
    void form.handleSubmit(applyFilters)();
  };
  const message = (value?: string) => value ? translate(value) : undefined;
  const activeCount = [filters.accountId !== "all", filters.cardId !== "all", filters.category !== "all", filters.type !== "all", !!filters.search, filters.minAmount !== undefined, filters.maxAmount !== undefined, !filters.includeRecordOnly].filter(Boolean).length;
  const secondarySelects = [
    { name: "accountId", label: "account", options: options.accounts },
    { name: "cardId", label: "card", options: options.cards },
  ] as const;
  const typeOptions = ["all", "income", "expense", "credit", "cash"].map(value => ({ value, label: t(`types.${value}`) }));

  return <Card><CardContent className="space-y-4 pt-5">
    <div className="flex flex-wrap gap-2">{(["month", "previousMonth", "quarter", "year", "twelveMonths"] as const).map(key =>
      <Button key={key} type="button" size="sm" variant="outline" onClick={() => preset(key)}>{t(`presets.${key}`)}</Button>)}</div>
    <Form {...form}><form onSubmit={form.handleSubmit(applyFilters)} className="space-y-4">
      <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {(["startDate", "endDate"] as const).map(name => <FormField key={name} control={form.control} name={name} render={({ field, fieldState }) => <FormItem className="min-w-0">
          <FormLabel>{t(name)}</FormLabel><FormControl><Input type="date" max={format(new Date(), "yyyy-MM-dd")} className="min-w-0" {...field} /></FormControl><FormMessage>{message(fieldState.error?.message)}</FormMessage>
        </FormItem>} />)}
        <FormField control={form.control} name="creditDateBasis" render={({ field }) => <FormItem>
          <FormLabel>{t("creditDateBasis")}</FormLabel>
          <AnalyticsSelect value={field.value} onChange={field.onChange} label={t("creditDateBasis")} options={["invoice", "transaction"].map(value => ({ value, label: t(`basis.${value}`) }))} />
        </FormItem>} />
        <FormField control={form.control} name="category" render={({ field }) => <FormItem className="min-w-0">
          <FormLabel>{t("category")}</FormLabel>
          <AnalyticsSelect value={field.value} onChange={field.onChange} label={t("category")} options={options.categories} />
        </FormItem>} />
        <FormField control={form.control} name="type" render={({ field }) => <FormItem className="min-w-0">
          <FormLabel>{t("type")}</FormLabel>
          <AnalyticsSelect value={field.value} onChange={field.onChange} label={t("type")} options={typeOptions} />
        </FormItem>} />
        <div className="flex items-end"><Button type="submit" className="w-full" disabled={isLoading}><Search className="size-4" />{isLoading ? t("loading") : t("apply")}</Button></div>
      </div>
      <Collapsible>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CollapsibleTrigger asChild><Button type="button" variant="ghost" size="sm"><Filter className="size-4" />{t("filters")}{activeCount > 0 && <Badge variant="secondary">{activeCount}</Badge>}</Button></CollapsibleTrigger>
          {activeCount > 0 && <Button type="button" variant="ghost" size="sm" onClick={() => void applyFilters({ ...defaultAnalyticsFilters(), startDate: filters.startDate, endDate: filters.endDate, creditDateBasis: filters.creditDateBasis })}><RotateCcw className="size-3.5" />{t("clearFilters")}</Button>}
        </div>
        <CollapsibleContent className="pt-3">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {secondarySelects.map(select => <FormField key={select.name} control={form.control} name={select.name} render={({ field }) => <FormItem className="min-w-0">
              <FormLabel>{t(select.label)}</FormLabel><AnalyticsSelect value={field.value} onChange={field.onChange} label={t(select.label)} options={select.options} />
            </FormItem>} />)}
            <FormField control={form.control} name="search" render={({ field, fieldState }) => <FormItem className="sm:col-span-2">
              <FormLabel>{t("search")}</FormLabel><FormControl><Input {...field} placeholder={t("searchPlaceholder")} /></FormControl><FormMessage>{message(fieldState.error?.message)}</FormMessage>
            </FormItem>} />
            {(["minAmount", "maxAmount"] as const).map(name => <FormField key={name} control={form.control} name={name} render={({ field, fieldState }) => <FormItem>
              <FormLabel>{t(name)}</FormLabel><FormControl><CurrencyInput value={field.value} onChange={field.onChange} /></FormControl><FormMessage>{message(fieldState.error?.message)}</FormMessage>
            </FormItem>} />)}
            <FormField control={form.control} name="includeRecordOnly" render={({ field }) => <FormItem className="flex items-center gap-3 sm:col-span-2">
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>{t("includeRecordOnly")}</FormLabel>
            </FormItem>} />
          </div>
        </CollapsibleContent>
      </Collapsible>
      {form.formState.isDirty && <p className="text-xs text-muted-foreground">{t("pendingFilters")}</p>}
    </form></Form>
  </CardContent></Card>;
}
