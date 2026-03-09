"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import { MonthNavigator } from "@/shared/components/MonthNavigator";
import { useTransactionsStore } from "../../context/transactionsContext";

interface InvoiceMonthNavProps {
  date: Date;
  onPrev: () => void;
  onNext: () => void;
}

export function InvoiceMonthNav({ date, onPrev, onNext }: InvoiceMonthNavProps) {
  const locale = useLocale();
  const t = useTranslations("transactions");
  const dateLocale = locale === "pt" ? ptBR : undefined;
  const setInvoiceMonth = useTransactionsStore((s) => s.setInvoiceMonth);

  const label = format(date, "MMMM yyyy", { locale: dateLocale });
  const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1);

  return (
    <MonthNavigator
      label={capitalizedLabel}
      onPrev={onPrev}
      onNext={onNext}
      prevAriaLabel={t("invoice.prevMonth" as Parameters<typeof t>[0])}
      nextAriaLabel={t("invoice.nextMonth" as Parameters<typeof t>[0])}
      date={date}
      onSelect={(year, month) => setInvoiceMonth(year, month)}
    />
  );
}
