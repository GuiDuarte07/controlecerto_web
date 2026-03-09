"use client";

import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import { Pencil, Trash2, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
} from "@/shared/components/ui/sheet";
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
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { DynamicIcon } from "@/shared/components/DynamicIcon";
import type { IconName } from "@/shared/components/DynamicIcon";
import { getContrastTextColor } from "@/shared/utils";
import { cn } from "@/shared/lib/utils";
import type { Transaction } from "../../types/transactions.types";
import { useTransactionsStore } from "../../context/transactionsContext";
import { useIsMobile } from "@/shared/hooks/use-mobile";

interface TransactionDetailSheetProps {
  open: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => Promise<void>;
}

function formatCurrency(amount: number, locale: string) {
  return new Intl.NumberFormat(locale === "pt" ? "pt-BR" : "en-US", {
    style: "currency",
    currency: locale === "pt" ? "BRL" : "USD",
  }).format(amount);
}

function getCategoryDisplay(transaction: Transaction) {
  if (transaction.category) {
    return {
      color: transaction.category.color,
      icon: transaction.category.icon,
      name: transaction.category.name,
    };
  }
  switch (transaction.type) {
    case "INVOICEPAYMENT":
      return { color: "#22c55e", icon: "banknote", name: null };
    case "TRANSFERENCE":
      return { color: "#3b82f6", icon: "arrowLeftRight", name: null };
    default:
      return { color: "#6b7280", icon: "CircleDot", name: null };
  }
}

function InfoCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border bg-muted/30 px-3 py-2.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium truncate">{value ?? "—"}</span>
    </div>
  );
}

export function TransactionDetailSheet({ open, transaction, onClose, onEdit, onDelete }: TransactionDetailSheetProps) {
  const t = useTranslations("transactions");
  const locale = useLocale();
  const dateLocale = locale === "pt" ? ptBR : undefined;
  const isMobile = useIsMobile();
  const isSubmitting = useTransactionsStore((s) => s.isSubmitting);
  const deleteTransaction = useTransactionsStore((s) => s.deleteTransaction);

  if (!transaction) return null;

  const canDelete = transaction.type !== "INVOICEPAYMENT";
  const canEdit = transaction.type !== "INVOICEPAYMENT";
  const categoryDisplay = getCategoryDisplay(transaction);
  const displayLabel = transaction.description || transaction.destination || t("detail.noDescription");

  const sign =
    transaction.type === "INCOME" || transaction.type === "INVOICEPAYMENT"
      ? "+"
      : transaction.type === "TRANSFERENCE"
      ? ""
      : "-";

  const handleDelete = async () => {
    if (onDelete) {
      await onDelete();
    } else {
      await deleteTransaction(transaction.id);
    }
  };

  const textColor = getContrastTextColor(categoryDisplay.color);

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        showCloseButton={false}
        className={cn(
          "p-0 overflow-y-auto gap-0",
          isMobile ? "h-svh" : "w-[480px]",
        )}
      >
        {/* Colored header */}
        <div
          className="relative flex flex-col items-center gap-4 px-6 pb-8 pt-12"
          style={{ backgroundColor: categoryDisplay.color }}
        >
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-3 top-3 h-8 w-8 rounded-full bg-black/15 hover:bg-black/25"
            style={{ color: textColor }}
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>

          <span
            className="flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: "rgba(0,0,0,0.15)" }}
          >
            <DynamicIcon
              name={categoryDisplay.icon as IconName}
              className="h-8 w-8"
              style={{ color: textColor }}
            />
          </span>

          <div className="flex flex-col items-center gap-2 text-center">
            <span className="max-w-xs text-sm font-medium opacity-80" style={{ color: textColor }}>
              {displayLabel}
            </span>
            <span className="text-3xl font-bold tabular-nums" style={{ color: textColor }}>
              {sign}{formatCurrency(transaction.amount, locale)}
            </span>
            <Badge
              variant="outline"
              className="border-white/40 text-xs"
              style={{ color: textColor, borderColor: `${textColor}40` }}
            >
              {t(`types.${transaction.type}` as Parameters<typeof t>[0])}
            </Badge>
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-4 px-6 py-5">
          <div className="grid grid-cols-2 gap-3">
            <InfoCard
              label={t("detail.date" as Parameters<typeof t>[0])}
              value={(() => { const d = new Date(transaction.purchaseDate); return isValid(d) ? format(d, "dd/MM/yyyy", { locale: dateLocale }) : "—"; })()}
            />
            {transaction.account && (
              <InfoCard
                label={t("detail.account" as Parameters<typeof t>[0])}
                value={transaction.account.bank}
              />
            )}
            {categoryDisplay.name && (
              <InfoCard
                label={t("detail.category" as Parameters<typeof t>[0])}
                value={categoryDisplay.name}
              />
            )}
            {transaction.destination && (
              <InfoCard
                label={t("create.destination")}
                value={transaction.destination}
              />
            )}
          </div>

          {transaction.creditPurchase && (
            <div className="grid grid-cols-2 gap-3">
              <InfoCard
                label={t("detail.installment" as Parameters<typeof t>[0])}
                value={`${transaction.installmentNumber ?? 1} / ${transaction.creditPurchase.totalInstallment}`}
              />
              <InfoCard
                label={t("detail.totalPurchase" as Parameters<typeof t>[0])}
                value={formatCurrency(transaction.creditPurchase.totalAmount, locale)}
              />
            </div>
          )}

          {transaction.observations && (
            <div className="rounded-lg border bg-muted/30 px-4 py-3">
              <span className="mb-1 block text-xs text-muted-foreground">{t("create.observations")}</span>
              <span className="text-sm">{transaction.observations}</span>
            </div>
          )}

          {transaction.justForRecord && (
            <Badge variant="secondary" className="w-fit">
              {t("detail.justForRecord")}
            </Badge>
          )}
        </div>

        {/* Actions */}
        {(canEdit || canDelete) && (
          <div className="flex gap-3 px-6 pb-8 pt-2">
            {canEdit && onEdit && (
              <Button variant="outline" className="flex-1" onClick={onEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                {t("detail.edit")}
              </Button>
            )}
            {canDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("flex-1 text-destructive hover:text-destructive hover:border-destructive")}
                    disabled={isSubmitting}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t("detail.delete")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("detail.confirmDelete")}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("detail.confirmDeleteDescription")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("actions.cancel")}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isSubmitting}>
                      {t("actions.confirm")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
