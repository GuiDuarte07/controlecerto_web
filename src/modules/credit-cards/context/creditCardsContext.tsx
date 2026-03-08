import { create } from "zustand";
import { ApiError, toApiError } from "@/shared/lib/api-client";
import { creditCardsService } from "../services/creditCards.service";
import {
  createCreditCardRequestSchema,
  updateCreditCardRequestSchema,
  type CreditCardFormData,
  type UpdateCreditCardFormData,
} from "../schemas/creditCards.schemas";
import type { CreditCard } from "../types/creditCards.types";

type DialogMode = "create" | "edit";

interface CreditCardsState {
  creditCards: CreditCard[];
  filters: { search: string };
  selectedCard: CreditCard | null;
  dialogMode: DialogMode;
  isDialogOpen: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  error: ApiError | null;
}

interface CreditCardsActions {
  fetchCreditCards: () => Promise<void>;
  createCreditCard: (data: CreditCardFormData) => Promise<void>;
  updateCreditCard: (id: number, data: UpdateCreditCardFormData) => Promise<void>;
  openCreateDialog: () => void;
  openEditDialog: (card: CreditCard) => void;
  closeDialog: () => void;
  setSearch: (search: string) => void;
  clearFilters: () => void;
  clearError: () => void;
}

type CreditCardsStore = CreditCardsState & CreditCardsActions;

const initialState: CreditCardsState = {
  creditCards: [],
  filters: { search: "" },
  selectedCard: null,
  dialogMode: "create",
  isDialogOpen: false,
  isLoading: false,
  isSubmitting: false,
  error: null,
};

function parseCreatePayload(data: CreditCardFormData) {
  const parsed = createCreditCardRequestSchema.safeParse(data);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "creditCards.errors.saveFailed";
    throw new ApiError({ detail: msg });
  }
  return {
    totalLimit: parsed.data.totalLimit,
    description: parsed.data.description?.trim() || undefined,
    accountId: parsed.data.accountId,
    closeDay: parsed.data.closeDay,
    dueDay: parsed.data.dueDay,
    skipWeekend: parsed.data.skipWeekend,
  };
}

function parseUpdatePayload(id: number, data: UpdateCreditCardFormData) {
  const parsed = updateCreditCardRequestSchema.safeParse({ id, ...data });
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "creditCards.errors.saveFailed";
    throw new ApiError({ detail: msg });
  }
  return {
    totalLimit: parsed.data.totalLimit,
    description: parsed.data.description?.trim() || undefined,
  };
}

export const useCreditCardsStore = create<CreditCardsStore>((set, get) => ({
  ...initialState,

  fetchCreditCards: async () => {
    set({ isLoading: true, error: null });
    try {
      const creditCards = await creditCardsService.getAll();
      set({ creditCards, isLoading: false });
    } catch (err) {
      const error = toApiError(err, "creditCards.feedback.loadError");
      set({ error, isLoading: false });
    }
  },

  createCreditCard: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      const payload = parseCreatePayload(data);
      const newCard = await creditCardsService.create(payload);
      set((state) => ({
        creditCards: [...state.creditCards, newCard],
        isSubmitting: false,
        isDialogOpen: false,
      }));
    } catch (err) {
      const error = toApiError(err, "creditCards.feedback.createError");
      set({ error, isSubmitting: false });
      throw error;
    }
  },

  updateCreditCard: async (id, data) => {
    set({ isSubmitting: true, error: null });
    try {
      const payload = parseUpdatePayload(id, data);
      const updated = await creditCardsService.update(id, payload);
      set((state) => ({
        creditCards: state.creditCards.map((c) => (c.id === id ? updated : c)),
        isSubmitting: false,
        isDialogOpen: false,
      }));
    } catch (err) {
      const error = toApiError(err, "creditCards.feedback.updateError");
      set({ error, isSubmitting: false });
      throw error;
    }
  },

  openCreateDialog: () => {
    set({ dialogMode: "create", selectedCard: null, isDialogOpen: true, error: null });
  },

  openEditDialog: (card) => {
    set({ dialogMode: "edit", selectedCard: card, isDialogOpen: true, error: null });
  },

  closeDialog: () => {
    set({ isDialogOpen: false, selectedCard: null, dialogMode: "create" });
  },

  setSearch: (search) => {
    set((state) => ({ filters: { ...state.filters, search } }));
  },

  clearFilters: () => {
    set({ filters: initialState.filters });
  },

  clearError: () => set({ error: null }),
}));
