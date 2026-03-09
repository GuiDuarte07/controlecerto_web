"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { isValid } from "date-fns";
import { ArrowDownCircle, ArrowUpCircle, SlidersHorizontal, TrendingUp } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import type { InvestmentHistory as InvestmentHistoryType } from "../types/investments.types";

interface InvestmentHistoryProps {
  histories: InvestmentHistoryType[];
}

const TYPE_ICON = {
  INVEST: <ArrowDownCircle className="h-4 w-4 text-emerald-500" />,
  WITHDRAW: <ArrowUpCircle className="h-4 w-4 text-rose-500" />,
  ADJUSTMENT: <SlidersHorizontal className="h-4 w-4 text-blue-500" />,
  YIELD: <TrendingUp className="h-4 w-4 text-violet-500" />,
};

const TYPE_BADGE_CLASS = {
  INVEST: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  WITHDRAW: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  ADJUSTMENT: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  YIELD: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
};

export function InvestmentHistoryTimeline({ histories }: InvestmentHistoryProps) {
  const t = useTranslations("investments");
  const locale = useLocale();

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale === "pt" ? "pt-BR" : "en-US", {
        style: "currency",
        currency: "BRL",
      }),
    [locale],
  );

  const sorted = useMemo(
    () => [...histories].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()),
    [histories],
  );

  if (sorted.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia>
            <TrendingUp className="h-7 w-7 text-muted-foreground" />
          </EmptyMedia>
        </EmptyHeader>
        <EmptyContent>
          <EmptyTitle>{t("history.empty")}</EmptyTitle>
          <EmptyDescription>{t("history.emptyDescription")}</EmptyDescription>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="relative flex flex-col gap-0">
      {sorted.map((entry, index) => {
        const date = new Date(entry.occurredAt);
        const dateLabel = isValid(date)
          ? date.toLocaleDateString(locale === "pt" ? "pt-BR" : "en-US", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "—";

        const isPositive = entry.type === "INVEST" || entry.type === "YIELD";
        const changeSign = entry.type === "WITHDRAW" ? "-" : "+";

        return (
          <div key={entry.id} className="relative flex gap-4 pb-6 last:pb-0">
            {/* vertical line */}
            {index < sorted.length - 1 && (
              <div className="absolute left-[1.375rem] top-8 h-full w-px bg-border" />
            )}

            {/* dot */}
            <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border bg-background">
              {TYPE_ICON[entry.type] ?? TYPE_ICON.INVEST}
            </div>

            <div className="flex flex-1 flex-col gap-1 pt-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={`text-xs font-medium ${TYPE_BADGE_CLASS[entry.type] ?? ""}`}
                >
                  {t(`history.types.${entry.type.toLowerCase() as "invest" | "withdraw" | "adjustment" | "yield"}`)}
                </Badge>
                <span className="text-xs text-muted-foreground">{dateLabel}</span>
              </div>

              <div className="flex flex-wrap items-baseline gap-2">
                <span
                  className={`text-base font-bold ${isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}
                >
                  {changeSign}{currencyFormatter.format(Math.abs(entry.changeAmount))}
                </span>
                <span className="text-xs text-muted-foreground">
                  → {currencyFormatter.format(entry.totalValue)}
                </span>
              </div>

              {entry.note && (
                <p className="text-sm text-muted-foreground">{entry.note}</p>
              )}
              {entry.sourceAccount && (
                <p className="text-xs text-muted-foreground">
                  {t("history.account")}: {entry.sourceAccount.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
