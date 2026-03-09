"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { getColoredBadgeStyle } from "@/shared/utils";
import type { InvoicePayment } from "../types/invoice.types";

interface InvoicePaymentsListProps {
  payments: InvoicePayment[];
  isSubmitting?: boolean;
  onDelete: (id: number) => void;
  onAdd: () => void;
}

export function InvoicePaymentsList({
  payments,
  isSubmitting,
  onDelete,
  onAdd,
}: InvoicePaymentsListProps) {
  const t = useTranslations("invoices");
  const locale = useLocale();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const currencyFormatter = new Intl.NumberFormat(locale === "pt" ? "pt-BR" : "en-US", {
    style: "currency",
    currency: "BRL",
  });

  const dateLocale = locale === "pt" ? ptBR : undefined;

  return (
    <>
      <div className="flex flex-col gap-3">
        {payments.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            {t("payments.empty")}
          </p>
        ) : (
          <div className="flex flex-col divide-y">
            {payments.map((payment) => {
              const badgeStyle = getColoredBadgeStyle(payment.account.color);

              return (
                <div
                  key={payment.id}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="shrink-0 rounded-md border px-2 py-0.5 text-xs"
                        style={badgeStyle}
                      >
                        {payment.account.bank}
                      </Badge>
                      {payment.justForRecord && (
                        <Badge variant="secondary" className="text-xs">
                          {t("payments.justForRecord")}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {payment.description} ·{" "}
                      {(() => { const d = new Date(payment.paymentDate); return isValid(d) ? format(d, "dd/MM/yyyy", { locale: dateLocale }) : "—"; })()}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                      {currencyFormatter.format(payment.amountPaid)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => setDeletingId(payment.id)}
                      disabled={isSubmitting}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Button variant="outline" size="sm" onClick={onAdd} disabled={isSubmitting}>
          {t("actions.payInvoice")}
        </Button>
      </div>

      <AlertDialog open={deletingId !== null} onOpenChange={(o) => !o && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("actions.deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("actions.deletePaymentDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("actions.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deletingId !== null) {
                  onDelete(deletingId);
                  setDeletingId(null);
                }
              }}
            >
              {t("actions.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
