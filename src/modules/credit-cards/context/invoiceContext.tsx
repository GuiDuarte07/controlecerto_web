import { create } from "zustand";
import { addMonths, format } from "date-fns";
import { ApiError, toApiError } from "@/shared/lib/api-client";
import { invoiceService } from "../services/invoice.service";
import type { Invoice, InvoicePageData, InvoiceTransaction } from "../types/invoice.types";
import type { CreditPurchaseFormData } from "../schemas/creditPurchase.schemas";
import type { InvoicePaymentFormData } from "../schemas/invoicePayment.schemas";

interface InvoiceState {
  currentInvoice: Invoice | null;
  nextInvoiceId: number | null;
  prevInvoiceId: number | null;
  creditCardId: number | null;
  browsedDate: Date | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: ApiError | null;
  isPurchaseDialogOpen: boolean;
  isPaymentDialogOpen: boolean;
  selectedPurchase: InvoiceTransaction | null;
}

interface InvoiceActions {
  init: (creditCardId: number) => Promise<void>;
  loadByDate: (creditCardId: number, year: number, month: number) => Promise<void>;
  loadById: (invoiceId: number) => Promise<void>;
  navigateNext: () => Promise<void>;
  navigatePrev: () => Promise<void>;
  createPurchase: (data: CreditPurchaseFormData) => Promise<void>;
  updatePurchase: (id: number, data: CreditPurchaseFormData) => Promise<void>;
  deletePurchase: (id: number) => Promise<void>;
  payInvoice: (data: InvoicePaymentFormData) => Promise<void>;
  deletePayment: (id: number) => Promise<void>;
  openCreatePurchaseDialog: () => void;
  openEditPurchaseDialog: (purchase: InvoiceTransaction) => void;
  closePurchaseDialog: () => void;
  openPaymentDialog: () => void;
  closePaymentDialog: () => void;
  clearError: () => void;
  reset: () => void;
}

type InvoiceStore = InvoiceState & InvoiceActions;

const initialState: InvoiceState = {
  currentInvoice: null,
  nextInvoiceId: null,
  prevInvoiceId: null,
  creditCardId: null,
  browsedDate: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  isPurchaseDialogOpen: false,
  isPaymentDialogOpen: false,
  selectedPurchase: null,
};

