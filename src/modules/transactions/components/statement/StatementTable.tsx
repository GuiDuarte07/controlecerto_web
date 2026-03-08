"use client";

import { useTranslations } from "next-intl";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/shared/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { TransactionRow } from "../shared/TransactionRow";
import type { Transaction, StatementPagination } from "../../types/transactions.types";

interface StatementTableProps {
  transactions: Transaction[];
  pagination: StatementPagination | null;
  isLoading: boolean;
  onTransactionClick: (transaction: Transaction) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function StatementTable({
  transactions,
  pagination,
  isLoading,
  onTransactionClick,
  onPageChange,
  onPageSizeChange,
}: StatementTableProps) {
  const t = useTranslations("transactions");

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-8">
        {t("statement.noTransactions")}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-lg border bg-card divide-y">
        {transactions.map((tx) => (
          <TransactionRow
            key={tx.id}
            transaction={tx}
            onClick={onTransactionClick}
          />
        ))}
      </div>

      {pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              {t("statement.totalItems", { count: pagination.totalItems })}
            </span>
            <Select
              value={String(pagination.pageSize)}
              onValueChange={(v) => onPageSizeChange(Number(v))}
            >
              <SelectTrigger className="h-8 w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {t("statement.page", { page: pagination.currentPage, total: pagination.totalPages })}
            </span>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => onPageChange(pagination.currentPage - 1)}
                    aria-disabled={!pagination.hasPreviousPage}
                    className={
                      !pagination.hasPreviousPage
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() => onPageChange(pagination.currentPage + 1)}
                    aria-disabled={!pagination.hasNextPage}
                    className={
                      !pagination.hasNextPage
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}
    </div>
  );
}
