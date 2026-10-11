"use client";

import { useEffect } from "react";
import { useRecurringTransactionsStore } from "../context/recurring-transactions-context";

export function useRecurringTransactionsData(autoFetch = true) {
  const transactions = useRecurringTransactionsStore((state) => state.transactions);
  const pendingInstances = useRecurringTransactionsStore((state) => state.pendingInstances);
  const isLoading = useRecurringTransactionsStore((state) => state.isLoading);
  const isSubmitting = useRecurringTransactionsStore((state) => state.isSubmitting);
  const error = useRecurringTransactionsStore((state) => state.error);
  const fetchData = useRecurringTransactionsStore((state) => state.fetchData);

  useEffect(() => {
    if (autoFetch) void fetchData();
  }, [autoFetch, fetchData]);

  return { transactions, pendingInstances, isLoading, isSubmitting, error, refetch: fetchData };
}

export function useRecurringTransactionsActions() {
  const createTransaction = useRecurringTransactionsStore((state) => state.createTransaction);
  const updateTransaction = useRecurringTransactionsStore((state) => state.updateTransaction);
  const deleteTransaction = useRecurringTransactionsStore((state) => state.deleteTransaction);
  const processInstances = useRecurringTransactionsStore((state) => state.processInstances);
  const clearError = useRecurringTransactionsStore((state) => state.clearError);

  return { createTransaction, updateTransaction, deleteTransaction, processInstances, clearError };
}
