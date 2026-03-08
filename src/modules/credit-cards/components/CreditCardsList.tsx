"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { CreditCard, Pencil } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import { getColoredBadgeStyle } from "@/shared/utils";
import type { CreditCard as CreditCardType } from "../types/creditCards.types";

interface CreditCardsListProps {
  creditCards: CreditCardType[];
  isLoading: boolean;
  onCreate?: () => void;
  onEdit: (card: CreditCardType) => void;
}

export function CreditCardsList({
  creditCards,
  isLoading,
  onCreate,
  onEdit,
}: CreditCardsListProps) {
  const locale = useLocale();
  const t = useTranslations("creditCards");
  const router = useRouter();

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale === "pt" ? "pt-BR" : "en-US", {
        style: "currency",
        currency: "BRL",
      }),
    [locale],
  );

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (creditCards.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CreditCard className="size-6" />
              </EmptyMedia>
              <EmptyTitle>{t("empty.title")}</EmptyTitle>
              <EmptyDescription>{t("empty.description")}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              {onCreate && <Button onClick={onCreate}>{t("actionLabel")}</Button>}
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {creditCards.map((card) => {
        const usagePercent =
          card.totalLimit > 0
            ? Math.min(100, Math.round((card.usedLimit / card.totalLimit) * 100))
            : 0;
        const available = card.totalLimit - card.usedLimit;
        const bankBadgeStyle = getColoredBadgeStyle(card.account.color);
        const description = card.description?.trim() || t("card.noDescription");

        return (
          <Card
            key={card.id}
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => router.push(`/${locale}/credit-cards/${card.id}/invoices`)}
          >
            <CardContent className="flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <span className="line-clamp-1 font-medium">{description}</span>
                </div>
                <Badge
                  variant="outline"
                  className="shrink-0 rounded-md border px-2 py-0.5 text-xs"
                  style={bankBadgeStyle}
                >
                  {card.account.bank}
                </Badge>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{t("card.used")}</span>
                  <span>{usagePercent}%</span>
                </div>
                <Progress value={usagePercent} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">{t("card.available")}</p>
                  <p className="font-semibold text-green-600 dark:text-green-400">
                    {currencyFormatter.format(available)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("card.limit")}</p>
                  <p className="font-medium">{currencyFormatter.format(card.totalLimit)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t pt-2">
                <p className="text-xs text-muted-foreground">
                  {t("card.closeDay", { day: card.closeDay })}
                  {" · "}
                  {t("card.dueDay", { day: card.dueDay })}
                </p>
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label={t("actions.edit")}
                  title={t("actions.edit")}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(card);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
