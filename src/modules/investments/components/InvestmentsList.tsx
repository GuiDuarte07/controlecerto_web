"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { TrendingUp, ChevronRight } from "lucide-react";
import { isValid } from "date-fns";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import type { Investment } from "../types/investments.types";

interface InvestmentsListProps {
  investments: Investment[];
  isLoading: boolean;
  onCreate?: () => void;
  locale: string;
}

export function InvestmentsList({ investments, isLoading, onCreate, locale }: InvestmentsListProps) {
  const t = useTranslations("investments");
  const currentLocale = useLocale();
  const router = useRouter();

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(currentLocale === "pt" ? "pt-BR" : "en-US", {
        style: "currency",
        currency: "BRL",
      }),
    [currentLocale],
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (investments.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia>
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
          </EmptyMedia>
        </EmptyHeader>
        <EmptyContent>
          <EmptyTitle>{t("empty.title")}</EmptyTitle>
          <EmptyDescription>{t("empty.description")}</EmptyDescription>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {investments.map((investment) => {
        const startDate = new Date(investment.startDate);
        const dateLabel = isValid(startDate)
          ? startDate.toLocaleDateString(currentLocale === "pt" ? "pt-BR" : "en-US")
          : "—";

        return (
          <Card
            key={investment.id}
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => router.push(`/${locale}/investments/${investment.id}`)}
          >
            <CardContent className="flex items-center justify-between gap-4 p-4">
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="truncate font-semibold">{investment.name}</p>
                {investment.description && (
                  <p className="truncate text-xs text-muted-foreground">
                    {investment.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {t("list.since")} {dateLabel}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <p className="text-base font-bold text-primary">
                  {currencyFormatter.format(investment.currentValue)}
                </p>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
