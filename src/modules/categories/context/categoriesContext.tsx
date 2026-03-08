import { create } from "zustand";
import { ApiError, toApiError } from "@/shared/lib/api-client";
import { categoriesService } from "../services/categories.service";
import { BillTypeEnum } from "../types/categories.types";
import type { Category, ParentCategory } from "../types/categories.types";
import {
  createCategoryRequestSchema,
  updateCategoryRequestSchema,
  type CategoryFormData,
} from "../schemas/categories.schemas";

type DialogMode = "create" | "edit";

interface CategoriesState {
  expenseCategories: ParentCategory[];
  incomeCategories: ParentCategory[];
  filters: { search: string };
  activeTab: "expense" | "income";
  isLoadingExpense: boolean;
  isLoadingIncome: boolean;
  isSubmitting: boolean;
  deletingIds: number[];
  isDialogOpen: boolean;
  dialogMode: DialogMode;
  selectedCategory: Category | ParentCategory | null;
  defaultBillType: BillTypeEnum;
  defaultParentId: number | undefined;
  error: ApiError | null;
}

interface CategoriesActions {
  fetchExpense: () => Promise<void>;
  fetchIncome: () => Promise<void>;
  createCategory: (data: CategoryFormData) => Promise<void>;
  updateCategory: (id: number, data: CategoryFormData) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  openCreateDialog: (billType: BillTypeEnum, parentId?: number) => void;
  openEditDialog: (category: Category | ParentCategory) => void;
  closeDialog: () => void;
  setSearch: (search: string) => void;
  setActiveTab: (tab: "expense" | "income") => void;
  clearError: () => void;
}

type CategoriesStore = CategoriesState & CategoriesActions;

const initialState: CategoriesState = {
  expenseCategories: [],
  incomeCategories: [],
  filters: { search: "" },
  activeTab: "expense",
  isLoadingExpense: false,
  isLoadingIncome: false,
  isSubmitting: false,
  deletingIds: [],
  isDialogOpen: false,
  dialogMode: "create",
  selectedCategory: null,
  defaultBillType: BillTypeEnum.EXPENSE,
  defaultParentId: undefined,
  error: null,
};

function toApiErrorHelper(err: unknown, fallback: string): ApiError {
  if (err instanceof ApiError) return err;
  return new ApiError({ detail: err instanceof Error ? err.message : fallback });
}

function parseCreatePayload(data: CategoryFormData) {
  const parsed = createCategoryRequestSchema.safeParse(data);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "categories.errors.saveFailed";
    throw new ApiError({ detail: msg });
  }
  return {
    name: parsed.data.name.trim(),
    icon: parsed.data.icon,
    billType: parsed.data.billType,
    color: parsed.data.color.toUpperCase(),
    parentId: parsed.data.parentId ?? null,
    limit: parsed.data.limit ?? null,
  };
}

function parseUpdatePayload(id: number, data: CategoryFormData) {
  const parsed = updateCategoryRequestSchema.safeParse({
    id,
    name: data.name,
    icon: data.icon,
    color: data.color,
    parentId: data.parentId,
  });
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "categories.errors.saveFailed";
    throw new ApiError({ detail: msg });
  }
  return {
    ...parsed.data,
    name: parsed.data.name?.trim(),
    color: parsed.data.color?.toUpperCase(),
  };
}

function updateCategoryInList(
  list: ParentCategory[],
  updated: Category,
): ParentCategory[] {
  return list.map((parent) => {
    if (parent.id === updated.id) {
      return { ...parent, ...updated, subCategories: parent.subCategories };
    }
    return {
      ...parent,
      subCategories: parent.subCategories.map((sub) =>
        sub.id === updated.id ? updated : sub,
      ),
    };
  });
}

function removeCategoryFromList(
  list: ParentCategory[],
  id: number,
): ParentCategory[] {
  return list
    .filter((parent) => parent.id !== id)
    .map((parent) => ({
      ...parent,
      subCategories: parent.subCategories.filter((sub) => sub.id !== id),
    }));
}

