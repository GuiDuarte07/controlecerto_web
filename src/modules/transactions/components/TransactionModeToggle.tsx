"use client";

import { useTranslations } from "next-intl";
import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group";
import type { TransactionMode } from "../types/transactions.types";

interface TransactionModeToggleProps {
  mode: TransactionMode;
  onModeChange: (mode: TransactionMode) => void;
}

export function TransactionModeToggle({ mode, onModeChange }: TransactionModeToggleProps) {
  const t = useTranslations("transactions");

  return (
    <ToggleGroup
      type="single"
      value={mode}
      onValueChange={(value) => {
        if (value) onModeChange(value as TransactionMode);
      }}
      variant="outline"
      className="w-full flex-wrap justify-start sm:w-fit"
    >
      <ToggleGroupItem value="invoice" className="text-xs sm:text-sm">
        {t("modeInvoice")}
      </ToggleGroupItem>
      <ToggleGroupItem value="statement" className="text-xs sm:text-sm">
        {t("modeStatement")}
      </ToggleGroupItem>
      <ToggleGroupItem value="analytics" className="text-xs sm:text-sm">
        {t("analytics.title")}
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
