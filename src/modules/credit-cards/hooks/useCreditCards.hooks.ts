"use client";

import { useEffect, useMemo } from "react";
import { useCreditCardsStore } from "../context/creditCardsContext";

export function useCreditCardsData(autoFetch = true) {
  const creditCards = useCreditCardsStore((s) => s.creditCards);
  const isLoading = useCreditCardsStore((s) => s.isLoading);
  const error = useCreditCardsStore((s) => s.error);
  const fetchCreditCards = useCreditCardsStore((s) => s.fetchCreditCards);

  useEffect(() => {
    if (autoFetch) {
      void fetchCreditCards();
    }
  }, [autoFetch, fetchCreditCards]);

  return { creditCards, isLoading, error, refetch: fetchCreditCards };
}

export function useCreditCardsFilters() {
  const search = useCreditCardsStore((s) => s.filters.search);
  const setSearch = useCreditCardsStore((s) => s.setSearch);
  const clearFilters = useCreditCardsStore((s) => s.clearFilters);

  return { search, setSearch, clearFilters };
}

export function useCreditCardsActions() {
  const isSubmitting = useCreditCardsStore((s) => s.isSubmitting);
  const isDialogOpen = useCreditCardsStore((s) => s.isDialogOpen);
  const dialogMode = useCreditCardsStore((s) => s.dialogMode);
  const selectedCard = useCreditCardsStore((s) => s.selectedCard);
  const error = useCreditCardsStore((s) => s.error);
  const createCreditCard = useCreditCardsStore((s) => s.createCreditCard);
  const updateCreditCard = useCreditCardsStore((s) => s.updateCreditCard);
  const openCreateDialog = useCreditCardsStore((s) => s.openCreateDialog);
  const openEditDialog = useCreditCardsStore((s) => s.openEditDialog);
  const closeDialog = useCreditCardsStore((s) => s.closeDialog);
  const clearError = useCreditCardsStore((s) => s.clearError);

  return {
    isSubmitting,
    isDialogOpen,
    dialogMode,
    selectedCard,
    error,
    createCreditCard,
    updateCreditCard,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    clearError,
  };
}

export function useFilteredCreditCards() {
  const creditCards = useCreditCardsStore((s) => s.creditCards);
  const search = useCreditCardsStore((s) => s.filters.search);

  return useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return creditCards;
    return creditCards.filter(
      (c) =>
        c.description.toLowerCase().includes(term) ||
        c.account.bank.toLowerCase().includes(term),
    );
  }, [creditCards, search]);
}

export function useCreditCardsPage(autoFetch = true) {
  const { creditCards, isLoading, refetch } = useCreditCardsData(autoFetch);
  const { search, setSearch, clearFilters } = useCreditCardsFilters();
  const filteredCreditCards = useFilteredCreditCards();
  const actions = useCreditCardsActions();

  return {
    creditCards,
    filteredCreditCards,
    search,
    isLoading,
    refetch,
    setSearch,
    clearFilters,
    ...actions,
  };
}
