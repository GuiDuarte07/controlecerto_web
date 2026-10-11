"use client";

import { useTranslations } from "next-intl";
import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group";

export type InvestmentMode = "portfolio" | "analytics";

interface Props {
  mode: InvestmentMode;
  onChange: (mode: InvestmentMode) => void;
}

export function InvestmentModeToggle({ mode, onChange }: Props) {
  const t = useTranslations("investments");
  return <ToggleGroup type="single" value={mode} onValueChange={value => { if (value) onChange(value as InvestmentMode); }} variant="outline" className="w-full justify-start sm:w-fit">
    <ToggleGroupItem value="portfolio">{t("modes.portfolio")}</ToggleGroupItem>
    <ToggleGroupItem value="analytics">{t("modes.analytics")}</ToggleGroupItem>
  </ToggleGroup>;
}
