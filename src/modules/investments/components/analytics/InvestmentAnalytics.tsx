"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Info, RefreshCw, SearchX } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useInvestmentAnalytics } from "../../hooks/useInvestmentAnalytics";
import type { Investment } from "../../types/investments.types";
import { InvestmentAnalyticsCharts } from "./InvestmentAnalyticsCharts";
import { InvestmentAnalyticsFilters } from "./InvestmentAnalyticsFilters";
import { InvestmentAnalyticsSummary } from "./InvestmentAnalyticsSummary";
import { InvestmentPerformanceTable } from "./InvestmentPerformanceTable";

interface Props {
  investments: Investment[];
}

export function InvestmentAnalytics({ investments }: Props) {
  const t = useTranslations("investments.analytics");
  const locale = useLocale();
  const { data, isLoading, error, refetch } = useInvestmentAnalytics();
  const moneyFormatter = useMemo(() => new Intl.NumberFormat(locale, { style: "currency", currency: "BRL" }), [locale]);
  const percentFormatter = useMemo(() => new Intl.NumberFormat(locale, { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2 }), [locale]);
  const money = (value: number) => moneyFormatter.format(value);
  const percent = (value: number) => percentFormatter.format(value / 100);

  return <section className="min-w-0 space-y-5">
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
      <div><h2 className="text-xl font-semibold tracking-tight">{t("title")}</h2><p className="mt-1 max-w-3xl text-sm text-muted-foreground">{t("description")}</p></div>
      <Button variant="outline" size="icon" disabled={isLoading} onClick={() => void refetch()} aria-label={t("refresh")}><RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} /></Button>
    </div>
    <InvestmentAnalyticsFilters investments={investments} isLoading={isLoading} />
    <Alert><Info className="size-4" /><AlertDescription>{t("methodology")}</AlertDescription></Alert>
    {error && <Alert variant="destructive"><AlertTitle>{t("errors.load")}</AlertTitle><AlertDescription>{t("errors.retry")} <Button variant="outline" size="sm" onClick={() => void refetch()}>{t("refresh")}</Button></AlertDescription></Alert>}
    {isLoading && <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{[0, 1, 2, 3, 4, 5].map(index => <Skeleton key={index} className="h-32 rounded-xl" />)}<Skeleton className="h-80 rounded-xl sm:col-span-2 xl:col-span-3" /></div>}
    {!isLoading && data && <>
      <InvestmentAnalyticsSummary summary={data.summary} money={money} percent={percent} />
      {data.monthly.every(month => month.closingBalance === 0 && month.contributions === 0 && month.earnings === 0) ? <Card><CardContent className="flex flex-col items-center gap-3 py-14 text-center"><SearchX className="size-8 text-muted-foreground" /><h3 className="font-semibold">{t("emptyTitle")}</h3><p className="max-w-md text-sm text-muted-foreground">{t("emptyDescription")}</p></CardContent></Card> : <>
        <InvestmentAnalyticsCharts data={data} money={money} percent={percent} />
        <Card><CardHeader><CardTitle className="text-base">{t("performance.title")}</CardTitle><CardDescription>{t("performance.description")}</CardDescription></CardHeader><CardContent><InvestmentPerformanceTable investments={data.investments} money={money} percent={percent} /></CardContent></Card>
      </>}
    </>}
  </section>;
}
