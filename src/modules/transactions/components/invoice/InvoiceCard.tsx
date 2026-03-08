"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { TransactionRow } from "../shared/TransactionRow";
import type { Invoice, Transaction } from "../../types/transactions.types";

interface InvoiceCardProps {
  invoice: Invoice;
  onTransactionClick: (transaction: Transaction) => void;
}

function formatCurrency(amount: number, locale: string) {
  return new Intl.NumberFormat(locale === "pt" ? "pt-BR" : "en-US", {
    style: "currency",
    currency: locale === "pt" ? "BRL" : "USD",
  }).format(amount);
}

export function InvoiceCard({ invoice, onTransactionClick }: InvoiceCardProps) {
  const t = useTranslations("transactions");
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const dateLocale = locale === "pt" ? ptBR : undefined;

  const transactions = invoice.transactions ?? [];
  const payments = invoice.invoicePayments ?? [];
  const totalCount = transactions.length + payments.length;

  return (
    <div className="rounded-lg border bg-card shadow-xs">
      {/* Card header — always visible */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-base truncate">
              {invoice.creditCard.description || invoice.creditCard.account?.bank}
            </span>
            {invoice.creditCard.account && (
              <Badge
                variant="secondary"
                style={{
                  backgroundColor: invoice.creditCard.account.color,
                  color: "white",
                }}
                className="text-xs shrink-0"
              >
                {invoice.creditCard.account.bank}
              </Badge>
            )}
            <Badge
              variant={invoice.isPaid ? "default" : "outline"}
              className={
                invoice.isPaid
                  ? "text-xs bg-green-500 text-white border-green-500 shrink-0"
                  : "text-xs text-amber-600 border-amber-400 shrink-0"
              }
            >
              {invoice.isPaid ? t("invoice.invoicePaidStatus") : t("invoice.invoiceOpen")}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>
              {t("invoice.invoiceClosing")}{" "}
              {format(new Date(invoice.closingDate), "dd/MM", { locale: dateLocale })}
            </span>
            <span>
              {t("invoice.invoiceDue")}{" "}
              {format(new Date(invoice.dueDate), "dd/MM", { locale: dateLocale })}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="text-base font-bold tabular-nums">
            {formatCurrency(invoice.totalAmount, locale)}
          </span>
          {invoice.totalPaid > 0 && (
            <span className="text-xs text-green-600 dark:text-green-400 tabular-nums">
              {t("invoice.invoicePaid")}: {formatCurrency(invoice.totalPaid, locale)}
            </span>
          )}
          <span className="text-muted-foreground mt-1">
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </span>
        </div>
      </button>

      {/* Collapsible content */}
      {isOpen && (
        <div className="border-t">
          {totalCount === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">{t("invoice.noTransactions")}</p>
          ) : (
            <div className="divide-y">
              {transactions.map((tx) => (
                <TransactionRow
                  key={tx.id}
                  transaction={tx}
                  onClick={onTransactionClick}
                />
              ))}

              {payments.length > 0 && (
                <>
                  <Separator />
                  <div className="px-4 py-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {t("invoice.payments")}
                    </span>
                  </div>
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between px-4 py-2 text-sm"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">{payment.description}</span>
                        <span className="text-xs text-muted-foreground">
                          {payment.account.bank} ·{" "}
                          {format(new Date(payment.paymentDate), "dd/MM/yyyy", { locale: dateLocale })}
                        </span>
                      </div>
                      <span className="font-semibold text-blue-600 dark:text-blue-400 tabular-nums">
                        {formatCurrency(payment.amountPaid, locale)}
                      </span>
                    </div>
                  ))}
                </>
              )}

              <div className="flex justify-between px-4 py-3 text-sm font-medium border-t bg-muted/30">
                <span>{t("invoice.invoiceTotal")}</span>
                <span className="tabular-nums">{formatCurrency(invoice.totalAmount, locale)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
