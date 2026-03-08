"use client";

import { useEffect, useMemo } from "react";
import { useCategoriesStore } from "../context/categoriesContext";
import { BillTypeEnum } from "../types/categories.types";

export function useCategoriesData() {
  const expenseCategories = useCategoriesStore((s) => s.expenseCategories);
  const incomeCategories = useCategoriesStore((s) => s.incomeCategories);
  const isLoadingExpense = useCategoriesStore((s) => s.isLoadingExpense);
  const isLoadingIncome = useCategoriesStore((s) => s.isLoadingIncome);
  const error = useCategoriesStore((s) => s.error);
  const fetchExpense = useCategoriesStore((s) => s.fetchExpense);
  const fetchIncome = useCategoriesStore((s) => s.fetchIncome);

  useEffect(() => {
    void fetchExpense();
    void fetchIncome();
  }, [fetchExpense, fetchIncome]);

  return {
    expenseCategories,
    incomeCategories,
    isLoadingExpense,
    isLoadingIncome,
    error,
    refetchExpense: fetchExpense,
    refetchIncome: fetchIncome,
  };
}

export function useCategoriesFilters() {
  const search = useCategoriesStore((s) => s.filters.search);
  const setSearch = useCategoriesStore((s) => s.setSearch);
  const activeTab = useCategoriesStore((s) => s.activeTab);
  const setActiveTab = useCategoriesStore((s) => s.setActiveTab);

  return { search, setSearch, activeTab, setActiveTab };
}

export function useCategoriesActions() {
  const isSubmitting = useCategoriesStore((s) => s.isSubmitting);
  const deletingIds = useCategoriesStore((s) => s.deletingIds);
  const isDialogOpen = useCategoriesStore((s) => s.isDialogOpen);
  const dialogMode = useCategoriesStore((s) => s.dialogMode);
  const selectedCategory = useCategoriesStore((s) => s.selectedCategory);
  const defaultBillType = useCategoriesStore((s) => s.defaultBillType);
  const defaultParentId = useCategoriesStore((s) => s.defaultParentId);
  const error = useCategoriesStore((s) => s.error);
  const createCategory = useCategoriesStore((s) => s.createCategory);
  const updateCategory = useCategoriesStore((s) => s.updateCategory);
  const deleteCategory = useCategoriesStore((s) => s.deleteCategory);
  const openCreateDialog = useCategoriesStore((s) => s.openCreateDialog);
  const openEditDialog = useCategoriesStore((s) => s.openEditDialog);
  const closeDialog = useCategoriesStore((s) => s.closeDialog);
  const clearError = useCategoriesStore((s) => s.clearError);

  return {
    isSubmitting,
    deletingIds,
    isDialogOpen,
    dialogMode,
    selectedCategory,
    defaultBillType,
    defaultParentId,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    clearError,
  };
}

export function useFilteredCategories() {
  const expenseCategories = useCategoriesStore((s) => s.expenseCategories);
  const incomeCategories = useCategoriesStore((s) => s.incomeCategories);
  const search = useCategoriesStore((s) => s.filters.search);

  return useMemo(() => {
    const term = search.trim().toLowerCase();

    const filter = (categories: typeof expenseCategories) => {
      if (!term) return categories;
      return categories
        .map((parent) => {
          const parentMatch = parent.name.toLowerCase().includes(term);
          const matchedSubs = parent.subCategories.filter((sub) =>
            sub.name.toLowerCase().includes(term),
          );
          if (parentMatch || matchedSubs.length > 0) {
            return {
              ...parent,
              subCategories: parentMatch ? parent.subCategories : matchedSubs,
            };
          }
          return null;
        })
        .filter(Boolean) as typeof expenseCategories;
    };

    return {
      filteredExpense: filter(expenseCategories),
      filteredIncome: filter(incomeCategories),
    };
  }, [expenseCategories, incomeCategories, search]);
}

export function useCategoriesPage() {
  const data = useCategoriesData();
  const { search, setSearch, activeTab, setActiveTab } = useCategoriesFilters();
  const { filteredExpense, filteredIncome } = useFilteredCategories();
  const actions = useCategoriesActions();

  const allExpenseFlat = useMemo(
    () =>
      data.expenseCategories.map((p) => ({
        id: p.id,
        label: p.name,
        color: p.color,
        iconName: p.icon,
      })),
    [data.expenseCategories],
  );

  const allIncomeFlat = useMemo(
    () =>
      data.incomeCategories.map((p) => ({
        id: p.id,
        label: p.name,
        color: p.color,
        iconName: p.icon,
      })),
    [data.incomeCategories],
  );

  const openCreateForTab = () => {
    const billType =
      activeTab === "expense" ? BillTypeEnum.EXPENSE : BillTypeEnum.INCOME;
    actions.openCreateDialog(billType);
  };

  return {
    ...data,
    ...actions,
    search,
    setSearch,
    activeTab,
    setActiveTab,
    filteredExpense,
    filteredIncome,
    allExpenseFlat,
    allIncomeFlat,
    openCreateForTab,
  };
}
