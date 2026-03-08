"use client";

import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/shared/lib/utils";
import type { StatementSummary } from "../../types/transactions.types";

interface StatementSummaryBarProps {
  summary: StatementSummary;
}

function formatCurrency(amount: number, locale: string) {
  return new Intl.NumberFormat(locale === "pt" ? "pt-BR" : "en-US", {
    style: "currency",
    currency: locale === "pt" ? "BRL" : "USD",
  }).format(amount);
}

export function StatementSummaryBar({ summary }: StatementSummaryBarProps) {
  const t = useTranslations("transactions");
  const locale = useLocale();

  const items = [
    {
      label: t("statement.summary.income"),
      value: summary.totalIncome,
      colorClass: "text-green-600 dark:text-green-400",
    },
    {
      label: t("statement.summary.expense"),
      value: summary.totalExpense,
      colorClass: "text-red-600 dark:text-red-400",
    },
    {
      label: t("statement.summary.creditCharges"),
      value: summary.totalCreditCharges,
      colorClass: "text-amber-600 dark:text-amber-400",
    },
    {
      label: t("statement.summary.invoicePayments"),
      value: summary.totalInvoicePayments,
      colorClass: "text-blue-600 dark:text-blue-400",
    },
    {
      label: t("statement.summary.netBalance"),
      value: summary.netBalance,
      colorClass:
        summary.netBalance >= 0
          ? "text-green-600 dark:text-green-400"
          : "text-red-600 dark:text-red-400",
    },
  ];

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex min-w-28 shrink-0 flex-col gap-1 rounded-lg border bg-card p-3"
        >
          <span className="text-xs text-muted-foreground whitespace-nowrap">{item.label}</span>
          <span className={cn("text-sm font-bold tabular-nums whitespace-nowrap", item.colorClass)}>
            {formatCurrency(item.value, locale)}
          </span>
        </div>
      ))}
    </div>
  );
}
