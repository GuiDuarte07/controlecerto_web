"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { Badge } from "@/shared/components/ui/badge";
import type { CreditCardSummary } from "../types";

interface CreditCardsOverviewProps {
  creditCards: CreditCardSummary[];
}

export function CreditCardsOverview({ creditCards }: CreditCardsOverviewProps) {
  const t = useTranslations("dashboard");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (creditCards.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("creditCards.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t("creditCards.empty")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("creditCards.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {creditCards.map((card) => {
            const usagePercentage = card.usagePercentage;
            const isHighUsage = usagePercentage > 80;
            const isCriticalUsage = usagePercentage > 95;

            return (
              <div key={card.id} className="space-y-3 rounded-lg border p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{card.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {card.accountBank}
                    </p>
                  </div>
                  <Badge
                    variant={
                      isCriticalUsage
                        ? "destructive"
                        : isHighUsage
                        ? "default"
                        : "secondary"
                    }
                  >
                    {usagePercentage.toFixed(0)}% {t("creditCards.used")}
                  </Badge>
                </div>
                <Progress
                  value={usagePercentage}
                  className="h-2"
                />
                <div className="flex justify-between text-sm">
                  <div>
                    <p className="text-muted-foreground">
                      {t("creditCards.used")}
                    </p>
                    <p className="font-semibold">
                      {formatCurrency(card.usedLimit)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground">
                      {t("creditCards.available")}
                    </p>
                    <p className="font-semibold">
                      {formatCurrency(card.availableLimit)}
                    </p>
                  </div>
                </div>
                {card.currentInvoiceAmount > 0 && (
                  <div className="border-t pt-2">
                    <p className="text-xs text-muted-foreground">
                      {t("creditCards.currentInvoice")}:{" "}
                      <span className="font-semibold text-foreground">
                        {formatCurrency(card.currentInvoiceAmount)}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
