"use client";

import { useLocale, useTranslations } from "next-intl";
import { Area, Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Line, Pie, PieChart, ReferenceLine, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart";
import { Button } from "@/shared/components/ui/button";
import { normalizeHexColor } from "@/shared/utils/colors";
import type { AnalyticsPreferences, AnalyticsResult } from "../../types/analytics.types";

interface Props { result: AnalyticsResult; preferences: AnalyticsPreferences; money: (value: number) => string }
const COLORS = { income: "#10b981", expense: "#f43f5e", net: "#3b82f6" };

export function AnalyticsEvolution({ result, preferences, money }: Props) {
  const t = useTranslations("transactions.analytics");
  const locale = useLocale();
  const config = { income: { label: t("income"), color: COLORS.income }, expense: { label: t("expense"), color: COLORS.expense }, net: { label: t("net"), color: COLORS.net } };
  const date = (value: string) => new Intl.DateTimeFormat(locale, { month: "short", ...(preferences.granularity === "month" ? { year: "2-digit" as const } : { day: "2-digit" as const }), timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
  const compact = (value: number) => new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(value);
  return <ChartContainer config={config} className="h-[300px] w-full min-w-0 aspect-auto">
    <ComposedChart accessibilityLayer data={result.timeline} margin={{ left: 0, right: 12, top: 12, bottom: 0 }}>
      <CartesianGrid vertical={false} /><XAxis dataKey="date" tickFormatter={date} minTickGap={35} tickLine={false} axisLine={false} /><YAxis width={54} tickFormatter={compact} tickLine={false} axisLine={false} />
      <ChartTooltip content={<ChartTooltipContent labelFormatter={value => date(String(value))} formatter={(value, name) => <span>{t(String(name))}: {money(Number(value))}</span>} />} />
      <Legend formatter={value => t(String(value))} /><ReferenceLine y={0} stroke="var(--border)" />
      {(["income", "expense"] as const).map(key => preferences.chartType === "bar" ? <Bar key={key} dataKey={key} fill={COLORS[key]} radius={[3, 3, 0, 0]} maxBarSize={36} /> : preferences.chartType === "line" ? <Line key={key} dataKey={key} stroke={COLORS[key]} strokeWidth={2} dot={result.timeline.length < 15} isAnimationActive={false} /> : <Area key={key} dataKey={key} stroke={COLORS[key]} fill={COLORS[key]} fillOpacity={0.12} strokeWidth={2} isAnimationActive={false} />)}
      <Line dataKey="net" stroke={COLORS.net} strokeWidth={2} strokeDasharray="4 4" dot={false} isAnimationActive={false} />
    </ComposedChart>
  </ChartContainer>;
}

export function AnalyticsDistribution({ result, preferences, money, onCategory }: Props & { onCategory: (filter: string) => void }) {
  const t = useTranslations("transactions.analytics");
  const metric = preferences.distributionMetric;
  const visible = result.distribution.slice(0, preferences.topCount).map(group => ({ name: group.name, value: group[metric], color: normalizeHexColor(group.color), filter: group.filter }));
  const rest = result.distribution.slice(preferences.topCount).reduce((sum, group) => sum + Math.round(group[metric] * 100), 0) / 100;
  if (rest > 0) visible.push({ name: t("others"), value: rest, color: "#94a3b8", filter: "" });
  const total = result.totals[metric];
  if (total <= 0) return <p className="py-20 text-center text-sm text-muted-foreground">{t("noDistribution")}</p>;
  return <div className="grid min-w-0 items-center gap-4 sm:grid-cols-2">
    <ChartContainer config={{ value: { label: t(metric) } }} className="mx-auto h-[240px] w-full max-w-[280px] aspect-auto">
      <PieChart><Pie data={visible} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={2} strokeWidth={0} onClick={entry => { if (entry.filter) onCategory(String(entry.filter)); }}>
        {visible.map(entry => <Cell key={entry.filter || "others"} fill={entry.color} />)}
      </Pie><ChartTooltip content={<ChartTooltipContent formatter={(value, name) => <span>{String(name)}: {money(Number(value))}</span>} />} /></PieChart>
    </ChartContainer>
    <div className="min-w-0 space-y-1">{visible.map(entry => <Button key={entry.filter || "others"} variant="ghost" className="h-auto w-full justify-between gap-3 px-2 py-2 text-left font-normal" disabled={!entry.filter} onClick={() => onCategory(entry.filter)}>
      <span className="flex min-w-0 items-center gap-2"><span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} /><span className="truncate">{entry.name}</span></span>
      <span className="shrink-0 text-right"><span className="block text-xs font-medium tabular-nums">{money(entry.value)}</span><span className="text-xs text-muted-foreground">{Math.round(entry.value / total * 100)}%</span></span>
    </Button>)}</div>
  </div>;
}

export function AnalyticsComparison({ result, preferences, money }: Props) {
  const t = useTranslations("transactions.analytics");
  const data = (["income", "expense", "net"] as const).map(key => ({ name: t(key), current: result.totals[key], previous: result.previous[key] }));
  return <ChartContainer config={{ current: { label: t("currentPeriod"), color: "#3b82f6" }, previous: { label: t("previousPeriod"), color: "#94a3b8" } }} className="h-[280px] w-full aspect-auto">
    <BarChart accessibilityLayer data={data} margin={{ left: 0, right: 12 }}><CartesianGrid vertical={false} /><XAxis dataKey="name" tickLine={false} /><YAxis width={60} tickFormatter={value => new Intl.NumberFormat(undefined, { notation: "compact" }).format(Number(value))} /><ReferenceLine y={0} stroke="var(--border)" />
      <ChartTooltip content={<ChartTooltipContent formatter={(value, name) => <span>{t(name === "current" ? "currentPeriod" : "previousPeriod")}: {money(Number(value))}</span>} />} />
      <Legend formatter={name => t(name === "current" ? "currentPeriod" : "previousPeriod")} />
      {preferences.compare && <Bar dataKey="previous" fill="var(--color-previous)" radius={[3, 3, 0, 0]} maxBarSize={44} />}
      <Bar dataKey="current" fill="var(--color-current)" radius={[3, 3, 0, 0]} maxBarSize={44} />
    </BarChart>
  </ChartContainer>;
}
