"use client";

import { useEffect } from "react";
import { useTransactionsStore } from "../context/transactionsContext";

export function useTransactionsData(autoFetch = true) {
  const mode = useTransactionsStore((s) => s.mode);
  const invoices = useTransactionsStore((s) => s.invoices);
  const invoiceTransactions = useTransactionsStore(
    (s) => s.invoiceTransactions,
  );
  const statementTransactions = useTransactionsStore(
    (s) => s.statementTransactions,
  );
  const statementPagination = useTransactionsStore(
    (s) => s.statementPagination,
  );
  const statementSummary = useTransactionsStore((s) => s.statementSummary);
  const isLoading = useTransactionsStore((s) => s.isLoading);
  const error = useTransactionsStore((s) => s.error);
  const fetchInvoiceData = useTransactionsStore((s) => s.fetchInvoiceData);
  const fetchStatementData = useTransactionsStore((s) => s.fetchStatementData);

  useEffect(() => {
    if (autoFetch) {
      if (mode === "invoice") {
        void fetchInvoiceData();
      } else {
        void fetchStatementData();
      }
    }
  }, [autoFetch, mode, fetchInvoiceData, fetchStatementData]);

  return {
    mode,
    invoices,
    invoiceTransactions,
    statementTransactions,
    statementPagination,
    statementSummary,
    isLoading,
    error,
    refetch: mode === "invoice" ? fetchInvoiceData : fetchStatementData,
  };
}

export function useTransactionsFilters() {
  const statementFilters = useTransactionsStore((s) => s.statementFilters);
  const statementSearch = useTransactionsStore((s) => s.statementSearch);
  const statementPage = useTransactionsStore((s) => s.statementPage);
  const statementPageSize = useTransactionsStore((s) => s.statementPageSize);
  const setStatementFilters = useTransactionsStore(
    (s) => s.setStatementFilters,
  );
  const setStatementSearch = useTransactionsStore((s) => s.setStatementSearch);
  const setStatementPage = useTransactionsStore((s) => s.setStatementPage);
  const setStatementPageSize = useTransactionsStore(
    (s) => s.setStatementPageSize,
  );
  const fetchStatementData = useTransactionsStore((s) => s.fetchStatementData);

  return {
    statementFilters,
    statementSearch,
    statementPage,
    statementPageSize,
    setStatementFilters,
    setStatementSearch,
    setStatementPage,
    setStatementPageSize,
    applyFilters: fetchStatementData,
  };
}

export function useTransactionsActions() {
  const isSubmitting = useTransactionsStore((s) => s.isSubmitting);
  const error = useTransactionsStore((s) => s.error);
  const isCreateDrawerOpen = useTransactionsStore((s) => s.isCreateDrawerOpen);
  const isDetailSheetOpen = useTransactionsStore((s) => s.isDetailSheetOpen);
  const selectedTransaction = useTransactionsStore(
    (s) => s.selectedTransaction,
  );
  const createExpenseIncome = useTransactionsStore(
    (s) => s.createExpenseIncome,
  );
  const createCreditExpense = useTransactionsStore(
    (s) => s.createCreditExpense,
  );
  const createTransference = useTransactionsStore((s) => s.createTransference);
  const updateTransaction = useTransactionsStore((s) => s.updateTransaction);
  const updateCreditPurchase = useTransactionsStore(
    (s) => s.updateCreditPurchase,
  );
  const deleteTransaction = useTransactionsStore((s) => s.deleteTransaction);
  const openCreateDrawer = useTransactionsStore((s) => s.openCreateDrawer);
  const closeCreateDrawer = useTransactionsStore((s) => s.closeCreateDrawer);
  const openDetailSheet = useTransactionsStore((s) => s.openDetailSheet);
  const closeDetailSheet = useTransactionsStore((s) => s.closeDetailSheet);
  const clearError = useTransactionsStore((s) => s.clearError);

  return {
    isSubmitting,
    error,
    isCreateDrawerOpen,
    isDetailSheetOpen,
    selectedTransaction,
    createExpenseIncome,
    createCreditExpense,
    createTransference,
    updateTransaction,
    updateCreditPurchase,
    deleteTransaction,
    openCreateDrawer,
    closeCreateDrawer,
    openDetailSheet,
    closeDetailSheet,
    clearError,
  };
}

export function useInvoiceNavigation() {
  const invoiceMonthDate = useTransactionsStore((s) => s.invoiceMonthDate);
  const goToPrevMonth = useTransactionsStore((s) => s.goToPrevMonth);
  const goToNextMonth = useTransactionsStore((s) => s.goToNextMonth);

  return { invoiceMonthDate, goToPrevMonth, goToNextMonth };
}

export function useTransactionsPage(autoFetch = true) {
  const data = useTransactionsData(autoFetch);
  const filters = useTransactionsFilters();
  const actions = useTransactionsActions();
  const invoiceNav = useInvoiceNavigation();
  const setMode = useTransactionsStore((s) => s.setMode);

  return { ...data, ...filters, ...actions, ...invoiceNav, setMode };
}
