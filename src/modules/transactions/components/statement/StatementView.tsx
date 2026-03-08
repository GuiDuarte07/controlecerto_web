"use client";

import { useState } from "react";
import { startOfMonth, endOfMonth } from "date-fns";
import { StatementFilters } from "./StatementFilters";
import { StatementSummaryBar } from "./StatementSummaryBar";
import { StatementTable } from "./StatementTable";
import type { StatementPagination, StatementSummary, Transaction, TransactionFilters } from "../../types/transactions.types";

interface StatementViewProps {
  transactions: Transaction[];
  pagination: StatementPagination | null;
  summary: StatementSummary | null;
  isLoading: boolean;
  onTransactionClick: (transaction: Transaction) => void;
  onFiltersApply: (filters: TransactionFilters & { dateStart?: Date; dateEnd?: Date }) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function StatementView({
  transactions,
  pagination,
  summary,
  isLoading,
  onTransactionClick,
  onFiltersApply,
  onPageChange,
  onPageSizeChange,
}: StatementViewProps) {
  const [filters, setFilters] = useState<TransactionFilters>({ sort: "date desc" });
  const [dateStart, setDateStart] = useState<Date | undefined>(startOfMonth(new Date()));
  const [dateEnd, setDateEnd] = useState<Date | undefined>(endOfMonth(new Date()));

  const handleApply = () => {
    onFiltersApply({ ...filters, dateStart, dateEnd });
  };

  const handleClear = () => {
    const defaultStart = startOfMonth(new Date());
    const defaultEnd = endOfMonth(new Date());
    setFilters({ sort: "date desc" });
    setDateStart(defaultStart);
    setDateEnd(defaultEnd);
    onFiltersApply({ sort: "date desc", dateStart: defaultStart, dateEnd: defaultEnd });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <StatementFilters
          filters={filters}
          dateStart={dateStart}
          dateEnd={dateEnd}
          showDateRange={true}
          onFiltersChange={setFilters}
          onDateStartChange={setDateStart}
          onDateEndChange={setDateEnd}
          onApply={handleApply}
          onClear={handleClear}
        />
      </div>

      {summary && <StatementSummaryBar summary={summary} />}

      <StatementTable
        transactions={transactions}
        pagination={pagination}
        isLoading={isLoading}
        onTransactionClick={onTransactionClick}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}
