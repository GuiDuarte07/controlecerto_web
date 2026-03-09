"use client";

import { useCallback, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Plus, TriangleAlert } from "lucide-react";
import { usePageHeader } from "@/shared/hooks/use-page-header";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useInvestmentsList } from "../hooks/useInvestments.hooks";
import { useInvestmentsStore } from "../context/investmentsContext";
import { InvestmentsList } from "./InvestmentsList";
import { CreateInvestmentDialog } from "./CreateInvestmentDialog";
import type { CreateInvestmentFormData } from "../schemas/investments.schemas";

export function InvestmentsPageContent() {
  const t = useTranslations("investments");
  const locale = useLocale();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { investments, isLoading, error } = useInvestmentsList();
  const isSubmitting = useInvestmentsStore((s) => s.isSubmitting);
  const create = useInvestmentsStore((s) => s.create);
  const clearError = useInvestmentsStore((s) => s.clearError);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale === "pt" ? "pt-BR" : "en-US", {
        style: "currency",
        currency: "BRL",
      }),
    [locale],
  );

  const totalValue = useMemo(
    () => investments.reduce((sum, inv) => sum + inv.currentValue, 0),
    [investments],
  );

  const handleOpenCreate = useCallback(() => {
    clearError();
    setIsCreateDialogOpen(true);
  }, [clearError]);

  usePageHeader({
    title: t("title"),
    description: t("description"),
    actionLabel: t("actions.create"),
    actionIcon: Plus,
    onAction: handleOpenCreate,
  });

  const handleCreate = async (data: CreateInvestmentFormData) => {
    await create(data);
    setIsCreateDialogOpen(false);
  };

  return (
    <section className="flex flex-col gap-6">
      {error && (
        <Alert variant="destructive">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>{t("feedback.errorTitle")}</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {/* Totalizer */}
      {isLoading ? (
        <Skeleton className="h-20 w-full rounded-xl" />
      ) : investments.length > 0 ? (
        <Card>
          <CardContent className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t("summary.total")}</p>
              <p className="text-2xl font-bold text-primary">
                {currencyFormatter.format(totalValue)}
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              {t("summary.count", { count: investments.length })}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <InvestmentsList
        investments={investments}
        isLoading={isLoading}
        onCreate={handleOpenCreate}
        locale={locale}
      />

      <CreateInvestmentDialog
        open={isCreateDialogOpen}
        isSubmitting={isSubmitting}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreate}
      />
    </section>
  );
}
