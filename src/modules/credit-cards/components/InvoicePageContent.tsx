"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, TriangleAlert, CreditCard } from "lucide-react";
import { usePageHeader } from "@/shared/hooks/use-page-header";
import { MonthNavigator } from "@/shared/components/MonthNavigator";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Progress } from "@/shared/components/ui/progress";
import { TransactionRow, TransactionDetailSheet, CreateTransactionDialog } from "@/modules/transactions/components";
import type { Transaction } from "@/modules/transactions/types/transactions.types";
import { useCreditCardsStore } from "../context/creditCardsContext";
import { useInvoiceStore } from "../context/invoiceContext";
import { useInvoiceData, useInvoiceNavigation, useInvoiceActions } from "../hooks/useInvoice.hooks";
import { InvoicePaymentsList } from "./InvoicePaymentsList";
import { InvoicePaymentDialog } from "./InvoicePaymentDialog";
import type { InvoicePaymentFormData } from "../schemas/invoicePayment.schemas";
import type { InvoiceTransaction } from "../types/invoice.types";

interface InvoicePageContentProps {
  creditCardId: number;
}

function getInvoiceStatus(isPaid: boolean, closingDate: string): "paid" | "open" | "future" {
  if (isPaid) return "paid";
  const d = new Date(closingDate);
  if (!isValid(d)) return "open";
  if (d > new Date()) return "future";
  return "open";
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  paid: "default",
  open: "secondary",
  future: "outline",
};

function toTransactionRow(tx: InvoiceTransaction): Transaction {
  return {
    id: tx.id,
    type: "CREDITEXPENSE",
    amount: tx.amount,
    purchaseDate: tx.purchaseDate,
    description: tx.description,
    destination: tx.destination ?? undefined,
    observations: tx.observations ?? undefined,
    justForRecord: tx.justForRecord,
    account: tx.account as Transaction["account"],
    category: tx.category
      ? { ...tx.category, billType: 0 }
      : { id: 0, name: "", icon: "moreHorizontal", color: "#6b7280", billType: 0 },
  };
}

