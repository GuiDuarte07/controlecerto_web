"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { Badge } from "@/shared/components/ui/badge";
import { DynamicIcon } from "@/shared/components/DynamicIcon";
import type { CategoryExpense } from "../types";
import {
  getContrastTextColor,
  normalizeHexColor,
} from "@/shared/utils/colors";

interface ExpensesByCategoryProps {
  expenses: CategoryExpense[];
}

export function ExpensesByCategory({ expenses }: ExpensesByCategoryProps) {
  const t = useTranslations("dashboard");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (expenses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("expensesByCategory.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t("expensesByCategory.empty")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("expensesByCategory.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {expenses.slice(0, 8).map((expense) => {
            const normalizedColor = normalizeHexColor(expense.categoryColor);
            const textColor = getContrastTextColor(normalizedColor);
            const hasLimit = expense.categoryLimit !== null;
            const limitPercentage = expense.limitUsagePercentage || 0;

            return (
              <div key={expense.categoryId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: normalizedColor,
                        color: textColor,
                      }}
                    >
                      <DynamicIcon name={expense.categoryIcon} className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">
                        {expense.categoryName}
                      </p>
                      {expense.parentCategoryName && (
                        <p className="text-xs text-muted-foreground">
                          {expense.parentCategoryName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {formatCurrency(expense.totalAmount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {expense.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <Progress value={expense.percentage} className="h-2" />
                {hasLimit && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {t("expensesByCategory.limit")}: {formatCurrency(expense.categoryLimit!)}
                    </span>
                    <Badge
                      variant={limitPercentage > 100 ? "destructive" : limitPercentage > 80 ? "default" : "secondary"}
                    >
                      {limitPercentage.toFixed(0)}% {t("expensesByCategory.used")}
                    </Badge>
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
