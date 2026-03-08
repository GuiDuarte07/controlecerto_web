"use client";

import { TrendingDown, TrendingUp, CreditCard, ArrowLeftRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/lib/utils";
import type { TransactionType } from "../types/transactions.types";

type SelectableType = "EXPENSE" | "INCOME" | "CREDITEXPENSE" | "TRANSFERENCE";

interface TransactionTypeSelectorProps {
  onSelect: (type: SelectableType) => void;
}

interface TypeOption {
  type: SelectableType;
  icon: React.ReactNode;
  labelKey: string;
  colorClass: string;
  bgClass: string;
}

export function TransactionTypeSelector({ onSelect }: TransactionTypeSelectorProps) {
  const t = useTranslations("transactions");

  const options: TypeOption[] = [
    {
      type: "EXPENSE",
      icon: <TrendingDown className="h-8 w-8" />,
      labelKey: "create.expense",
      colorClass: "text-red-600 dark:text-red-400",
      bgClass: "hover:bg-red-50 dark:hover:bg-red-950 border-red-100 dark:border-red-900",
    },
    {
      type: "INCOME",
      icon: <TrendingUp className="h-8 w-8" />,
      labelKey: "create.income",
      colorClass: "text-green-600 dark:text-green-400",
      bgClass: "hover:bg-green-50 dark:hover:bg-green-950 border-green-100 dark:border-green-900",
    },
    {
      type: "CREDITEXPENSE",
      icon: <CreditCard className="h-8 w-8" />,
      labelKey: "create.creditCard",
      colorClass: "text-amber-600 dark:text-amber-400",
      bgClass: "hover:bg-amber-50 dark:hover:bg-amber-950 border-amber-100 dark:border-amber-900",
    },
    {
      type: "TRANSFERENCE",
      icon: <ArrowLeftRight className="h-8 w-8" />,
      labelKey: "create.transference",
      colorClass: "text-blue-600 dark:text-blue-400",
      bgClass: "hover:bg-blue-50 dark:hover:bg-blue-950 border-blue-100 dark:border-blue-900",
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">{t("create.selectType")}</p>
      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => (
          <button
            key={option.type}
            type="button"
            onClick={() => onSelect(option.type)}
            className={cn(
              "flex flex-col items-center justify-center gap-2 rounded-lg border p-6 transition-colors cursor-pointer",
              option.bgClass,
            )}
          >
            <span className={option.colorClass}>{option.icon}</span>
            <span className={cn("text-sm font-medium", option.colorClass)}>
              {t(option.labelKey as Parameters<typeof t>[0])}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
