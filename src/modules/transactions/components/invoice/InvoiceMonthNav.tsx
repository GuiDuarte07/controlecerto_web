"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/shared/components/ui/button";

interface InvoiceMonthNavProps {
  date: Date;
  onPrev: () => void;
  onNext: () => void;
}

export function InvoiceMonthNav({ date, onPrev, onNext }: InvoiceMonthNavProps) {
  const locale = useLocale();
  const t = useTranslations("transactions");
  const dateLocale = locale === "pt" ? ptBR : undefined;

  const label = format(date, "MMMM yyyy", { locale: dateLocale });
  const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1);

  return (
    <div className="flex items-center justify-center gap-3">
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onPrev}
        className="h-9 w-9"
        aria-label={t("invoice.prevMonth" as Parameters<typeof t>[0])}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="min-w-40 text-center text-base font-semibold">{capitalizedLabel}</span>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onNext}
        className="h-9 w-9"
        aria-label={t("invoice.nextMonth" as Parameters<typeof t>[0])}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
