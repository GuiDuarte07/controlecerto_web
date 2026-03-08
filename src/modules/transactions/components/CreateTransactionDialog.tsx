"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { ChevronLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { TransactionTypeSelector } from "./TransactionTypeSelector";
import { ExpenseIncomeForm } from "./forms/ExpenseIncomeForm";
import { CreditExpenseForm } from "./forms/CreditExpenseForm";
import { TransferenceForm } from "./forms/TransferenceForm";
import type {
  ExpenseIncomeFormData,
  CreditExpenseFormData,
  TransferenceFormData,
} from "../schemas/transactions.schemas";
import type { Transaction } from "../types/transactions.types";
import { useTransactionsStore } from "../context/transactionsContext";

type SelectableType = "EXPENSE" | "INCOME" | "CREDITEXPENSE" | "TRANSFERENCE";

const TYPE_COLORS: Record<SelectableType, string> = {
  EXPENSE: "#ef4444",
  INCOME: "#22c55e",
  CREDITEXPENSE: "#a855f7",
  TRANSFERENCE: "#3b82f6",
};

interface CreateTransactionDialogProps {
  open: boolean;
  mode?: "create" | "edit";
  transaction?: Transaction | null;
  onClose: () => void;
}

function toExpenseIncomeInitial(tx: Transaction): Partial<ExpenseIncomeFormData> {
  return {
    amount: tx.amount,
    purchaseDate: new Date(tx.purchaseDate),
    categoryId: tx.category?.id,
    accountId: tx.account?.id,
    destination: tx.destination ?? "",
    description: tx.description ?? "",
    observations: tx.observations ?? "",
    justForRecord: tx.justForRecord,
  };
}

function toCreditExpenseInitial(tx: Transaction): Partial<CreditExpenseFormData> {
  const cp = tx.creditPurchase;
  const totalInstallment = cp?.totalInstallment ?? 1;
  const totalAmount = cp?.totalAmount ?? tx.amount;
  return {
    totalAmount,
    totalInstallment,
    installmentAmount: totalInstallment > 0 ? totalAmount / totalInstallment : totalAmount,
    purchaseDate: new Date(tx.purchaseDate),
    categoryId: tx.category?.id,
    creditCardId: cp?.creditCardId,
    destination: tx.destination ?? "",
    description: tx.description ?? "",
  };
}

function toTransferenceInitial(tx: Transaction): Partial<TransferenceFormData> {
  return {
    amount: tx.amount,
    purchaseDate: new Date(tx.purchaseDate),
    accountOriginId: tx.account?.id,
    description: tx.description ?? "",
  };
}

