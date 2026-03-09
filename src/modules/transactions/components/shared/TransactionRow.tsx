"use client";

import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/shared/components/ui/badge";
import { DynamicIcon } from "@/shared/components/DynamicIcon";
import type { IconName } from "@/shared/components/DynamicIcon";
import { getContrastTextColor } from "@/shared/utils";
import { cn } from "@/shared/lib/utils";
import type { Transaction } from "../../types/transactions.types";

interface TransactionRowProps {
  transaction: Transaction;
  onClick?: (transaction: Transaction) => void;
}

function formatCurrency(amount: number, locale: string) {
  return new Intl.NumberFormat(locale === "pt" ? "pt-BR" : "en-US", {
    style: "currency",
    currency: locale === "pt" ? "BRL" : "USD",
  }).format(amount);
}

function getCategoryDisplay(transaction: Transaction) {
  if (transaction.category) {
    return {
      color: transaction.category.color,
      icon: transaction.category.icon,
      name: transaction.category.name,
    };
  }
  switch (transaction.type) {
    case "INVOICEPAYMENT":
      return { color: "#22c55e", icon: "banknote", name: "" };
    case "TRANSFERENCE":
      return { color: "#3b82f6", icon: "arrowLeftRight", name: "" };
    default:
      return { color: "#6b7280", icon: "moreHorizontal", name: "" };
  }
}

function getAmountColor(type: Transaction["type"]): string {
  switch (type) {
    case "INCOME":
    case "INVOICEPAYMENT":
      return "text-green-600 dark:text-green-400";
    case "EXPENSE":
    case "CREDITEXPENSE":
      return "text-red-600 dark:text-red-400";
    default:
      return "text-muted-foreground";
  }
}

function getTypeBadgeClass(type: Transaction["type"]): string {
  switch (type) {
    case "INCOME":
    case "INVOICEPAYMENT":
      return "text-green-600 border-green-200 dark:text-green-400 dark:border-green-800";
    case "EXPENSE":
      return "text-red-600 border-red-200 dark:text-red-400 dark:border-red-800";
    case "CREDITEXPENSE":
      return "text-amber-600 border-amber-200 dark:text-amber-400 dark:border-amber-800";
    case "TRANSFERENCE":
      return "text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800";
    default:
      return "text-muted-foreground border-muted";
  }
}

export function TransactionRow({ transaction, onClick }: TransactionRowProps) {
  const t = useTranslations("transactions");
  const locale = useLocale();
  const dateLocale = locale === "pt" ? ptBR : undefined;

  const categoryDisplay = getCategoryDisplay(transaction);
  const displayLabel = transaction.description || transaction.destination || t("detail.noDescription");
  const amountColorClass = getAmountColor(transaction.type);

  const sign =
    transaction.type === "INCOME" || transaction.type === "INVOICEPAYMENT"
      ? "+"
      : transaction.type === "TRANSFERENCE"
      ? ""
      : "-";

  return (
    <button
      type="button"
      onClick={() => onClick?.(transaction)}
      className="flex w-full items-center gap-3 rounded-md p-3 text-left transition-colors hover:bg-muted/50"
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: categoryDisplay.color }}
      >
        <DynamicIcon
          name={categoryDisplay.icon as IconName}
          className="h-4 w-4"
          style={{ color: getContrastTextColor(categoryDisplay.color) }}
        />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{displayLabel}</span>
          {transaction.justForRecord && (
            <Badge variant="outline" className="text-xs text-muted-foreground shrink-0">
              {t("detail.justForRecord")}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {categoryDisplay.name && (
            <>
              <span className="truncate">{categoryDisplay.name}</span>
              <span>·</span>
            </>
          )}
          {transaction.account && (
            <>
              <span className="truncate">{transaction.account.bank || transaction.account.description}</span>
              <span>·</span>
            </>
          )}
          <span className="shrink-0 font-bold">
            {(() => { const d = new Date(transaction.purchaseDate); return isValid(d) ? format(d, "dd/MM/yyyy", { locale: dateLocale }) : "—"; })()}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className={cn("text-sm font-semibold tabular-nums", amountColorClass)}>
          {sign}{formatCurrency(transaction.amount, locale)}
        </span>
        <Badge variant="outline" className={cn("text-xs", getTypeBadgeClass(transaction.type))}>
          {t(`types.${transaction.type}` as Parameters<typeof t>[0])}
        </Badge>
      </div>
    </button>
  );
}
