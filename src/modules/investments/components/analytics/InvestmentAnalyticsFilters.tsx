"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, startOfMonth, startOfYear, subMonths } from "date-fns";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { Search } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { useInvestmentAnalyticsStore } from "../../context/investmentAnalyticsContext";
import { investmentAnalyticsFiltersSchema, type InvestmentAnalyticsFilters } from "../../schemas/investmentAnalytics.schemas";
import type { Investment } from "../../types/investments.types";

interface Props {
  investments: Investment[];
  isLoading: boolean;
}

export function InvestmentAnalyticsFilters({ investments, isLoading }: Props) {
  const t = useTranslations("investments.analytics");
  const translate = useTranslations();
  const filters = useInvestmentAnalyticsStore(state => state.filters);
  const applyFilters = useInvestmentAnalyticsStore(state => state.applyFilters);
  const form = useForm<InvestmentAnalyticsFilters>({
    resolver: zodResolver(investmentAnalyticsFiltersSchema),
    defaultValues: filters,
  });

  useEffect(() => form.reset(filters), [filters, form]);

  const applyPreset = (months: number | "year" | "all") => {
    const now = new Date();
    const earliest = investments.length > 0
      ? new Date(Math.min(...investments.map(investment => new Date(investment.startDate).getTime())))
      : startOfMonth(now);
    const start = months === "year" ? startOfYear(now)
      : months === "all" ? startOfMonth(earliest)
        : startOfMonth(subMonths(now, months - 1));
    form.setValue("startDate", format(start, "yyyy-MM-dd"));
    form.setValue("endDate", format(now, "yyyy-MM-dd"));
    void form.handleSubmit(applyFilters)();
  };

  const errorMessage = (message?: string) => message ? translate(message) : undefined;

  return <Card><CardContent className="space-y-4 pt-5">
    <div className="flex flex-wrap gap-2">
      {([6, 12, 24] as const).map(months => <Button key={months} type="button" variant="outline" size="sm" onClick={() => applyPreset(months)}>{t("presets.months", { count: months })}</Button>)}
      <Button type="button" variant="outline" size="sm" onClick={() => applyPreset("year")}>{t("presets.year")}</Button>
      <Button type="button" variant="outline" size="sm" onClick={() => applyPreset("all")}>{t("presets.all")}</Button>
    </div>
    <Form {...form}><form onSubmit={form.handleSubmit(applyFilters)} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {(["startDate", "endDate"] as const).map(name => <FormField key={name} control={form.control} name={name} render={({ field, fieldState }) => <FormItem>
        <FormLabel>{t(name)}</FormLabel><FormControl><Input type="date" max={format(new Date(), "yyyy-MM-dd")} {...field} /></FormControl><FormMessage>{errorMessage(fieldState.error?.message)}</FormMessage>
      </FormItem>} />)}
      <FormField control={form.control} name="investmentId" render={({ field }) => <FormItem>
        <FormLabel>{t("investment")}</FormLabel>
        <Select value={field.value} onValueChange={field.onChange}><FormControl><SelectTrigger className="w-full"><SelectValue /></SelectTrigger></FormControl><SelectContent>
          <SelectItem value="all">{t("allInvestments")}</SelectItem>
          {investments.map(investment => <SelectItem key={investment.id} value={String(investment.id)}>{investment.name}</SelectItem>)}
        </SelectContent></Select>
      </FormItem>} />
      <div className="flex items-end"><Button type="submit" className="w-full" disabled={isLoading}><Search className="size-4" />{isLoading ? t("loading") : t("analyze")}</Button></div>
    </form></Form>
  </CardContent></Card>;
}
