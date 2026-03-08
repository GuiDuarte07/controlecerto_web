"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { InvoiceMonthNav } from "./InvoiceMonthNav";
import { InvoiceCard } from "./InvoiceCard";
import { TransactionRow } from "../shared/TransactionRow";
import { StatementFilters } from "../statement/StatementFilters";
import { StatementSummaryBar } from "../statement/StatementSummaryBar";
import type { Invoice, StatementSummary, Transaction, TransactionFilters } from "../../types/transactions.types";

interface InvoiceViewProps {
  invoices: Invoice[];
  invoiceTransactions: Transaction[];
  invoiceMonthDate: Date;
  isLoading: boolean;
  filters: TransactionFilters;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onTransactionClick: (transaction: Transaction) => void;
  onFiltersChange: (filters: TransactionFilters) => void;
  onFiltersClear: () => void;
}

function filterTransaction(tx: Transaction, filters: TransactionFilters): boolean {
  if (filters.accountId && tx.account?.id !== filters.accountId) return false;
  if (filters.categoryId && tx.category?.id !== filters.categoryId) return false;
  return true;
}

function filterInvoice(invoice: Invoice, filters: TransactionFilters): Invoice {
  if (filters.cardId && invoice.creditCard.id !== filters.cardId) {
    return { ...invoice, transactions: [] };
  }
  const filteredTxs = (invoice.transactions ?? []).filter((tx) => filterTransaction(tx, filters));
  return { ...invoice, transactions: filteredTxs };
}

function computeInvoiceSummary(
  transactions: Transaction[],
  invoices: Invoice[],
): StatementSummary {
  const totalIncome = transactions.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);
  const totalCreditCharges = invoices.reduce((s, inv) => s + inv.totalAmount, 0);
  const totalInvoicePayments = invoices.reduce((s, inv) => s + (inv.totalPaid ?? 0), 0);
  return {
    totalIncome,
    totalExpense,
    totalCreditCharges,
    totalInvoicePayments,
    netBalance: totalIncome - totalExpense - totalCreditCharges,
    totalItems: transactions.length + invoices.reduce((s, inv) => s + (inv.transactions?.length ?? 0), 0),
  };
}

export function InvoiceView({
  invoices,
  invoiceTransactions,
  invoiceMonthDate,
  isLoading,
  filters,
  onPrevMonth,
  onNextMonth,
  onTransactionClick,
  onFiltersChange,
  onFiltersClear,
}: InvoiceViewProps) {
  const t = useTranslations("transactions");

  const filteredTransactions = useMemo(
    () => invoiceTransactions.filter((tx) => filterTransaction(tx, filters)),
    [invoiceTransactions, filters],
  );

  const filteredInvoices = useMemo(
    () => invoices.map((inv) => filterInvoice(inv, filters)),
    [invoices, filters],
  );

  const summary = useMemo(
    () => computeInvoiceSummary(filteredTransactions, filteredInvoices),
    [filteredTransactions, filteredInvoices],
  );

  const hasData = filteredTransactions.length > 0 || filteredInvoices.some((inv) => (inv.transactions?.length ?? 0) > 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <InvoiceMonthNav
          date={invoiceMonthDate}
          onPrev={onPrevMonth}
          onNext={onNextMonth}
        />
        <StatementFilters
          filters={filters}
          showDateRange={false}
          onFiltersChange={onFiltersChange}
          onDateStartChange={() => undefined}
          onDateEndChange={() => undefined}
          onApply={() => undefined}
          onClear={onFiltersClear}
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
        </div>
      ) : (
        <>
          <StatementSummaryBar summary={summary} />

          {!hasData && (
            <p className="text-center text-sm text-muted-foreground py-8">
              {t("invoice.noTransactions")}
            </p>
          )}

          {/* Other transactions first */}
          {filteredTransactions.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-muted-foreground">
                {t("invoice.otherTransactions")}
              </h3>
              <div className="rounded-lg border bg-card divide-y">
                {filteredTransactions.map((tx) => (
                  <TransactionRow
                    key={tx.id}
                    transaction={tx}
                    onClick={onTransactionClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Invoices after */}
          {filteredInvoices.length > 0 && (
            <div className="flex flex-col gap-3">
              {filteredInvoices.map((invoice) => (
                <InvoiceCard
                  key={invoice.id}
                  invoice={invoice}
                  onTransactionClick={onTransactionClick}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
