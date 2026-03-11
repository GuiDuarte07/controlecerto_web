"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { usePageHeader } from "@/shared/hooks/use-page-header";
import { useAccountsStore } from "@/modules/accounts/context/accountsContext";
import { useCreditCardsStore } from "@/modules/credit-cards/context/creditCardsContext";
import { useCategoriesStore } from "@/modules/categories/context/categoriesContext";
import { TransactionModeToggle } from "./TransactionModeToggle";
import { InvoiceView } from "./invoice/InvoiceView";
import { StatementView } from "./statement/StatementView";
import { CreateTransactionDialog } from "./CreateTransactionDialog";
import { TransactionDetailSheet } from "./shared/TransactionDetailSheet";
import { useTransactionsPage } from "../hooks/useTransactions.hooks";
import type { Transaction, TransactionFilters } from "../types/transactions.types";

export function TransactionsPageContent() {
  const t = useTranslations("transactions");

  const {
    mode,
    invoices,
    invoiceTransactions,
    invoiceMonthDate,
    statementTransactions,
    statementPagination,
    statementSummary,
    isLoading,
    error,
    isCreateDrawerOpen,
    isDetailSheetOpen,
    selectedTransaction,
    statementFilters,
    setMode,
    goToPrevMonth,
    goToNextMonth,
    openCreateDrawer,
    closeCreateDrawer,
    openDetailSheet,
    closeDetailSheet,
    setStatementFilters,
    setStatementPage,
    setStatementPageSize,
    setStatementSearch,
    applyFilters,
    clearError,
    statementSearch,
    refetch,
  } = useTransactionsPage(true);

  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchAccounts = useAccountsStore((s) => s.fetchAccounts);
  const fetchCreditCards = useCreditCardsStore((s) => s.fetchCreditCards);
  const fetchExpense = useCategoriesStore((s) => s.fetchExpense);
  const fetchIncome = useCategoriesStore((s) => s.fetchIncome);

  useEffect(() => {
    void fetchAccounts();
    void fetchCreditCards();
    void fetchExpense();
    void fetchIncome();
  }, [fetchAccounts, fetchCreditCards, fetchExpense, fetchIncome]);

  useEffect(() => {
    if (!error) return;

    toast.error(t("feedback.errorTitle"), {
      id: "transactions-error",
      description: error.message || t("feedback.loadError"),
      action: {
        label: t("actions.retry"),
        onClick: () => {
          void refetch();
        },
      },
    });

    clearError();
  }, [error, t, refetch, clearError]);

  const handleOpenCreate = useCallback(() => {
    openCreateDrawer();
  }, [openCreateDrawer]);

  usePageHeader({
    title: t("title"),
    description: t("description"),
    actionLabel: t("actionLabel"),
    actionIcon: Plus,
    onAction: handleOpenCreate,
    ...(mode === "statement"
      ? {
          searchValue: statementSearch,
          searchPlaceholder: t("searchPlaceholder"),
          searchAriaLabel: t("searchPlaceholder"),
          onSearchChange: setStatementSearch,
        }
      : {}),
  });

  const handleTransactionClick = (transaction: Transaction) => {
    openDetailSheet(transaction);
  };

  const handleEditTransaction = useCallback(() => {
    setEditTransaction(selectedTransaction);
    setIsEditDialogOpen(true);
    closeDetailSheet();
  }, [selectedTransaction, closeDetailSheet]);

  const handleCloseEditDialog = useCallback(() => {
    setIsEditDialogOpen(false);
    setEditTransaction(null);
  }, []);

  const handleInvoiceFiltersClear = useCallback(() => {
    setStatementFilters({});
  }, [setStatementFilters]);

  const handleStatementFiltersApply = (
    merged: TransactionFilters & { dateStart?: Date; dateEnd?: Date },
  ) => {
    setStatementFilters(merged);
    void applyFilters();
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <TransactionModeToggle mode={mode} onModeChange={setMode} />

      {mode === "invoice" && (
        <InvoiceView
          invoices={invoices}
          invoiceTransactions={invoiceTransactions}
          invoiceMonthDate={invoiceMonthDate}
          isLoading={isLoading}
          filters={statementFilters}
          onPrevMonth={goToPrevMonth}
          onNextMonth={goToNextMonth}
          onTransactionClick={handleTransactionClick}
          onFiltersChange={setStatementFilters}
          onFiltersClear={handleInvoiceFiltersClear}
        />
      )}

      {mode === "statement" && (
        <StatementView
          transactions={statementTransactions}
          pagination={statementPagination}
          summary={statementSummary}
          isLoading={isLoading}
          onTransactionClick={handleTransactionClick}
          onFiltersApply={handleStatementFiltersApply}
          onPageChange={setStatementPage}
          onPageSizeChange={setStatementPageSize}
        />
      )}

      <CreateTransactionDialog
        open={isCreateDrawerOpen}
        mode="create"
        onClose={closeCreateDrawer}
      />

      <CreateTransactionDialog
        open={isEditDialogOpen}
        mode="edit"
        transaction={editTransaction}
        onClose={handleCloseEditDialog}
      />

      <TransactionDetailSheet
        open={isDetailSheetOpen}
        transaction={selectedTransaction}
        onClose={closeDetailSheet}
        onEdit={handleEditTransaction}
      />
    </div>
  );
}
