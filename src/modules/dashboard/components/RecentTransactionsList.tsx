"use client";

import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { DynamicIcon } from "@/shared/components/DynamicIcon";
import type { RecentTransaction } from "../types";
import {
  getContrastTextColor,
  normalizeHexColor,
} from "@/shared/utils/colors";

interface RecentTransactionsListProps {
  transactions: RecentTransaction[];
}

export function RecentTransactionsList({
  transactions,
}: RecentTransactionsListProps) {
  const t = useTranslations("dashboard");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM", { locale: ptBR });
  };

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("recentTransactions.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t("recentTransactions.empty")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("recentTransactions.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((transaction) => {
            const normalizedColor = normalizeHexColor(transaction.categoryColor);
            const textColor = getContrastTextColor(normalizedColor);
            const isIncome = transaction.type === "INCOME";

            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: normalizedColor,
                      color: textColor,
                    }}
                  >
                    <DynamicIcon
                      name={transaction.categoryIcon}
                      className="h-5 w-5"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">
                      {transaction.description}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        {transaction.categoryName}
                      </p>
                      <span className="text-xs text-muted-foreground">•</span>
                      <p className="text-xs text-muted-foreground">
                        {transaction.accountBank}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-semibold ${
                      isIncome ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isIncome ? "+" : "-"}
                    {formatCurrency(Math.abs(transaction.amount))}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(transaction.purchaseDate)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