export function InvoicePageContent({ creditCardId }: InvoicePageContentProps) {
  const t = useTranslations("invoices");
  const locale = useLocale();
  const dateLocale = locale === "pt" ? ptBR : undefined;

  const [selectedInvoiceTx, setSelectedInvoiceTx] = useState<InvoiceTransaction | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [editingPurchaseTx, setEditingPurchaseTx] = useState<InvoiceTransaction | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPurchaseEditDialogOpen, setIsPurchaseEditDialogOpen] = useState(false);

  const { currentInvoice, browsedDate, isLoading, error } = useInvoiceData(creditCardId);
  const loadById = useInvoiceStore((s) => s.loadById);
  const loadByDate = useInvoiceStore((s) => s.loadByDate);
  const { navigateNext, navigatePrev, hasNext, hasPrev, isLoading: navLoading } =
    useInvoiceNavigation();

  const {
    isSubmitting,
    isPaymentDialogOpen,
    updatePurchase,
    deletePurchase,
    payInvoice,
    deletePayment,
    openPaymentDialog,
    closePaymentDialog,
    clearError,
  } = useInvoiceActions();

  const creditCard = useCreditCardsStore((s) =>
    s.creditCards.find((c) => c.id === creditCardId),
  );

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale === "pt" ? "pt-BR" : "en-US", {
        style: "currency",
        currency: "BRL",
      }),
    [locale],
  );

  const handleCreatePurchase = useCallback(() => {
    clearError();
    setIsCreateDialogOpen(true);
  }, [clearError]);

  usePageHeader({
    title: t("title"),
    description: creditCard?.description ?? currentInvoice?.creditCard.description,
    actionLabel: t("actions.newPurchase"),
    actionIcon: Plus,
    onAction: handleCreatePurchase,
  });

  const invoiceStatus = currentInvoice
    ? getInvoiceStatus(currentInvoice.isPaid, currentInvoice.closingDate)
    : null;

  const remainingAmount = currentInvoice
    ? Math.max(0, currentInvoice.totalAmount - currentInvoice.totalPaid)
    : 0;

  const paidPercent =
    currentInvoice && currentInvoice.totalAmount > 0
      ? Math.min(100, Math.round((currentInvoice.totalPaid / currentInvoice.totalAmount) * 100))
      : 0;

  const handlePaymentSubmit = async (data: InvoicePaymentFormData) => {
    await payInvoice(data);
  };

  const activeDate = (() => {
    if (currentInvoice) {
      const d = new Date(currentInvoice.invoiceDate);
      return isValid(d) ? d : null;
    }
    return browsedDate ?? null;
  })();

  const monthLabel = activeDate
    ? (() => {
        const label = format(activeDate, "MMMM yyyy", { locale: dateLocale });
        return label.charAt(0).toUpperCase() + label.slice(1);
      })()
    : "—";

  return (
    <section className="flex flex-col gap-6">
      {error && (
        <Alert variant="destructive">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>{t("feedback.errorTitle")}</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {/* Month navigation */}
      <MonthNavigator
        label={isLoading ? "" : monthLabel}
        onPrev={navigatePrev}
        onNext={navigateNext}
        hasPrev={hasPrev}
        hasNext={hasNext}
        isLoading={isLoading || navLoading}
        prevAriaLabel={t("monthNav.previous")}
        nextAriaLabel={t("monthNav.next")}
        date={activeDate ?? undefined}
        onSelect={(year, month) => void loadByDate(creditCardId, year, month)}
      />

      {/* Invoice summary */}
      {isLoading ? (
        <Skeleton className="h-44 w-full rounded-lg" />
      ) : currentInvoice ? (
        <Card>
          <CardContent className="flex flex-col gap-4 p-4 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">{t("summary.total")}</p>
                <p className="text-2xl font-bold">
                  {currencyFormatter.format(currentInvoice.totalAmount)}
                </p>
              </div>
              {invoiceStatus && (
                <Badge variant={STATUS_VARIANT[invoiceStatus]} className="mt-1">
                  {t(`status.${invoiceStatus}`)}
                </Badge>
              )}
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>{t("summary.paid")}: {currencyFormatter.format(currentInvoice.totalPaid)}</span>
                <span>{paidPercent}%</span>
              </div>
              <Progress value={paidPercent} className="h-2" />
              <p className="mt-1 text-right text-xs text-muted-foreground">
                {t("summary.remaining")}: {currencyFormatter.format(remainingAmount)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">{t("summary.closingDate")}</p>
                <p className="font-medium">
                  {(() => { const d = new Date(currentInvoice.closingDate); return isValid(d) ? format(d, "dd/MM/yyyy", { locale: dateLocale }) : "—"; })()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("summary.dueDate")}</p>
                <p className="font-medium">
                  {(() => { const d = new Date(currentInvoice.dueDate); return isValid(d) ? format(d, "dd/MM/yyyy", { locale: dateLocale }) : "—"; })()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
            <CreditCard className="h-8 w-8 text-muted-foreground" />
            <p className="font-medium">{t("noInvoice.title")}</p>
            <p className="text-sm text-muted-foreground">{t("noInvoice.description")}</p>
          </CardContent>
        </Card>
      )}

      {/* Purchases */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t("expenses.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-md" />)}
            </div>
          ) : !currentInvoice?.transactions?.length ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t("expenses.empty")}
            </p>
          ) : (
            <div className="flex flex-col divide-y rounded-lg border">
              {currentInvoice.transactions.map((tx) => (
                <TransactionRow
                  key={tx.id}
                  transaction={toTransactionRow(tx)}
                  onClick={() => {
                    setSelectedInvoiceTx(tx);
                    setIsDetailSheetOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <TransactionDetailSheet
        open={isDetailSheetOpen}
        transaction={selectedInvoiceTx ? toTransactionRow(selectedInvoiceTx) : null}
        onClose={() => {
          setIsDetailSheetOpen(false);
          setSelectedInvoiceTx(null);
        }}
        onEdit={() => {
          setIsDetailSheetOpen(false);
          if (selectedInvoiceTx) {
            setEditingPurchaseTx(selectedInvoiceTx);
            setIsPurchaseEditDialogOpen(true);
          }
        }}
        onDelete={async () => {
          if (selectedInvoiceTx) {
            await deletePurchase(selectedInvoiceTx.id);
            setIsDetailSheetOpen(false);
            setSelectedInvoiceTx(null);
          }
        }}
      />

      {/* Payments */}
      {currentInvoice && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t("payments.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <InvoicePaymentsList
              payments={currentInvoice.invoicePayments ?? []}
              isSubmitting={isSubmitting}
              onDelete={(id) => void deletePayment(id)}
              onAdd={openPaymentDialog}
            />
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <CreateTransactionDialog
        open={isCreateDialogOpen}
        mode="create"
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={() => { if (currentInvoice) void loadById(currentInvoice.id); }}
      />
      <CreateTransactionDialog
        open={isPurchaseEditDialogOpen}
        mode="edit"
        transaction={editingPurchaseTx ? toTransactionRow(editingPurchaseTx) : null}
        onClose={() => {
          setIsPurchaseEditDialogOpen(false);
          setEditingPurchaseTx(null);
        }}
        onCreditExpenseEditSubmit={async (data) => {
          if (editingPurchaseTx) {
            await updatePurchase(editingPurchaseTx.id, {
              name: data.destination,
              totalAmount: data.totalAmount,
              purchaseDate: data.purchaseDate,
              installments: data.totalInstallment,
              categoryId: data.categoryId,
            });
          }
        }}
      />

      {currentInvoice && (
        <InvoicePaymentDialog
          open={isPaymentDialogOpen}
          remainingAmount={remainingAmount}
          isSubmitting={isSubmitting}
          onClose={closePaymentDialog}
          onSubmit={handlePaymentSubmit}
        />
      )}
    </section>
  );
}
