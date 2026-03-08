"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { ChevronLeft } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { Button } from "@/shared/components/ui/button";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { TransactionTypeSelector } from "./TransactionTypeSelector";
import { ExpenseIncomeForm } from "./forms/ExpenseIncomeForm";
import { CreditExpenseForm } from "./forms/CreditExpenseForm";
import { TransferenceForm } from "./forms/TransferenceForm";
import type { ExpenseIncomeFormData, CreditExpenseFormData, TransferenceFormData } from "../schemas/transactions.schemas";
import type { TransactionType } from "../types/transactions.types";
import { useTransactionsStore } from "../context/transactionsContext";

type SelectableType = "EXPENSE" | "INCOME" | "CREDITEXPENSE" | "TRANSFERENCE";

interface CreateTransactionDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CreateTransactionDrawer({ open, onClose }: CreateTransactionDrawerProps) {
  const t = useTranslations("transactions");
  const isMobile = useIsMobile();
  const [selectedType, setSelectedType] = useState<SelectableType | null>(null);
  const isSubmitting = useTransactionsStore((s) => s.isSubmitting);
  const createExpenseIncome = useTransactionsStore((s) => s.createExpenseIncome);
  const createCreditExpense = useTransactionsStore((s) => s.createCreditExpense);
  const createTransference = useTransactionsStore((s) => s.createTransference);

  const handleOpenChange = (v: boolean) => {
    if (!v) {
      onClose();
      setSelectedType(null);
    }
  };

  const handleTypeSelect = (type: SelectableType) => {
    setSelectedType(type);
  };

  const handleBack = () => {
    setSelectedType(null);
  };

  const handleExpenseIncomeSubmit = async (data: ExpenseIncomeFormData) => {
    await createExpenseIncome({
      amount: data.amount,
      type: selectedType as "EXPENSE" | "INCOME",
      purchaseDate: format(data.purchaseDate, "yyyy-MM-dd'T'HH:mm:ss"),
      destination: data.destination,
      description: data.description || undefined,
      observations: data.observations || undefined,
      accountId: data.accountId,
      categoryId: data.categoryId,
      justForRecord: data.justForRecord,
    });
    setSelectedType(null);
  };

  const handleCreditExpenseSubmit = async (data: CreditExpenseFormData) => {
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
  };

  const handleTransferenceSubmit = async (data: TransferenceFormData) => {
    await createTransference({
      amount: data.amount,
      purchaseDate: format(data.purchaseDate, "yyyy-MM-dd'T'HH:mm:ss"),
      accountOriginId: data.accountOriginId,
      accountDestinyId: data.accountDestinyId,
      description: data.description || undefined,
    });
    setSelectedType(null);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={isMobile ? "h-[90dvh] overflow-y-auto" : "w-[480px] overflow-y-auto"}
      >
        <SheetHeader>
          <div className="flex items-center gap-2">
            {selectedType && (
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
            <SheetTitle>{t("create.title")}</SheetTitle>
          </div>
        </SheetHeader>

        <div className="mt-4 px-1 pb-4">
          {!selectedType && (
            <TransactionTypeSelector onSelect={handleTypeSelect} />
          )}

          {selectedType === "EXPENSE" && (
            <ExpenseIncomeForm
              type="EXPENSE"
              onSubmit={handleExpenseIncomeSubmit}
              onCancel={handleBack}
              isSubmitting={isSubmitting}
            />
          )}

          {selectedType === "INCOME" && (
            <ExpenseIncomeForm
              type="INCOME"
              onSubmit={handleExpenseIncomeSubmit}
              onCancel={handleBack}
              isSubmitting={isSubmitting}
            />
          )}

          {selectedType === "CREDITEXPENSE" && (
            <CreditExpenseForm
              onSubmit={handleCreditExpenseSubmit}
              onCancel={handleBack}
              isSubmitting={isSubmitting}
            />
          )}

          {selectedType === "TRANSFERENCE" && (
            <TransferenceForm
              onSubmit={handleTransferenceSubmit}
              onCancel={handleBack}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
