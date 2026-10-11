"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import type { InvestmentAnalyticsResponse } from "../../types/investments.types";

interface Props {
  data: InvestmentAnalyticsResponse;
  money: (value: number) => string;
  percent: (value: number) => string;
}

const COLORS = ["#2563eb", "#16a34a", "#9333ea", "#ea580c", "#0891b2", "#db2777", "#65a30d", "#7c3aed"];

export function InvestmentAnalyticsCharts({ data, money, percent }: Props) {
  const t = useTranslations("investments.analytics");
  const locale = useLocale();
  const monthly = useMemo(() => data.monthly.map(item => ({
    ...item,
    label: new Intl.DateTimeFormat(locale, { month: "short", year: "2-digit", timeZone: "UTC" }).format(new Date(item.month)),
  })), [data.monthly, locale]);
  const distribution = data.investments.filter(item => item.endingBalance > 0).map(item => ({ name: item.name, value: item.endingBalance }));
  const axisMoney = (value: number) => new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(value);

  return <div className="grid min-w-0 gap-5 xl:grid-cols-2">
    <Card className="min-w-0 xl:col-span-2"><CardHeader><CardTitle className="text-base">{t("charts.evolution")}</CardTitle><CardDescription>{t("charts.evolutionDescription")}</CardDescription></CardHeader><CardContent>
      <ResponsiveContainer width="100%" height={320}><ComposedChart data={monthly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" /><XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} /><YAxis tickFormatter={axisMoney} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={65} />
        <Tooltip formatter={(value: number, name: string) => [money(value), t(`series.${name}`)]} contentStyle={{ fontSize: 12 }} /><Legend formatter={value => t(`series.${value}`)} />
        <Bar dataKey="contributions" fill="#2563eb" radius={[3, 3, 0, 0]} /><Bar dataKey="earnings" fill="#16a34a" radius={[3, 3, 0, 0]} />
        <Line type="monotone" dataKey="closingBalance" stroke="#9333ea" strokeWidth={3} dot={false} activeDot={{ r: 4 }} />
      </ComposedChart></ResponsiveContainer>
    </CardContent></Card>
    <Card className="min-w-0"><CardHeader><CardTitle className="text-base">{t("charts.monthlyReturn")}</CardTitle><CardDescription>{t("charts.monthlyReturnDescription")}</CardDescription></CardHeader><CardContent>
      <ResponsiveContainer width="100%" height={280}><BarChart data={monthly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" /><XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} /><YAxis tickFormatter={value => `${value}%`} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={48} />
        <Tooltip formatter={(value: number) => [percent(value), t("returnRate")]} contentStyle={{ fontSize: 12 }} /><Bar dataKey="returnRate" radius={[4, 4, 0, 0]}>{monthly.map((item, index) => <Cell key={`${item.month}-${index}`} fill={item.returnRate >= 0 ? "#16a34a" : "#e11d48"} />)}</Bar>
      </BarChart></ResponsiveContainer>
    </CardContent></Card>
    <Card className="min-w-0"><CardHeader><CardTitle className="text-base">{t("charts.distribution")}</CardTitle><CardDescription>{t("charts.distributionDescription")}</CardDescription></CardHeader><CardContent>
      {distribution.length === 0 ? <p className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">{t("noData")}</p> : <ResponsiveContainer width="100%" height={280}><PieChart><Pie data={distribution} dataKey="value" nameKey="name" innerRadius={52} outerRadius={88} paddingAngle={2}>{distribution.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip formatter={(value: number) => [money(value)]} contentStyle={{ fontSize: 12 }} /><Legend wrapperStyle={{ fontSize: 12 }} /></PieChart></ResponsiveContainer>}
    </CardContent></Card>
  </div>;
}