export const useCategoriesStore = create<CategoriesStore>((set, get) => ({
  ...initialState,

  fetchExpense: async () => {
    set({ isLoadingExpense: true, error: null });
    try {
      const data = await categoriesService.getByType(BillTypeEnum.EXPENSE);
      set({ expenseCategories: data, isLoadingExpense: false });
    } catch (err) {
      set({ error: toApiError(err, "categories.feedback.loadError"), isLoadingExpense: false });
    }
  },

  fetchIncome: async () => {
    set({ isLoadingIncome: true, error: null });
    try {
      const data = await categoriesService.getByType(BillTypeEnum.INCOME);
      set({ incomeCategories: data, isLoadingIncome: false });
    } catch (err) {
      set({ error: toApiError(err, "categories.feedback.loadError"), isLoadingIncome: false });
    }
  },

  createCategory: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      const payload = parseCreatePayload(data);
      const created = await categoriesService.create(payload);

      if (payload.billType === BillTypeEnum.EXPENSE) {
        if (payload.parentId) {
          set((state) => ({
            expenseCategories: state.expenseCategories.map((parent) =>
              parent.id === payload.parentId
                ? { ...parent, subCategories: [...parent.subCategories, created] }
                : parent,
            ),
          }));
        } else {
          set((state) => ({
            expenseCategories: [
              { ...created, amount: 0, subCategories: [] } as ParentCategory,
              ...state.expenseCategories,
            ],
          }));
        }
      } else {
        if (payload.parentId) {
          set((state) => ({
            incomeCategories: state.incomeCategories.map((parent) =>
              parent.id === payload.parentId
                ? { ...parent, subCategories: [...parent.subCategories, created] }
                : parent,
            ),
          }));
        } else {
          set((state) => ({
            incomeCategories: [
              { ...created, amount: 0, subCategories: [] } as ParentCategory,
              ...state.incomeCategories,
            ],
          }));
        }
      }

      set({ isSubmitting: false, isDialogOpen: false, selectedCategory: null });
    } catch (err) {
      set({
        error: toApiErrorHelper(err, "categories.feedback.createError"),
        isSubmitting: false,
      });
      throw err;
    }
  },

  updateCategory: async (id, data) => {
    set({ isSubmitting: true, error: null });
    try {
      const payload = parseUpdatePayload(id, data);
      const updated = await categoriesService.update(id, payload);

      const activeTab = get().activeTab;
      if (activeTab === "expense") {
        set((state) => ({
          expenseCategories: updateCategoryInList(state.expenseCategories, updated),
        }));
      } else {
        set((state) => ({
          incomeCategories: updateCategoryInList(state.incomeCategories, updated),
        }));
      }

      set({ isSubmitting: false, isDialogOpen: false, selectedCategory: null });
    } catch (err) {
      set({
        error: toApiErrorHelper(err, "categories.feedback.updateError"),
        isSubmitting: false,
      });
      throw err;
    }
  },

  deleteCategory: async (id) => {
    set((state) => ({
      deletingIds: state.deletingIds.includes(id)
        ? state.deletingIds
        : [...state.deletingIds, id],
      error: null,
    }));
    try {
      await categoriesService.remove(id);
      set((state) => ({
        expenseCategories: removeCategoryFromList(state.expenseCategories, id),
        incomeCategories: removeCategoryFromList(state.incomeCategories, id),
      }));
    } catch (err) {
      set({ error: toApiError(err, "categories.feedback.deleteError") });
      throw err;
    } finally {
      set((state) => ({
        deletingIds: state.deletingIds.filter((item) => item !== id),
      }));
    }
  },

  openCreateDialog: (billType, parentId) => {
    set({
      dialogMode: "create",
      selectedCategory: null,
      defaultBillType: billType,
      defaultParentId: parentId,
      isDialogOpen: true,
      error: null,
    });
  },

  openEditDialog: (category) => {
    set({
      dialogMode: "edit",
      selectedCategory: category,
      isDialogOpen: true,
      error: null,
    });
  },

  closeDialog: () => {
    set({ isDialogOpen: false, selectedCategory: null, dialogMode: "create", defaultParentId: undefined });
  },

  setSearch: (search) => {
    set((state) => ({ filters: { ...state.filters, search } }));
  },

  setActiveTab: (tab) => {
    set({ activeTab: tab });
  },

  clearError: () => set({ error: null }),
}));
