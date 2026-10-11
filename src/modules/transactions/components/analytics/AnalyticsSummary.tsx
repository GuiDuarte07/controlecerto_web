"use client";

import { useTranslations } from "next-intl";
import { ArrowDownLeft, ArrowUpRight, Wallet, PiggyBank } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import type { AnalyticsResult } from "../../types/analytics.types";

interface Props { result: AnalyticsResult; compare: boolean; money: (value: number) => string; percent: (value: number) => string }

export function AnalyticsSummary({ result, compare, money, percent }: Props) {
  const t = useTranslations("transactions.analytics");
  const { totals, previous } = result;
  const change = (current: number, before: number) => before === 0 ? (current === 0 ? t("unchanged") : t("noBaseline")) : t("change", { value: `${current >= before ? "+" : ""}${percent((current - before) / Math.abs(before) * 100)}` });
  const items = [
    { key: "income", value: money(totals.income), icon: ArrowDownLeft, color: "text-emerald-600 dark:text-emerald-400", detail: compare ? change(totals.income, previous.income) : t("totalPeriod") },
    { key: "expense", value: money(totals.expense), icon: ArrowUpRight, color: "text-rose-600 dark:text-rose-400", detail: t("creditIncluded", { value: money(totals.credit) }) },
    { key: "net", value: money(totals.net), icon: Wallet, color: totals.net >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400", detail: compare ? t("netDifference", { value: money(totals.net - previous.net) }) : t("netDescription") },
    { key: "savingsRate", value: result.savingsRate === null ? t("notAvailable") : percent(result.savingsRate), icon: PiggyBank, color: "text-foreground", detail: t("dailyAverage", { value: money(result.dailyExpense) }) },
  ];
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{items.map(item => <Card key={item.key}><CardContent className="space-y-3 pt-5">
    <div className="flex items-center justify-between gap-2"><p className="text-sm text-muted-foreground">{t(item.key)}</p><item.icon className={`size-4 ${item.color}`} /></div>
    <p className={`break-words text-2xl font-semibold tabular-nums ${item.color}`}>{item.value}</p>
    <p className="text-xs text-muted-foreground">{item.detail}</p>
    {item.key === "expense" && compare && <p className="text-xs text-muted-foreground">{change(totals.expense, previous.expense)}</p>}
  </CardContent></Card>)}</div>;
}
