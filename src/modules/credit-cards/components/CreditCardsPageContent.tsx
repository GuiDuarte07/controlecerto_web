"use client";

import { useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Plus, TriangleAlert } from "lucide-react";
import { usePageHeader } from "@/shared/hooks/use-page-header";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { useAccountsData } from "@/modules/accounts/hooks";
import { toAccountSearchableItem } from "@/modules/accounts";
import { CreditCardDialog } from "./CreditCardDialog";
import { CreditCardsList } from "./CreditCardsList";
import { useCreditCardsPage } from "../hooks/useCreditCards.hooks";

export function CreditCardsPageContent() {
  const t = useTranslations("creditCards");

  const {
    filteredCreditCards,
    search,
    isLoading,
    isSubmitting,
    isDialogOpen,
    dialogMode,
    selectedCard,
    error,
    setSearch,
    clearFilters,
    clearError,
    refetch,
    createCreditCard,
    updateCreditCard,
    openCreateDialog,
    openEditDialog,
    closeDialog,
  } = useCreditCardsPage();

  const { accounts } = useAccountsData();

  const accountOptions = useMemo(
    () => accounts.map(toAccountSearchableItem),
    [accounts],
  );

  const handleOpenCreateDialog = useCallback(() => {
    clearError();
    openCreateDialog();
  }, [clearError, openCreateDialog]);

  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        closeDialog();
      }
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

  const translatedErrorMessage = useMemo(() => {
    if (!error) return null;
    if (t.has(error.message)) {
      return t(error.message as never);
    }
    return error.message;
  }, [error, t]);

  return (
    <section className="flex flex-col gap-6">
      {search.trim().length > 0 && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {t("summary.filteredResult", { count: filteredCreditCards.length })}
          </p>
          <Button variant="outline" size="sm" onClick={clearFilters}>
            {t("actions.clearFilters")}
          </Button>
        </div>
      )}

      {translatedErrorMessage && (
        <Alert variant="destructive">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>{t("feedback.errorTitle")}</AlertTitle>
          <AlertDescription>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p>{translatedErrorMessage}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  void refetch();
                }}
              >
                {t("actions.retry")}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <CreditCardsList
        creditCards={filteredCreditCards}
        isLoading={isLoading}
        onCreate={handleOpenCreateDialog}
        onEdit={openEditDialog}
      />

      <CreditCardDialog
        open={isDialogOpen}
        mode={dialogMode}
        card={selectedCard}
        accountOptions={accountOptions}
        isSubmitting={isSubmitting}
        error={error}
        onOpenChange={handleDialogOpenChange}
        onCreate={createCreditCard}
        onUpdate={updateCreditCard}
      />
    </section>
  );
}
