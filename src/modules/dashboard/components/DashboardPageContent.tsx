"use client";

import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import { useLocale } from "next-intl";
import { startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns";
import { Calendar } from "lucide-react";
import { usePageHeader } from "@/shared/hooks/use-page-header";
import { useDashboardData, useDashboardFilters } from "../hooks";
import { MonthNavigator } from "@/shared/components/MonthNavigator";
import { FinancialSummaryCards } from "./FinancialSummaryCards";
import { ExpensesByCategory } from "./ExpensesByCategory";
import { AccountsOverview } from "./AccountsOverview";
import { CreditCardsOverview } from "./CreditCardsOverview";
import { MonthlyTrendsChart } from "./MonthlyTrendsChart";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function DashboardPageContent() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const { data, isLoading, error } = useDashboardData();
  const { filters, setDateRange, applyFilters } = useDashboardFilters();

  usePageHeader({
    title: t("title"),
    description: t("description"),
  });

  const dateLocale = locale === "pt" ? ptBR : enUS;

  const monthLabel = format(filters.startDate, "MMMM yyyy", {
    locale: dateLocale,
  });

  const handlePrevMonth = () => {
    const newDate = subMonths(filters.startDate, 1);
    const start = startOfMonth(newDate);
    const end = endOfMonth(newDate);
    setDateRange(start, end);
    setTimeout(() => applyFilters(), 0);
  };

  const handleNextMonth = () => {
    const newDate = addMonths(filters.startDate, 1);
    const start = startOfMonth(newDate);
    const end = endOfMonth(newDate);
    setDateRange(start, end);
    setTimeout(() => applyFilters(), 0);
  };

  const handleSelectMonth = (year: number, month: number) => {
    const newDate = new Date(year, month - 1, 1);
    const start = startOfMonth(newDate);
    const end = endOfMonth(newDate);
    setDateRange(start, end);
    setTimeout(() => applyFilters(), 0);
  };

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("error.title")}</AlertTitle>
          <AlertDescription>
            {error.message || t("error.description")}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center">
          <Skeleton className="h-10 w-80" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <MonthNavigator
          label={monthLabel}
          onPrev={handlePrevMonth}
          onNext={handleNextMonth}
          date={filters.startDate}
          onSelect={handleSelectMonth}
        />
      </div>

      <FinancialSummaryCards summary={data.financialSummary} />

      <div className="grid gap-6 md:grid-cols-2">
        <ExpensesByCategory expenses={data.expensesByCategory} />
        <MonthlyTrendsChart trends={data.monthlyTrends} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <AccountsOverview accounts={data.accounts} />
        <CreditCardsOverview creditCards={data.creditCards} />
      </div>
    </div>
  );
}
