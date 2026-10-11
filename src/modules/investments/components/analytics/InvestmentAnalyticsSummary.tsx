"use client";

import { useTranslations } from "next-intl";
import { ArrowDownToLine, ChartNoAxesCombined, CirclePercent, Landmark, TrendingUp, WalletCards } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import type { InvestmentAnalyticsSummary as Summary } from "../../types/investments.types";

interface Props {
  summary: Summary;
  money: (value: number) => string;
  percent: (value: number) => string;
}

export function InvestmentAnalyticsSummary({ summary, money, percent }: Props) {
  const t = useTranslations("investments.analytics");
  const items = [
    { key: "endingBalance", value: money(summary.endingBalance), detail: t("openingBalanceDetail", { value: money(summary.openingBalance) }), icon: Landmark, color: "text-primary" },
    { key: "contributions", value: money(summary.contributions), detail: t("withdrawalsDetail", { value: money(summary.withdrawals) }), icon: ArrowDownToLine, color: "text-sky-600 dark:text-sky-400" },
    { key: "earnings", value: money(summary.earnings), detail: t("monthsDetail", { positive: summary.positiveMonths, negative: summary.negativeMonths }), icon: TrendingUp, color: summary.earnings >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400" },
    { key: "returnRate", value: percent(summary.returnRate), detail: t("averageBalanceDetail", { value: money(summary.averageBalance) }), icon: CirclePercent, color: summary.returnRate >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400" },
    { key: "averageMonthlyContribution", value: money(summary.averageMonthlyContribution), detail: t("monthlyAverage"), icon: WalletCards, color: "text-foreground" },
    { key: "averageMonthlyEarnings", value: money(summary.averageMonthlyEarnings), detail: t("monthlyAverage"), icon: ChartNoAxesCombined, color: "text-foreground" },
  ];
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{items.map(item => <Card key={item.key}><CardContent className="space-y-3 pt-5">
    <div className="flex items-center justify-between gap-2"><p className="text-sm text-muted-foreground">{t(item.key)}</p><item.icon className={`size-4 ${item.color}`} /></div>
    <p className={`break-words text-2xl font-semibold tabular-nums ${item.color}`}>{item.value}</p>
    <p className="text-xs text-muted-foreground">{item.detail}</p>
  </CardContent></Card>)}</div>;
}
