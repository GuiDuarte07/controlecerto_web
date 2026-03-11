"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import type { AccountSummary } from "../types";
import {
  getContrastTextColor,
  normalizeHexColor,
} from "@/shared/utils/colors";

interface AccountsOverviewProps {
  accounts: AccountSummary[];
}

export function AccountsOverview({ accounts }: AccountsOverviewProps) {
  const t = useTranslations("dashboard");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (accounts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("accounts.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t("accounts.empty")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("accounts.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {accounts.map((account) => {
            const normalizedColor = normalizeHexColor(account.color);
            const textColor = getContrastTextColor(normalizedColor);

            return (
              <div
                key={account.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full font-semibold"
                    style={{
                      backgroundColor: normalizedColor,
                      color: textColor,
                    }}
                  >
                    {account.bank.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{account.bank}</p>
                    {account.description && (
                      <p className="text-xs text-muted-foreground">
                        {account.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {formatCurrency(account.balance)}
                  </p>
                  <div className="mt-1 flex gap-1">
                    <Badge variant="outline" className="text-xs">
                      {account.transactionCount} {t("accounts.transactions")}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