export function CreateTransactionDialog({
  open,
  mode = "create",
  transaction,
  onClose,
}: CreateTransactionDialogProps) {
  const t = useTranslations("transactions");
  const [selectedType, setSelectedType] = useState<SelectableType | null>(null);

  const isSubmitting = useTransactionsStore((s) => s.isSubmitting);
  const createExpenseIncome = useTransactionsStore((s) => s.createExpenseIncome);
  const createCreditExpense = useTransactionsStore((s) => s.createCreditExpense);
  const createTransference = useTransactionsStore((s) => s.createTransference);
  const updateTransaction = useTransactionsStore((s) => s.updateTransaction);
  const updateCreditPurchase = useTransactionsStore((s) => s.updateCreditPurchase);

  const handleOpenChange = (v: boolean) => {
    if (!v) {
      onClose();
      setSelectedType(null);
    }
  };

  const handleBack = () => {
    if (mode === "edit") {
      onClose();
    } else {
      setSelectedType(null);
    }
  };

  const effectiveType: SelectableType | null =
    mode === "edit" && transaction
      ? (transaction.type as SelectableType)
      : selectedType;

  const handleExpenseIncomeSubmit = async (data: ExpenseIncomeFormData) => {
    if (mode === "edit" && transaction) {
      await updateTransaction(transaction.id, {
        id: transaction.id,
        amount: data.amount,
        purchaseDate: format(data.purchaseDate, "yyyy-MM-dd'T'HH:mm:ss"),
        destination: data.destination || undefined,
        description: data.description || undefined,
        observations: data.observations || undefined,
        categoryId: data.categoryId,
        justForRecord: data.justForRecord,
      });
      onClose();
    } else {
      await createExpenseIncome({
        amount: data.amount,
        type: effectiveType as "EXPENSE" | "INCOME",
        purchaseDate: format(data.purchaseDate, "yyyy-MM-dd'T'HH:mm:ss"),
        destination: data.destination,
        description: data.description || undefined,
        observations: data.observations || undefined,
        accountId: data.accountId,
        categoryId: data.categoryId,
        justForRecord: data.justForRecord,
      });
      setSelectedType(null);
    }
  };

  const handleCreditExpenseSubmit = async (data: CreditExpenseFormData) => {
    if (mode === "edit" && transaction?.creditPurchase) {
      await updateCreditPurchase(transaction.creditPurchase.id, {
        id: transaction.creditPurchase.id,
        totalAmount: data.totalAmount,
        totalInstallment: data.totalInstallment,
        purchaseDate: format(data.purchaseDate, "yyyy-MM-dd'T'HH:mm:ss"),
        destination: data.destination || undefined,
        description: data.description || undefined,
        creditCardId: data.creditCardId,
        categoryId: data.categoryId,
      });
      onClose();
    } else {
      await createCreditExpense({
        totalAmount: data.totalAmount,
        totalInstallment: data.totalInstallment,
        installmentsPaid: 0,
        purchaseDate: format(data.purchaseDate, "yyyy-MM-dd'T'HH:mm:ss"),
        destination: data.destination,
        description: data.description || undefined,
        creditCardId: data.creditCardId,
        categoryId: data.categoryId,
      });
      setSelectedType(null);
    }
  };

  const handleTransferenceSubmit = async (data: TransferenceFormData) => {
    if (mode === "edit" && transaction) {
      await updateTransaction(transaction.id, {
        id: transaction.id,
        amount: data.amount,
        purchaseDate: format(data.purchaseDate, "yyyy-MM-dd'T'HH:mm:ss"),
        description: data.description || undefined,
      });
      onClose();
    } else {
      await createTransference({
        amount: data.amount,
        purchaseDate: format(data.purchaseDate, "yyyy-MM-dd'T'HH:mm:ss"),
        accountOriginId: data.accountOriginId,
        accountDestinyId: data.accountDestinyId,
        description: data.description || undefined,
      });
      setSelectedType(null);
    }
  };

  const showTypeSelector = mode === "create" && !effectiveType;

  const expenseIncomeInitial =
    mode === "edit" && transaction && (transaction.type === "EXPENSE" || transaction.type === "INCOME")
      ? toExpenseIncomeInitial(transaction)
      : undefined;

  const creditExpenseInitial =
    mode === "edit" && transaction && transaction.type === "CREDITEXPENSE"
      ? toCreditExpenseInitial(transaction)
      : undefined;

  const transferenceInitial =
    mode === "edit" && transaction && transaction.type === "TRANSFERENCE"
      ? toTransferenceInitial(transaction)
      : undefined;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90dvh] overflow-y-auto">
        {effectiveType && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
            <div
              style={{
                width: 0,
                height: 0,
                borderTop: `56px solid ${TYPE_COLORS[effectiveType]}`,
                borderRight: "56px solid transparent",
              }}
            />
          </div>
        )}

        <DialogHeader>
          <div className="flex items-center gap-2">
            {mode === "create" && effectiveType && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-8 w-8 shrink-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <DialogTitle>
              {mode === "edit" ? t("detail.edit") : t("create.title")}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="mt-2 pb-2">
          {showTypeSelector && (
            <TransactionTypeSelector onSelect={(type) => setSelectedType(type as SelectableType)} />
          )}

          {(effectiveType === "EXPENSE" || effectiveType === "INCOME") && (
            <ExpenseIncomeForm
              type={effectiveType}
              onSubmit={handleExpenseIncomeSubmit}
              onCancel={handleBack}
              isSubmitting={isSubmitting}
              initialData={expenseIncomeInitial}
            />
          )}

          {effectiveType === "CREDITEXPENSE" && (
            <CreditExpenseForm
              onSubmit={handleCreditExpenseSubmit}
              onCancel={handleBack}
              isSubmitting={isSubmitting}
              initialData={creditExpenseInitial}
            />
          )}

          {effectiveType === "TRANSFERENCE" && (
            <TransferenceForm
              onSubmit={handleTransferenceSubmit}
              onCancel={handleBack}
              isSubmitting={isSubmitting}
              initialData={transferenceInitial}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
