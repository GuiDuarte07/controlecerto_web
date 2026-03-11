"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import type { MonthlyTrend } from "../types";

interface MonthlyTrendsChartProps {
  trends: MonthlyTrend[];
}

export function MonthlyTrendsChart({ trends }: MonthlyTrendsChartProps) {
  const t = useTranslations("dashboard");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const maxValue = Math.max(
    ...trends.map((t) => Math.max(t.totalIncome, t.totalExpense))
  );

  if (trends.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("monthlyTrends.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t("monthlyTrends.empty")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("monthlyTrends.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {trends.slice(-6).map((trend) => {
            const incomePercentage = maxValue > 0 ? (trend.totalIncome / maxValue) * 100 : 0;
            const expensePercentage = maxValue > 0 ? (trend.totalExpense / maxValue) * 100 : 0;
            const isPositive = trend.netBalance >= 0;

            return (
              <div key={`${trend.year}-${trend.month}`} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{trend.monthName}</p>
                    <p className="text-xs text-muted-foreground">
                      {trend.transactionCount} {t("monthlyTrends.transactions")}
                    </p>
                  </div>
                  <Badge variant={isPositive ? "default" : "destructive"}>
                    {formatCurrency(trend.netBalance)}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-20 text-xs text-muted-foreground">
                      {t("monthlyTrends.income")}
                    </div>
                    <div className="flex-1">
                      <div className="h-6 rounded bg-secondary">
                        <div
                          className="h-full rounded bg-green-500 transition-all"
                          style={{ width: `${incomePercentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-24 text-right text-xs font-medium">
                      {formatCurrency(trend.totalIncome)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 text-xs text-muted-foreground">
                      {t("monthlyTrends.expense")}
                    </div>
                    <div className="flex-1">
                      <div className="h-6 rounded bg-secondary">
                        <div
                          className="h-full rounded bg-red-500 transition-all"
                          style={{ width: `${expensePercentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-24 text-right text-xs font-medium">
                      {formatCurrency(trend.totalExpense)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
