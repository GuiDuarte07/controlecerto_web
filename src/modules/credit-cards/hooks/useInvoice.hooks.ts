"use client";

import { useEffect } from "react";
import { useInvoiceStore } from "../context/invoiceContext";

export function useInvoiceData(creditCardId: number) {
  const currentInvoice = useInvoiceStore((s) => s.currentInvoice);
  const nextInvoiceId = useInvoiceStore((s) => s.nextInvoiceId);
  const prevInvoiceId = useInvoiceStore((s) => s.prevInvoiceId);
  const browsedDate = useInvoiceStore((s) => s.browsedDate);
  const isLoading = useInvoiceStore((s) => s.isLoading);
  const error = useInvoiceStore((s) => s.error);
  const init = useInvoiceStore((s) => s.init);
  const reset = useInvoiceStore((s) => s.reset);

  useEffect(() => {
    void init(creditCardId);
    return () => reset();
  }, [creditCardId, init, reset]);

  return {
    currentInvoice,
    nextInvoiceId,
    prevInvoiceId,
    browsedDate,
    isLoading,
    error,
  };
}

export function useInvoiceNavigation() {
  const navigateNext = useInvoiceStore((s) => s.navigateNext);
  const navigatePrev = useInvoiceStore((s) => s.navigatePrev);
  const nextInvoiceId = useInvoiceStore((s) => s.nextInvoiceId);
  const prevInvoiceId = useInvoiceStore((s) => s.prevInvoiceId);
  const browsedDate = useInvoiceStore((s) => s.browsedDate);
  const isLoading = useInvoiceStore((s) => s.isLoading);

  const now = new Date();
  const isInPast = browsedDate
    ? browsedDate.getFullYear() < now.getFullYear() ||
      (browsedDate.getFullYear() === now.getFullYear() &&
        browsedDate.getMonth() < now.getMonth())
    : false;

  return {
    navigateNext: () => void navigateNext(),
    navigatePrev: () => void navigatePrev(),
    hasNext: nextInvoiceId !== null || isInPast,
    hasPrev: prevInvoiceId !== null || browsedDate !== null,
    isLoading,
  };
}

export function useInvoiceActions() {
  const isSubmitting = useInvoiceStore((s) => s.isSubmitting);
  const isPurchaseDialogOpen = useInvoiceStore((s) => s.isPurchaseDialogOpen);
  const isPaymentDialogOpen = useInvoiceStore((s) => s.isPaymentDialogOpen);
  const selectedPurchase = useInvoiceStore((s) => s.selectedPurchase);
  const createPurchase = useInvoiceStore((s) => s.createPurchase);
  const updatePurchase = useInvoiceStore((s) => s.updatePurchase);
  const deletePurchase = useInvoiceStore((s) => s.deletePurchase);
  const payInvoice = useInvoiceStore((s) => s.payInvoice);
  const deletePayment = useInvoiceStore((s) => s.deletePayment);
  const openCreatePurchaseDialog = useInvoiceStore(
    (s) => s.openCreatePurchaseDialog,
  );
  const openEditPurchaseDialog = useInvoiceStore(
    (s) => s.openEditPurchaseDialog,
  );
  const closePurchaseDialog = useInvoiceStore((s) => s.closePurchaseDialog);
  const openPaymentDialog = useInvoiceStore((s) => s.openPaymentDialog);
  const closePaymentDialog = useInvoiceStore((s) => s.closePaymentDialog);
  const clearError = useInvoiceStore((s) => s.clearError);

  return {
    isSubmitting,
    isPurchaseDialogOpen,
    isPaymentDialogOpen,
    selectedPurchase,
    createPurchase,
    updatePurchase,
    deletePurchase,
    payInvoice,
    deletePayment,
    openCreatePurchaseDialog,
    openEditPurchaseDialog,
    closePurchaseDialog,
    openPaymentDialog,
    closePaymentDialog,
    clearError,
  };
}
