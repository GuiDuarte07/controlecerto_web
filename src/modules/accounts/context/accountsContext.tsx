import { ApiError, toApiError } from "@/shared/lib/api-client";
import { create } from "zustand";
import { accountsService } from "../services/accounts.service";
import {
  createAccountRequestSchema,
  updateAccountRequestSchema,
  type AccountFormData,
  type CreateAccountRequestData,
  type UpdateAccountRequestData,
} from "../schemas/accounts.schemas";
import type { Account } from "../types/accounts.types";

type AccountDialogMode = "create" | "edit";

interface AccountsState {
  accounts: Account[];
  filters: {
    search: string;
  };
  selectedAccount: Account | null;
  dialogMode: AccountDialogMode;
  isDialogOpen: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  deletingIds: number[];
  error: ApiError | null;
}

interface AccountsActions {
  fetchAccounts: () => Promise<void>;
  createAccount: (data: AccountFormData) => Promise<void>;
  updateAccount: (id: number, data: AccountFormData) => Promise<void>;
  deleteAccount: (id: number) => Promise<void>;
  openCreateDialog: () => void;
  openEditDialog: (account: Account) => void;
  closeDialog: () => void;
  setSearch: (search: string) => void;
  clearFilters: () => void;
  clearError: () => void;
}

type AccountsStore = AccountsState & AccountsActions;

const initialState: AccountsState = {
  accounts: [],
  filters: {
    search: "",
  },
  selectedAccount: null,
  dialogMode: "create",
  isDialogOpen: false,
  isLoading: false,
  isSubmitting: false,
  deletingIds: [],
  error: null,
};

function getValidationErrorMessage(err: unknown, fallback: string) {
  if (err instanceof ApiError) return err;

  return new ApiError({
    detail: err instanceof Error ? err.message : fallback,
  });
}

function parseCreatePayload(data: AccountFormData): CreateAccountRequestData {
  const parsed = createAccountRequestSchema.safeParse(data);

  if (!parsed.success) {
    const firstIssue =
      parsed.error.issues[0]?.message ?? "accounts.errors.balanceInvalid";

    throw new ApiError({ detail: firstIssue });
  }

  return {
    ...parsed.data,
    bank: parsed.data.bank.trim(),
    description: parsed.data.description?.trim() || undefined,
    color: parsed.data.color.toUpperCase(),
  };
}

function parseUpdatePayload(
  id: number,
  data: AccountFormData,
): UpdateAccountRequestData {
  const parsed = updateAccountRequestSchema.safeParse({ id, ...data });

  if (!parsed.success) {
    const firstIssue =
      parsed.error.issues[0]?.message ?? "accounts.errors.updateFailed";

    throw new ApiError({ detail: firstIssue });
  }

  return {
    ...parsed.data,
    bank: parsed.data.bank.trim(),
    description: parsed.data.description?.trim() || undefined,
    color: parsed.data.color.toUpperCase(),
  };
}

export const useAccountsStore = create<AccountsStore>((set) => ({
  ...initialState,

  fetchAccounts: async () => {
    set({ isLoading: true, error: null });

    try {
      const accounts = await accountsService.getAll();

      set({
        accounts,
        isLoading: false,
      });
    } catch (err) {
      const error = toApiError(err, "accounts.feedback.loadError");
      set({ error, isLoading: false });
      throw error;
    }
  },

  createAccount: async (data) => {
    set({ isSubmitting: true, error: null });

    try {
      const payload = parseCreatePayload(data);
      const createdAccount = await accountsService.create(payload);

      set((state) => ({
        accounts: [createdAccount, ...state.accounts],
        isSubmitting: false,
        isDialogOpen: false,
        selectedAccount: null,
        dialogMode: "create",
      }));
    } catch (err) {
      const error = getValidationErrorMessage(
        err,
        "accounts.feedback.createError",
      );
      set({ error, isSubmitting: false });
      throw error;
    }
  },

  updateAccount: async (id, data) => {
    set({ isSubmitting: true, error: null });

    try {
      const payload = parseUpdatePayload(id, data);
      const updatedAccount = await accountsService.update(id, payload);

      set((state) => ({
        accounts: state.accounts.map((account) =>
          account.id === id ? updatedAccount : account,
        ),
        isSubmitting: false,
        isDialogOpen: false,
        selectedAccount: null,
        dialogMode: "create",
      }));
    } catch (err) {
      const error = getValidationErrorMessage(
        err,
        "accounts.feedback.updateError",
      );
      set({ error, isSubmitting: false });
      throw error;
    }
  },

  deleteAccount: async (id) => {
    set((state) => ({
      deletingIds: state.deletingIds.includes(id)
        ? state.deletingIds
        : [...state.deletingIds, id],
      error: null,
    }));

    try {
      await accountsService.remove(id);

      set((state) => ({
        accounts: state.accounts.filter((account) => account.id !== id),
      }));
    } catch (err) {
      const error = toApiError(err, "accounts.feedback.deleteError");
      set({ error });
      throw error;
    } finally {
      set((state) => ({
        deletingIds: state.deletingIds.filter((item) => item !== id),
      }));
    }
  },

  openCreateDialog: () => {
    set({
      dialogMode: "create",
      selectedAccount: null,
      isDialogOpen: true,
      error: null,
    });
  },

  openEditDialog: (account) => {
    set({
      dialogMode: "edit",
      selectedAccount: account,
      isDialogOpen: true,
      error: null,
    });
  },

  closeDialog: () => {
    set({
      isDialogOpen: false,
      selectedAccount: null,
      dialogMode: "create",
    });
  },

  setSearch: (search) => {
    set((state) => ({
      filters: {
        ...state.filters,
        search,
      },
    }));
  },

  clearFilters: () => {
    set((state) => ({
      filters: {
        ...state.filters,
        search: "",
      },
    }));
  },

  clearError: () => set({ error: null }),
}));
