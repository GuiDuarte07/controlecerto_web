"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { isValid } from "date-fns";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  SlidersHorizontal,
  Pencil,
  Trash2,
  TriangleAlert,
  ChevronLeft,
} from "lucide-react";
import { usePageHeader } from "@/shared/hooks/use-page-header";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { useInvestmentDetail } from "../hooks/useInvestments.hooks";
import { InvestmentHistoryTimeline } from "./InvestmentHistoryTimeline";
import { InvestmentCharts } from "./InvestmentCharts";
import { DepositWithdrawDialog } from "./DepositWithdrawDialog";
import { AdjustDialog } from "./AdjustDialog";
import { EditInvestmentDialog } from "./EditInvestmentDialog";
import type { DepositWithdrawFormData, AdjustFormData, EditInvestmentFormData } from "../schemas/investments.schemas";

interface InvestmentDetailPageContentProps {
  investmentId: number;
}

export function InvestmentDetailPageContent({ investmentId }: InvestmentDetailPageContentProps) {
  const t = useTranslations("investments");
  const locale = useLocale();
  const router = useRouter();

  const [activeDialog, setActiveDialog] = useState<"deposit" | "withdraw" | "adjust" | "edit" | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const {
    investment,
    isLoading,
    isSubmitting,
    error,
    deposit,
    withdraw,
    adjust,
    update,
    remove,
    clearError,
  } = useInvestmentDetail(investmentId);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale === "pt" ? "pt-BR" : "en-US", {
        style: "currency",
        currency: "BRL",
      }),
    [locale],
  );

  const handleBack = useCallback(() => {
    router.push(`/${locale}/investments`);
  }, [router, locale]);

  const handleOpenDialog = useCallback((dialog: typeof activeDialog) => {
    clearError();
    setActiveDialog(dialog);
  }, [clearError]);

  usePageHeader({
    title: investment?.name ?? t("detail.title"),
    description: investment?.description ?? undefined,
  });

  const handleDeposit = async (data: DepositWithdrawFormData) => {
    await deposit(data);
    setActiveDialog(null);
  };

  const handleWithdraw = async (data: DepositWithdrawFormData) => {
    await withdraw(data);
    setActiveDialog(null);
  };

  const handleAdjust = async (data: AdjustFormData) => {
    await adjust(data);
    setActiveDialog(null);
  };

  const handleEdit = async (data: EditInvestmentFormData) => {
    await update(data);
    setActiveDialog(null);
  };

  const handleDelete = async () => {
    await remove();
    router.push(`/${locale}/investments`);
  };

  const histories = investment?.histories ?? [];

  return (
    <section className="flex flex-col gap-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-2 gap-1.5 text-muted-foreground"
          onClick={handleBack}
        >
          <ChevronLeft className="h-4 w-4" />
          {t("detail.back")}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>{t("feedback.errorTitle")}</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {/* Investment summary card */}
      {isLoading ? (
        <Skeleton className="h-36 w-full rounded-xl" />
      ) : investment ? (
        <Card>
          <CardContent className="flex flex-col gap-4 p-4 sm:p-6">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">{t("detail.currentValue")}</p>
              <p className="text-3xl font-bold text-primary">
                {currencyFormatter.format(investment.currentValue)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">{t("fields.startDate")}</p>
                <p className="font-medium">
                  {(() => {
                    const d = new Date(investment.startDate);
                    return isValid(d)
                      ? d.toLocaleDateString(locale === "pt" ? "pt-BR" : "en-US")
                      : "—";
                  })()}
                </p>
              </div>
              {investment.description && (
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-xs text-muted-foreground">{t("fields.description")}</p>
                  <p className="font-medium line-clamp-2">{investment.description}</p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-emerald-600 hover:text-emerald-700"
                onClick={() => handleOpenDialog("deposit")}
                disabled={isSubmitting}
              >
                <ArrowDownCircle className="h-4 w-4" />
                <span className="hidden sm:inline">{t("actions.deposit")}</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-rose-600 hover:text-rose-700"
                onClick={() => handleOpenDialog("withdraw")}
                disabled={isSubmitting}
              >
                <ArrowUpCircle className="h-4 w-4" />
                <span className="hidden sm:inline">{t("actions.withdraw")}</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-blue-600 hover:text-blue-700"
                onClick={() => handleOpenDialog("adjust")}
                disabled={isSubmitting}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">{t("actions.adjust")}</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleOpenDialog("edit")}
                disabled={isSubmitting}
                className="gap-1.5"
              >
                <Pencil className="h-4 w-4" />
                <span className="hidden sm:inline">{t("actions.edit")}</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-destructive hover:text-destructive"
                onClick={() => setIsDeleteOpen(true)}
                disabled={isSubmitting}
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">{t("actions.delete")}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Tabs: history | charts */}
      {!isLoading && investment && (
        <Tabs defaultValue="history">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="history" className="flex-1 sm:flex-none">
              {t("tabs.history")}
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex-1 sm:flex-none">
              {t("tabs.charts")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="mt-4">
            <InvestmentHistoryTimeline histories={histories} />
          </TabsContent>

          <TabsContent value="charts" className="mt-4">
            <InvestmentCharts histories={histories} />
          </TabsContent>
        </Tabs>
      )}

      {/* Dialogs */}
      {investment && (
        <>
          <DepositWithdrawDialog
            open={activeDialog === "deposit"}
            mode="deposit"
            isSubmitting={isSubmitting}
            onClose={() => setActiveDialog(null)}
            onSubmit={handleDeposit}
          />
          <DepositWithdrawDialog
            open={activeDialog === "withdraw"}
            mode="withdraw"
            isSubmitting={isSubmitting}
            onClose={() => setActiveDialog(null)}
            onSubmit={handleWithdraw}
          />
          <AdjustDialog
            open={activeDialog === "adjust"}
            currentValue={investment.currentValue}
            isSubmitting={isSubmitting}
            onClose={() => setActiveDialog(null)}
            onSubmit={handleAdjust}
          />
          <EditInvestmentDialog
            open={activeDialog === "edit"}
            investment={investment}
            isSubmitting={isSubmitting}
            onClose={() => setActiveDialog(null)}
            onSubmit={handleEdit}
          />
        </>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("delete.description", { name: investment?.name ?? "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("actions.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDelete()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("actions.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
