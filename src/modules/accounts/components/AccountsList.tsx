"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Landmark, Pencil, Power, WalletCards } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { getColoredBadgeStyle } from "@/shared/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import type { Account } from "../types/accounts.types";

interface AccountsListProps {
  accounts: Account[];
  isLoading: boolean;
  deletingIds: number[];
  onCreate?: () => void;
  onEdit: (account: Account) => void;
  onDeactivate: (id: number) => Promise<void>;
}

function resolveAccountDescription(account: Account, fallback: string) {
  if (account.description && account.description.trim().length > 0) {
    return account.description;
  }

  return fallback;
}

export function AccountsList({
  accounts,
  isLoading,
  deletingIds,
  onCreate,
  onEdit,
  onDeactivate,
}: AccountsListProps) {
  const locale = useLocale();
  const t = useTranslations("accounts");

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale === "pt" ? "pt-BR" : "en-US", {
        style: "currency",
        currency: "BRL",
      }),
    [locale],
  );

  const deletingIdsSet = useMemo(() => new Set(deletingIds), [deletingIds]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <WalletCards className="size-6" />
              </EmptyMedia>
              <EmptyTitle>{t("empty.title")}</EmptyTitle>
              <EmptyDescription>{t("empty.description")}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              {onCreate && <Button onClick={onCreate}>{t("actionLabel")}</Button>}
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-55">{t("table.bank")}</TableHead>
                  <TableHead className="w-[46%]">{t("table.description")}</TableHead>
                  <TableHead className="w-42.5">{t("table.balance")}</TableHead>
                  <TableHead className="w-30">{t("table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => {
                  const isDeleting = deletingIdsSet.has(account.id);
                  const bankBadgeStyle = getColoredBadgeStyle(account.color);

                  return (
                    <TableRow key={account.id}>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="rounded-md border px-2 py-1"
                          style={bankBadgeStyle}
                        >
                          {account.bank}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-110 truncate">
                        {resolveAccountDescription(account, t("table.noDescription"))}
                      </TableCell>
                      <TableCell className="font-medium">
                        {currencyFormatter.format(account.balance)}
                      </TableCell>
                      <TableCell className="w-30">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon-sm"
                            aria-label={t("actions.edit")}
                            title={t("actions.edit")}
                            onClick={() => onEdit(account)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="icon-sm"
                                disabled={isDeleting}
                                aria-label={t("actions.deactivate")}
                                title={
                                  isDeleting
                                    ? t("actions.deactivating")
                                    : t("actions.deactivate")
                                }
                              >
                                <Power className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {t("confirmDelete.title")}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t("confirmDelete.description")}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>
                                  {t("actions.cancel")}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  variant="destructive"
                                  onClick={() => {
                                    void onDeactivate(account.id);
                                  }}
                                >
                                  {t("actions.deactivate")}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3 md:hidden">
        {accounts.map((account) => {
          const isDeleting = deletingIdsSet.has(account.id);
          const bankBadgeStyle = getColoredBadgeStyle(account.color);

          return (
            <Card key={account.id}>
              <CardContent className="space-y-4 p-4">
                <div className="space-y-1">
                  <Badge variant="outline" className="border" style={bankBadgeStyle}>
                    {account.bank}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {resolveAccountDescription(account, t("table.noDescription"))}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t("table.balance")}
                  </span>
                  <span className="text-base font-semibold">
                    {currencyFormatter.format(account.balance)}
                  </span>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => onEdit(account)}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    {t("actions.edit")}
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="w-full"
                        disabled={isDeleting}
                      >
                        <Power className="mr-2 h-4 w-4" />
                        {isDeleting
                          ? t("actions.deactivating")
                          : t("actions.deactivate")}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("confirmDelete.title")}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("confirmDelete.description")}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("actions.cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                          variant="destructive"
                          onClick={() => {
                            void onDeactivate(account.id);
                          }}
                        >
                          {t("actions.deactivate")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-xs text-muted-foreground">
        <div className="inline-flex items-center gap-2">
          <Landmark className="h-4 w-4" />
          <span>{t("hint")}</span>
        </div>
      </div>
    </>
  );
}
