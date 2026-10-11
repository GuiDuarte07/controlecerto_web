"use client";

import { useLocale, useTranslations } from "next-intl";
import { Download, Info, RefreshCw, SearchX, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useTransactionsAnalytics } from "../../hooks/useTransactionsAnalytics";
import { useAnalyticsStore } from "../../context/analyticsContext";
import { analyticsCsv } from "../../utils/analytics.utils";
import { AnalyticsFilters } from "./AnalyticsFilters";
import { AnalyticsSettings } from "./AnalyticsSettings";
import { AnalyticsSummary } from "./AnalyticsSummary";
import { AnalyticsComparison, AnalyticsDistribution, AnalyticsEvolution } from "./AnalyticsCharts";
import { AnalyticsAccounts, AnalyticsCategories } from "./AnalyticsBreakdown";

const NO_RECORDS: never[] = [];

export function TransactionsAnalytics() {
  const t = useTranslations("transactions.analytics");
  const locale = useLocale();
  const { data, result, filters, preferences, isLoading, error, refetch } = useTransactionsAnalytics();
  const drillCategory = useAnalyticsStore(s => s.drillCategory);
  const drillAccount = useAnalyticsStore(s => s.drillAccount);
  const resetPreferences = useAnalyticsStore(s => s.resetPreferences);
  const money = (value: number) => new Intl.NumberFormat(locale, { style: "currency", currency: "BRL" }).format(value);
  const date = (value: string) => new Intl.DateTimeFormat(locale, { dateStyle: "short", timeZone: "UTC" }).format(new Date(`${value.slice(0, 10)}T00:00:00Z`));
  const percent = (value: number) => new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 1 }).format(value / 100);
  const exportCsv = () => {
    if (!result) return;
    const keys = ["date", "transactionDate", "description", "destination", "type", "account", "card", "category", "subcategory", "amount", "recordOnly"];
    const content = analyticsCsv(keys.map(key => t(key)), result.records.map(r => [
      r.date.slice(0, 10), r.transactionDate.slice(0, 10), r.description, r.destination ?? "", t(`types.${r.type === "INCOME" ? "income" : r.type === "CREDITEXPENSE" ? "credit" : "cash"}`),
      r.accountName, r.cardName ?? "", r.parentCategoryName ?? r.categoryName, r.parentCategoryName ? r.categoryName : "", r.type === "INCOME" ? r.amount : -r.amount, r.justForRecord ? t("yes") : t("no"),
    ]));
    const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url; link.download = `transactions-${filters.startDate}-${filters.endDate}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const chartProps = result ? { result, preferences, money } : null;
  const widgets = chartProps ? {
    evolution: <AnalyticsEvolution {...chartProps} />,
    distribution: <AnalyticsDistribution {...chartProps} onCategory={drillCategory} />,
    comparison: <AnalyticsComparison {...chartProps} />,
    categories: <AnalyticsCategories {...chartProps} onCategory={drillCategory} />,
    accounts: <AnalyticsAccounts {...chartProps} onAccount={drillAccount} />,
  } : null;
  const categoryRecord = data?.transactions.find(r => filters.category === `parent:${r.parentCategoryId ?? r.categoryId}` || filters.category === `category:${r.categoryId}`);
  const accountRecord = data?.transactions.find(r => String(r.accountId) === filters.accountId);
  return <section className="min-w-0 space-y-5">
    <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
      <div><h2 className="text-xl font-semibold tracking-tight">{t("title")}</h2><p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t("subtitle")}</p></div>
      <div className="flex flex-wrap gap-2"><Button variant="outline" size="icon" disabled={isLoading} onClick={() => void refetch()} aria-label={t("refresh")}><RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} /></Button><Button variant="outline" onClick={exportCsv} disabled={!result?.records.length || isLoading}><Download className="size-4" />{t("export")}</Button><AnalyticsSettings /></div>
    </div>
    <AnalyticsFilters records={data?.transactions ?? NO_RECORDS} isLoading={isLoading} />
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><Badge variant="outline">{date(filters.startDate)} — {date(filters.endDate)}</Badge>
      {preferences.compare && data && <span>{t("comparedWith", { start: date(data.previousStartDate), end: date(data.previousEndDate) })}</span>}
      {categoryRecord && <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={() => drillCategory("all")}>{t("categoryFilter", { category: filters.category.startsWith("parent:") ? categoryRecord.parentCategoryName ?? categoryRecord.categoryName : categoryRecord.categoryName })}<X className="size-3" /><span className="sr-only">{t("clearCategory")}</span></Button>}
      {accountRecord && <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={() => drillAccount("all")}>{accountRecord.accountName}<X className="size-3" /><span className="sr-only">{t("clearAccount")}</span></Button>}
    </div>
    <Alert><Info className="size-4" /><AlertDescription>{t("methodology")} {t(filters.creditDateBasis === "invoice" ? "invoiceMethod" : "transactionMethod")}</AlertDescription></Alert>
    {error && <Alert variant="destructive"><AlertTitle>{t("errors.load")}</AlertTitle><AlertDescription>{t("retryHint")}<Button variant="outline" size="sm" onClick={() => void refetch()}>{t("refresh")}</Button></AlertDescription></Alert>}
    {isLoading && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label={t("loading")} aria-busy="true">{[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-36 rounded-xl" />)}<Skeleton className="h-80 rounded-xl sm:col-span-2 xl:col-span-4" /></div>}
    {!isLoading && result && <>
      <AnalyticsSummary result={result} compare={preferences.compare} money={money} percent={percent} />
      <div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground"><span>{t("scope", { count: result.totals.count, days: result.dayCount })}</span><span>{t("chartsUseAll")}</span></div>
      {result.records.length === 0 ? <Card><CardContent className="flex flex-col items-center gap-3 py-14 text-center"><SearchX className="size-8 text-muted-foreground" /><h3 className="font-semibold">{t("emptyTitle")}</h3><p className="max-w-md text-sm text-muted-foreground">{t("emptyDescription")}</p></CardContent></Card> : <div className="grid min-w-0 gap-5 xl:grid-cols-2">
        {preferences.widgets.filter(widget => !preferences.hidden.includes(widget)).map(widget => <Card key={widget} className={`min-w-0 ${["evolution", "categories"].includes(widget) ? "xl:col-span-2" : ""}`}>
          <CardHeader><CardTitle className="text-base">{t(`widgets.${widget}`)}</CardTitle><CardDescription>{t(`widgetDescriptions.${widget}`)}{widget === "evolution" && preferences.cumulative ? ` ${t("cumulativeHint")}` : ""}</CardDescription></CardHeader>
          <CardContent className="min-w-0">{widgets?.[widget]}</CardContent>
        </Card>)}
      </div>}
      {preferences.hidden.length === preferences.widgets.length && <Button variant="outline" onClick={resetPreferences}>{t("resetLayout")}</Button>}
    </>}
  </section>;
}
