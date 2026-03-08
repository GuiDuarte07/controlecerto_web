"use client";

import { useCallback, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Plus, TriangleAlert } from "lucide-react";
import { usePageHeader } from "@/shared/hooks/use-page-header";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { AccountDialog } from "./AccountDialog";
import { AccountsList } from "./AccountsList";
import { useAccountsPage } from "../hooks/useAccounts.hooks";

export function AccountsPageContent() {
  const locale = useLocale();
  const t = useTranslations("accounts");
  const {
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
  } = useAccountsPage();

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

  const visibleBalance = useMemo(
    () => filteredAccounts.reduce((total, account) => total + account.balance, 0),
    [filteredAccounts],
  );

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale === "pt" ? "pt-BR" : "en-US", {
        style: "currency",
        currency: "BRL",
      }),
    [locale],
  );

  const translatedErrorMessage = useMemo(() => {
    if (!error) return null;

    if (t.has(error.message)) {
      return t(error.message as never);
    }

    return error.message;
  }, [error, t]);

  return (
    <section className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:max-w-md">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{t("summary.totalAccounts")}</p>
            <p className="text-2xl font-semibold">{accounts.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{t("summary.totalBalance")}</p>
            <p className="text-2xl font-semibold">{currencyFormatter.format(totalBalance)}</p>
          </CardContent>
        </Card>
      </div>

      {search.trim().length > 0 && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {t("summary.filteredResult", {
              count: filteredAccounts.length,
              balance: currencyFormatter.format(visibleBalance),
            })}
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

      <AccountsList
        accounts={filteredAccounts}
        isLoading={isLoading}
        deletingIds={deletingIds}
        onCreate={handleOpenCreateDialog}
        onEdit={openEditDialog}
        onDeactivate={deleteAccount}
      />

      <AccountDialog
        open={isDialogOpen}
        mode={dialogMode}
        account={selectedAccount}
        isSubmitting={isSubmitting}
        error={error}
        onOpenChange={handleDialogOpenChange}
        onCreate={createAccount}
        onUpdate={updateAccount}
      />
    </section>
  );
}
