"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/shared/lib/utils";
import type { TransactionMode } from "../types/transactions.types";

interface TransactionModeToggleProps {
  mode: TransactionMode;
  onModeChange: (mode: TransactionMode) => void;
}

export function TransactionModeToggle({ mode, onModeChange }: TransactionModeToggleProps) {
  const t = useTranslations("transactions");

  return (
    <div className="flex rounded-lg border bg-muted/30 p-1 w-fit">
      <button
        type="button"
        onClick={() => onModeChange("invoice")}
        className={cn(
          "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
          mode === "invoice"
            ? "bg-background shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {t("modeInvoice")}
      </button>
      <button
        type="button"
        onClick={() => onModeChange("statement")}
        className={cn(
          "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
          mode === "statement"
            ? "bg-background shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {t("modeStatement")}
      </button>
    </div>
  );
}
