"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { isValid, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import type { InvestmentHistory } from "../types/investments.types";

interface InvestmentChartsProps {
  histories: InvestmentHistory[];
}

const TYPE_COLORS: Record<string, string> = {
  INVEST: "#10b981",
  WITHDRAW: "#f43f5e",
  ADJUSTMENT: "#3b82f6",
  YIELD: "#8b5cf6",
};

export function InvestmentCharts({ histories }: InvestmentChartsProps) {
  const t = useTranslations("investments");
  const locale = useLocale();
  const dateLocale = locale === "pt" ? ptBR : undefined;

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale === "pt" ? "pt-BR" : "en-US", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
      }),
    [locale],
  );

  const sorted = useMemo(
    () =>
      [...histories]
        .filter((h) => isValid(new Date(h.occurredAt)))
        .sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()),
    [histories],
  );

  const lineData = useMemo(
    () =>
      sorted.map((h) => ({
        date: format(new Date(h.occurredAt), "dd MMM yy", { locale: dateLocale }),
        value: h.totalValue,
      })),
    [sorted, dateLocale],
  );

  const pieData = useMemo(() => {
    const totals: Record<string, number> = { INVEST: 0, WITHDRAW: 0, ADJUSTMENT: 0, YIELD: 0 };
    for (const h of sorted) {
      totals[h.type] = (totals[h.type] ?? 0) + Math.abs(h.changeAmount);
    }
    return Object.entries(totals)
      .filter(([, val]) => val > 0)
      .map(([type, value]) => ({ name: t(`history.types.${type.toLowerCase() as "invest" | "withdraw" | "adjustment" | "yield"}`), value, type }));
  }, [sorted, t]);

  if (sorted.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {t("charts.noData")}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Line chart — balance evolution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t("charts.evolution")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={lineData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                className="fill-muted-foreground"
              />
              <YAxis
                tickFormatter={(v: number) => currencyFormatter.format(v)}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={80}
                className="fill-muted-foreground"
              />
              <Tooltip
                formatter={(value: number) => [currencyFormatter.format(value), t("charts.balance")]}
                contentStyle={{ fontSize: 12 }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pie chart — distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t("charts.distribution")}</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }: { name: string; percent: number }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {pieData.map((entry) => (
                  <Cell key={entry.type} fill={TYPE_COLORS[entry.type] ?? "#94a3b8"} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [currencyFormatter.format(value)]}
                contentStyle={{ fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