export const useInvoiceStore = create<InvoiceStore>((set, get) => ({
  ...initialState,

  init: async (creditCardId) => {
    const now = new Date();
    set({ creditCardId });
    await get().loadByDate(creditCardId, now.getFullYear(), now.getMonth() + 1);
  },

  loadByDate: async (creditCardId, year, month) => {
    const browsedDate = new Date(year, month - 1, 1);
    set({ isLoading: true, error: null, browsedDate });
    try {
      const dateStr = format(browsedDate, "yyyy-MM-dd'T'HH:mm:ss");
      const invoices = await invoiceService.getByDate(creditCardId, dateStr, dateStr);
      if (invoices.length === 0) {
        set({ currentInvoice: null, nextInvoiceId: null, prevInvoiceId: null, isLoading: false });
        return;
      }
      await get().loadById(invoices[0].id);
    } catch (err) {
      const error = toApiError(err, "invoices.feedback.loadError");
      set({ error, isLoading: false });
    }
  },

  loadById: async (invoiceId) => {
    set({ isLoading: true, error: null });
    try {
      const data: InvoicePageData = await invoiceService.getById(invoiceId);
      set({
        currentInvoice: data.invoice,
        nextInvoiceId: data.nextInvoiceId,
        prevInvoiceId: data.prevInvoiceId,
        isLoading: false,
      });
    } catch (err) {
      const error = toApiError(err, "invoices.feedback.loadError");
      set({ error, isLoading: false });
    }
  },

  navigateNext: async () => {
    const { nextInvoiceId, browsedDate, creditCardId } = get();
    if (nextInvoiceId) {
      await get().loadById(nextInvoiceId);
    } else if (browsedDate && creditCardId) {
      const next = addMonths(browsedDate, 1);
      await get().loadByDate(creditCardId, next.getFullYear(), next.getMonth() + 1);
    }
  },

  navigatePrev: async () => {
    const { prevInvoiceId, browsedDate, creditCardId } = get();
    if (prevInvoiceId) {
      await get().loadById(prevInvoiceId);
    } else if (browsedDate && creditCardId) {
      const prev = addMonths(browsedDate, -1);
      await get().loadByDate(creditCardId, prev.getFullYear(), prev.getMonth() + 1);
    }
  },

  createPurchase: async (data) => {
    const { currentInvoice, creditCardId } = get();
    if (!creditCardId) return;
    set({ isSubmitting: true, error: null });
    try {
      await invoiceService.createPurchase({
        creditCardId,
        categoryId: data.categoryId,
        name: data.name,
        totalAmount: data.totalAmount,
        purchaseDate: format(data.purchaseDate, "yyyy-MM-dd'T'HH:mm:ss"),
        installments: data.installments,
        firstInvoiceDate: data.firstInvoiceDate
          ? format(data.firstInvoiceDate, "yyyy-MM-dd'T'HH:mm:ss")
          : undefined,
      });
      set({ isSubmitting: false, isPurchaseDialogOpen: false });
      if (currentInvoice) await get().loadById(currentInvoice.id);
    } catch (err) {
      const error = toApiError(err, "invoices.feedback.purchaseCreateError");
      set({ error, isSubmitting: false });
      throw error;
    }
  },

  updatePurchase: async (id, data) => {
    const { currentInvoice } = get();
    set({ isSubmitting: true, error: null });
    try {
      await invoiceService.updatePurchase(id, {
        name: data.name,
        totalAmount: data.totalAmount,
        installments: data.installments,
        purchaseDate: format(data.purchaseDate, "yyyy-MM-dd'T'HH:mm:ss"),
        categoryId: data.categoryId,
      });
      set({ isSubmitting: false, isPurchaseDialogOpen: false, selectedPurchase: null });
      if (currentInvoice) await get().loadById(currentInvoice.id);
    } catch (err) {
      const error = toApiError(err, "invoices.feedback.purchaseUpdateError");
      set({ error, isSubmitting: false });
      throw error;
    }
  },

  deletePurchase: async (id) => {
    const { currentInvoice } = get();
    set({ isSubmitting: true, error: null });
    try {
      await invoiceService.deletePurchase(id);
      set({ isSubmitting: false });
      if (currentInvoice) await get().loadById(currentInvoice.id);
    } catch (err) {
      const error = toApiError(err, "invoices.feedback.purchaseDeleteError");
      set({ error, isSubmitting: false });
      throw error;
    }
  },

  payInvoice: async (data) => {
    const { currentInvoice } = get();
    if (!currentInvoice) return;
    set({ isSubmitting: true, error: null });
    try {
      await invoiceService.payInvoice(currentInvoice.id, {
        accountId: data.accountId,
        amountPaid: data.amountPaid,
        description: data.description,
        paymentDate: format(data.paymentDate, "yyyy-MM-dd'T'HH:mm:ss"),
        justForRecord: data.justForRecord,
      });
      set({ isSubmitting: false, isPaymentDialogOpen: false });
      await get().loadById(currentInvoice.id);
    } catch (err) {
      const error = toApiError(err, "invoices.feedback.paymentCreateError");
      set({ error, isSubmitting: false });
      throw error;
    }
  },

  deletePayment: async (id) => {
    const { currentInvoice } = get();
    set({ isSubmitting: true, error: null });
    try {
      await invoiceService.deletePayment(id);
      set({ isSubmitting: false });
      if (currentInvoice) await get().loadById(currentInvoice.id);
    } catch (err) {
      const error = toApiError(err, "invoices.feedback.paymentDeleteError");
      set({ error, isSubmitting: false });
      throw error;
    }
  },

  openCreatePurchaseDialog: () =>
    set({ isPurchaseDialogOpen: true, selectedPurchase: null, error: null }),

  openEditPurchaseDialog: (purchase) =>
    set({ isPurchaseDialogOpen: true, selectedPurchase: purchase, error: null }),

  closePurchaseDialog: () =>
    set({ isPurchaseDialogOpen: false, selectedPurchase: null }),

  openPaymentDialog: () => set({ isPaymentDialogOpen: true, error: null }),

  closePaymentDialog: () => set({ isPaymentDialogOpen: false }),

  clearError: () => set({ error: null }),

  reset: () => set(initialState),
}));
