import { create } from "zustand";
import { ApiError, toApiError } from "@/shared/lib/api-client";
import { recurringTransactionsService } from "../services/recurring-transactions.service";
import type {
  CreateRecurringTransactionRequest,
  RecurringTransaction,
  RecurringTransactionInstance,
  UpdateRecurringTransactionRequest,
} from "../types/recurring-transactions.types";

interface RecurringTransactionsState {
  transactions: RecurringTransaction[];
  pendingInstances: RecurringTransactionInstance[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: ApiError | null;
}

interface RecurringTransactionsActions {
  fetchData: () => Promise<void>;
  createTransaction: (data: CreateRecurringTransactionRequest) => Promise<void>;
  updateTransaction: (id: number, data: UpdateRecurringTransactionRequest) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;
  processInstances: (ids: number[], action: "CONFIRMED" | "REJECTED", rejectReason?: string) => Promise<void>;
  clearError: () => void;
}

type RecurringTransactionsStore = RecurringTransactionsState & RecurringTransactionsActions;

const initialState: RecurringTransactionsState = {
  transactions: [],
  pendingInstances: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
};

export const useRecurringTransactionsStore = create<RecurringTransactionsStore>((set, get) => ({
  ...initialState,

  fetchData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [transactions, pendingInstances] = await Promise.all([
        recurringTransactionsService.getAll(),
        recurringTransactionsService.getInstances("PENDING"),
      ]);
      set({ transactions, pendingInstances, isLoading: false });
    } catch (err) {
      const error = toApiError(err, "recurringTransactions.feedback.loadError");
      set({ error, isLoading: false });
      throw error;
    }
  },

  createTransaction: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      await recurringTransactionsService.create(data);
      set({ isSubmitting: false });
      await get().fetchData();
    } catch (err) {
      const error = toApiError(err, "recurringTransactions.feedback.createError");
      set({ error, isSubmitting: false });
      throw error;
    }
  },

  updateTransaction: async (id, data) => {
    set({ isSubmitting: true, error: null });
    try {
      await recurringTransactionsService.update(id, data);
      set({ isSubmitting: false });
      await get().fetchData();
    } catch (err) {
      const error = toApiError(err, "recurringTransactions.feedback.updateError");
      set({ error, isSubmitting: false });
      throw error;
    }
  },

  deleteTransaction: async (id) => {
    set({ isSubmitting: true, error: null });
    try {
      await recurringTransactionsService.remove(id);
      set({ isSubmitting: false });
      await get().fetchData();
    } catch (err) {
      const error = toApiError(err, "recurringTransactions.feedback.deleteError");
      set({ error, isSubmitting: false });
      throw error;
    }
  },

  processInstances: async (ids, action, rejectReason) => {
    set({ isSubmitting: true, error: null });
    try {
      await recurringTransactionsService.process(ids, action, rejectReason);
      set({ isSubmitting: false });
      await get().fetchData();
    } catch (err) {
      const error = toApiError(err, "recurringTransactions.feedback.processError");
      set({ error, isSubmitting: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
