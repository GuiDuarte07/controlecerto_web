"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { Plus, TriangleAlert } from "lucide-react";
import { usePageHeader } from "@/shared/hooks/use-page-header";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { BillTypeEnum } from "../types/categories.types";
import type { Category, ParentCategory } from "../types/categories.types";
import { useCategoriesPage } from "../hooks/useCategories.hooks";
import { CategoriesList } from "./CategoriesList";
import { CategoryDialog } from "./CategoryDialog";

export function CategoriesPageContent() {
  const t = useTranslations("categories");
  const {
    filteredExpense,
    filteredIncome,
    allExpenseFlat,
    allIncomeFlat,
    isLoadingExpense,
    isLoadingIncome,
    isSubmitting,
    deletingIds,
    isDialogOpen,
    dialogMode,
    selectedCategory,
    defaultBillType,
    defaultParentId,
    activeTab,
    search,
    error,
    setSearch,
    setActiveTab,
    openCreateForTab,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    clearError,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategoriesPage();

  const handleOpenCreate = useCallback(() => {
    clearError();
    openCreateForTab();
  }, [clearError, openCreateForTab]);

  const handleOpenCreateDialog = useCallback(() => {
    clearError();
    openCreateForTab();
  }, [clearError, openCreateForTab]);

  const handleAddSubcategory = useCallback(
    (parent: ParentCategory) => {
      clearError();
      const billType = activeTab === "expense" ? BillTypeEnum.EXPENSE : BillTypeEnum.INCOME;
      openCreateDialog(billType, parent.id);
    },
    [clearError, openCreateDialog, activeTab],
  );

  const handleEdit = useCallback(
    (category: Category | ParentCategory) => {
      clearError();
      openEditDialog(category);
    },
    [clearError, openEditDialog],
  );

  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      if (!open) closeDialog();
    },
    [closeDialog],
  );

  usePageHeader({
    title: t("title"),
    description: t("description"),
    actionLabel: t("actionLabel"),
    actionIcon: Plus,
    onAction: handleOpenCreateDialog,
    searchValue: search,
    searchPlaceholder: t("searchPlaceholder"),
    searchAriaLabel: t("searchPlaceholder"),
    onSearchChange: setSearch,
  });

  const parentOptions =
    activeTab === "expense" ? allExpenseFlat : allIncomeFlat;

  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>{t("feedback.errorTitle")}</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-2">
            <span>{error.message}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={clearError}
              className="shrink-0"
            >
              {t("actions.dismiss")}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "expense" | "income")}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="expense">{t("dialog.expense")}</TabsTrigger>
          <TabsTrigger value="income">{t("dialog.income")}</TabsTrigger>
        </TabsList>

        <TabsContent value="expense">
          <CategoriesList
            categories={filteredExpense}
            isLoading={isLoadingExpense}
            deletingIds={deletingIds}
            onCreateForTab={handleOpenCreate}
            onEdit={handleEdit}
            onAddSubcategory={handleAddSubcategory}
            onDelete={deleteCategory}
          />
        </TabsContent>

        <TabsContent value="income">
          <CategoriesList
            categories={filteredIncome}
            isLoading={isLoadingIncome}
            deletingIds={deletingIds}
            onCreateForTab={handleOpenCreate}
            onEdit={handleEdit}
            onAddSubcategory={handleAddSubcategory}
            onDelete={deleteCategory}
          />
        </TabsContent>
      </Tabs>

      <CategoryDialog
        open={isDialogOpen}
        mode={dialogMode}
        category={selectedCategory}
        defaultBillType={defaultBillType}
        defaultParentId={defaultParentId}
        parentOptions={parentOptions}
        isSubmitting={isSubmitting}
        error={error}
        onOpenChange={handleDialogOpenChange}
        onCreate={createCategory}
        onUpdate={updateCategory}
      />
    </>
  );
}
