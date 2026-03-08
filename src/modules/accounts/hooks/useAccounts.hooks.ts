"use client";

import { useEffect, useMemo } from "react";
import { useAccountsStore } from "../context/accountsContext";

export function useAccountsData(autoFetch = true) {
  const accounts = useAccountsStore((state) => state.accounts);
  const isLoading = useAccountsStore((state) => state.isLoading);
  const error = useAccountsStore((state) => state.error);
  const fetchAccounts = useAccountsStore((state) => state.fetchAccounts);

  useEffect(() => {
    if (autoFetch) {
      void fetchAccounts();
    }
  }, [autoFetch, fetchAccounts]);

  return {
    accounts,
    isLoading,
    error,
    refetch: fetchAccounts,
  };
}

export function useAccountsFilters() {
  const search = useAccountsStore((state) => state.filters.search);
  const setSearch = useAccountsStore((state) => state.setSearch);
  const clearFilters = useAccountsStore((state) => state.clearFilters);

  return {
    search,
    setSearch,
    clearFilters,
  };
}

export function useAccountsActions() {
  const isSubmitting = useAccountsStore((state) => state.isSubmitting);
  const deletingIds = useAccountsStore((state) => state.deletingIds);
  const isDialogOpen = useAccountsStore((state) => state.isDialogOpen);
  const dialogMode = useAccountsStore((state) => state.dialogMode);
  const selectedAccount = useAccountsStore((state) => state.selectedAccount);
  const error = useAccountsStore((state) => state.error);
  const createAccount = useAccountsStore((state) => state.createAccount);
  const updateAccount = useAccountsStore((state) => state.updateAccount);
  const deleteAccount = useAccountsStore((state) => state.deleteAccount);
  const openCreateDialog = useAccountsStore((state) => state.openCreateDialog);
  const openEditDialog = useAccountsStore((state) => state.openEditDialog);
  const closeDialog = useAccountsStore((state) => state.closeDialog);
  const clearError = useAccountsStore((state) => state.clearError);

  return {
    isSubmitting,
    deletingIds,
    isDialogOpen,
    dialogMode,
    selectedAccount,
    error,
    createAccount,
    updateAccount,
    deleteAccount,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    clearError,
  };
}

export function useFilteredAccounts() {
  const accounts = useAccountsStore((state) => state.accounts);
  const search = useAccountsStore((state) => state.filters.search);

  return useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) return accounts;

    return accounts.filter((account) => {
      const description = account.description ?? "";
      return (
        account.bank.toLowerCase().includes(normalizedSearch) ||
        description.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [accounts, search]);
}

export function useAccountsPage(autoFetch = true) {
  const { accounts, isLoading, error, refetch } = useAccountsData(autoFetch);
  const { search, setSearch, clearFilters } = useAccountsFilters();
  const filteredAccounts = useFilteredAccounts();
  const {
    isSubmitting,
    deletingIds,
    isDialogOpen,
    dialogMode,
    selectedAccount,
    createAccount,
    updateAccount,
    deleteAccount,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    clearError,
  } = useAccountsActions();

  const totalBalance = useMemo(
    () => accounts.reduce((sum, account) => sum + account.balance, 0),
    [accounts],
  );

  return {
    accounts,
    filteredAccounts,
    totalBalance,
    search,
    isLoading,
    isSubmitting,
    deletingIds,
    isDialogOpen,
    dialogMode,
    selectedAccount,
    error,
    setSearch,
    clearFilters,
    clearError,
    refetch,
    createAccount,
    updateAccount,
    deleteAccount,
    openCreateDialog,
    openEditDialog,
    closeDialog,
  };
}
