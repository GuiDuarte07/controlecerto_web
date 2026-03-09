import { create } from "zustand";
import { format } from "date-fns";
import { ApiError, toApiError } from "@/shared/lib/api-client";
import { investmentsService } from "../services/investments.service";
import type { Investment } from "../types/investments.types";
import type {
  CreateInvestmentFormData,
  EditInvestmentFormData,
  DepositWithdrawFormData,
  AdjustFormData,
} from "../schemas/investments.schemas";

interface InvestmentsState {
  investments: Investment[];
  selectedInvestment: Investment | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: ApiError | null;
}

interface InvestmentsActions {
  fetchAll: () => Promise<void>;
  fetchById: (id: number) => Promise<void>;
  create: (data: CreateInvestmentFormData) => Promise<void>;
  update: (id: number, data: EditInvestmentFormData) => Promise<void>;
  deposit: (id: number, data: DepositWithdrawFormData) => Promise<void>;
  withdraw: (id: number, data: DepositWithdrawFormData) => Promise<void>;
  adjust: (id: number, data: AdjustFormData) => Promise<void>;
  remove: (id: number) => Promise<void>;
  setSelectedInvestment: (investment: Investment | null) => void;
  clearError: () => void;
}

type InvestmentsStore = InvestmentsState & InvestmentsActions;

const initialState: InvestmentsState = {
  investments: [],
  selectedInvestment: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
};

function toDateStr(date: Date) {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss");
}

export const useInvestmentsStore = create<InvestmentsStore>((set, get) => ({
  ...initialState,

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const investments = await investmentsService.getAll();
      set({ investments, isLoading: false });
    } catch (err) {
      set({
        error: toApiError(err, "investments.feedback.loadError"),
        isLoading: false,
      });
    }
  },

  fetchById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const investment = await investmentsService.getById(id);
      set({ selectedInvestment: investment, isLoading: false });
    } catch (err) {
      set({
        error: toApiError(err, "investments.feedback.loadError"),
        isLoading: false,
      });
    }
  },

  create: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      await investmentsService.create({
        name: data.name,
        initialAmount: data.initialAmount,
        startDate: toDateStr(data.startDate),
        description: data.description,
      });
      await get().fetchAll();
      set({ isSubmitting: false });
    } catch (err) {
      set({
        error: toApiError(err, "investments.feedback.createError"),
        isSubmitting: false,
      });
      throw err;
    }
  },

  update: async (id, data) => {
    set({ isSubmitting: true, error: null });
    try {
      const updated = await investmentsService.update(id, {
        name: data.name,
        startDate: toDateStr(data.startDate),
        description: data.description,
      });
      set((state) => ({
        investments: state.investments.map((i) =>
          i.id === id ? { ...i, ...updated } : i,
        ),
        selectedInvestment:
          state.selectedInvestment?.id === id
            ? { ...state.selectedInvestment, ...updated }
            : state.selectedInvestment,
        isSubmitting: false,
      }));
    } catch (err) {
      set({
        error: toApiError(err, "investments.feedback.updateError"),
        isSubmitting: false,
      });
      throw err;
    }
  },

  deposit: async (id, data) => {
    set({ isSubmitting: true, error: null });
    try {
      const updated = await investmentsService.deposit(id, {
        amount: data.amount,
        accountId: data.accountId,
        occurredAt: data.occurredAt ? toDateStr(data.occurredAt) : undefined,
        note: data.note,
      });
      set({ selectedInvestment: updated, isSubmitting: false });
    } catch (err) {
      set({
        error: toApiError(err, "investments.feedback.depositError"),
        isSubmitting: false,
      });
      throw err;
    }
  },

  withdraw: async (id, data) => {
    set({ isSubmitting: true, error: null });
    try {
      const updated = await investmentsService.withdraw(id, {
        amount: data.amount,
        accountId: data.accountId,
        occurredAt: data.occurredAt ? toDateStr(data.occurredAt) : undefined,
        note: data.note,
      });
      set({ selectedInvestment: updated, isSubmitting: false });
    } catch (err) {
      set({
        error: toApiError(err, "investments.feedback.withdrawError"),
        isSubmitting: false,
      });
      throw err;
    }
  },

  adjust: async (id, data) => {
    set({ isSubmitting: true, error: null });
    try {
      const updated = await investmentsService.adjust(id, {
        newTotalValue: data.newTotalValue,
        occurredAt: data.occurredAt ? toDateStr(data.occurredAt) : undefined,
        note: data.note,
      });
      set({ selectedInvestment: updated, isSubmitting: false });
    } catch (err) {
      set({
        error: toApiError(err, "investments.feedback.adjustError"),
        isSubmitting: false,
      });
      throw err;
    }
  },

  remove: async (id) => {
    set({ isSubmitting: true, error: null });
    try {
      await investmentsService.remove(id);
      set((state) => ({
        investments: state.investments.filter((i) => i.id !== id),
        isSubmitting: false,
      }));
    } catch (err) {
      set({
        error: toApiError(err, "investments.feedback.deleteError"),
        isSubmitting: false,
      });
      throw err;
    }
  },

  setSelectedInvestment: (investment) =>
    set({ selectedInvestment: investment }),

  clearError: () => set({ error: null }),
}));
