import { create } from "zustand";
import { ApiError, toApiError } from "@/shared/lib/api-client";
import type { TransactionType } from "../types/transactions.types";

const NUMERIC_TYPE_MAP: Record<number, TransactionType> = {
  0: "EXPENSE",
  1: "INCOME",
  2: "CREDITEXPENSE",
  3: "TRANSFERENCE",
  4: "INVOICEPAYMENT",
};

function normalizeTransaction(t: Transaction): Transaction {
  const rawType = t.type as unknown as number | string;
  const type: TransactionType =
    typeof rawType === "number"
      ? (NUMERIC_TYPE_MAP[rawType] ?? "EXPENSE")
      : (rawType as TransactionType);
  return { ...t, type };
}
import { transactionsService } from "../services/transactions.service";
import {
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
} from "date-fns";
import type {
  Invoice,
  InvoiceListResponse,
  StatementPagination,
  StatementResponse,
  StatementSummary,
  Transaction,
  TransactionFilters,
  TransactionMode,
  CreateTransactionRequest,
  CreateCreditPurchaseRequest,
  CreateTransferenceRequest,
  UpdateTransactionRequest,
  UpdateCreditPurchaseRequest,
} from "../types/transactions.types";

interface TransactionsState {
  mode: TransactionMode;
  invoiceMonthDate: Date;
  invoices: Invoice[];
  invoiceTransactions: Transaction[];
  statementTransactions: Transaction[];
  statementPagination: StatementPagination | null;
  statementSummary: StatementSummary | null;
  statementFilters: TransactionFilters;
  statementPage: number;
  statementPageSize: number;
  statementSearch: string;
  isLoading: boolean;
  isSubmitting: boolean;
  error: ApiError | null;
  isCreateDrawerOpen: boolean;
  isDetailSheetOpen: boolean;
  selectedTransaction: Transaction | null;
}

interface TransactionsActions {
  setMode: (mode: TransactionMode) => void;
  fetchInvoiceData: () => Promise<void>;
  fetchStatementData: () => Promise<void>;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
  setInvoiceMonth: (year: number, month: number) => void;
  setStatementFilters: (filters: TransactionFilters) => void;
  setStatementSearch: (search: string) => void;
  setStatementPage: (page: number) => void;
  setStatementPageSize: (pageSize: number) => void;
  createExpenseIncome: (data: CreateTransactionRequest) => Promise<void>;
  createCreditExpense: (data: CreateCreditPurchaseRequest) => Promise<void>;
  createTransference: (data: CreateTransferenceRequest) => Promise<void>;
  updateTransaction: (id: number, data: UpdateTransactionRequest) => Promise<void>;
  updateCreditPurchase: (id: number, data: UpdateCreditPurchaseRequest) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;
  openCreateDrawer: () => void;
  closeCreateDrawer: () => void;
  openDetailSheet: (transaction: Transaction) => void;
  closeDetailSheet: () => void;
  clearError: () => void;
}

type TransactionsStore = TransactionsState & TransactionsActions;

const initialState: TransactionsState = {
  mode: "invoice",
  invoiceMonthDate: new Date(),
  invoices: [],
  invoiceTransactions: [],
  statementTransactions: [],
  statementPagination: null,
  statementSummary: null,
  statementFilters: {},
  statementPage: 1,
  statementPageSize: 20,
  statementSearch: "",
  isLoading: false,
  isSubmitting: false,
  error: null,
  isCreateDrawerOpen: false,
  isDetailSheetOpen: false,
  selectedTransaction: null,
};

export const useTransactionsStore = create<TransactionsStore>((set, get) => ({
  ...initialState,

  setMode: (mode) => {
    set({ mode });
    if (mode === "invoice") {
      void get().fetchInvoiceData();
    } else {
      void get().fetchStatementData();
    }
  },

  fetchInvoiceData: async () => {
    set({ isLoading: true, error: null, invoices: [], invoiceTransactions: [] });
    try {
      const { invoiceMonthDate } = get();
      const startDate = format(startOfMonth(invoiceMonthDate), "yyyy-MM-dd'T'HH:mm:ss");
      const endDate = format(endOfMonth(invoiceMonthDate), "yyyy-MM-dd'T'HH:mm:ss");

      const response = await transactionsService.getTransactions({
        mode: "invoice",
        startDate,
        endDate,
      });

      const data = response as InvoiceListResponse;
      set({
        invoices: (data.invoices ?? []).map((inv) => ({
          ...inv,
          transactions: inv.transactions?.map(normalizeTransaction),
        })),
        invoiceTransactions: (data.transactions ?? []).map(normalizeTransaction),
        isLoading: false,
      });
    } catch (err) {
      const error = toApiError(err, "transactions.feedback.loadError");
      set({ error, isLoading: false });
      throw error;
    }
  },

  fetchStatementData: async () => {
    set({ isLoading: true, error: null });
    try {
      const { statementFilters, statementPage, statementPageSize, statementSearch } = get();

      const now = new Date();
      const startDate = format(
        statementFilters.dateStart ?? startOfMonth(now),
        "yyyy-MM-dd'T'HH:mm:ss",
      );
      const endDate = format(
        statementFilters.dateEnd ?? endOfMonth(now),
        "yyyy-MM-dd'T'HH:mm:ss",
      );

      const response = await transactionsService.getTransactions({
        mode: "statement",
        startDate,
        endDate,
        accountId: statementFilters.accountId,
        cardId: statementFilters.cardId,
        categoryId: statementFilters.categoryId,
        searchText: statementSearch || statementFilters.searchText,
        sort: statementFilters.sort,
        pageNumber: statementPage,
        pageSize: statementPageSize,
      });

      const data = response as StatementResponse;
      set({
        statementTransactions: (data.transactions?.data ?? []).map(normalizeTransaction),
        statementPagination: data.transactions?.pagination ?? null,
        statementSummary: data.summary ?? null,
        isLoading: false,
      });
    } catch (err) {
      const error = toApiError(err, "transactions.feedback.loadError");
      set({ error, isLoading: false });
      throw error;
    }
  },

  goToPrevMonth: () => {
    const { invoiceMonthDate } = get();
    set({ invoiceMonthDate: subMonths(invoiceMonthDate, 1) });
    void get().fetchInvoiceData();
  },

  goToNextMonth: () => {
    const { invoiceMonthDate } = get();
    set({ invoiceMonthDate: addMonths(invoiceMonthDate, 1) });
    void get().fetchInvoiceData();
  },

  setInvoiceMonth: (year, month) => {
    set({ invoiceMonthDate: new Date(year, month - 1, 1) });
    void get().fetchInvoiceData();
  },

  setStatementFilters: (filters) => {
    set({ statementFilters: filters, statementPage: 1 });
  },

  setStatementSearch: (search) => {
    set({ statementSearch: search, statementPage: 1 });
  },

  setStatementPage: (page) => {
    set({ statementPage: page });
    void get().fetchStatementData();
  },

  setStatementPageSize: (pageSize) => {
    set({ statementPageSize: pageSize, statementPage: 1 });
    void get().fetchStatementData();
  },

  createExpenseIncome: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      await transactionsService.create(data);
      set({ isSubmitting: false, isCreateDrawerOpen: false });
      const { mode } = get();
      if (mode === "invoice") {
        void get().fetchInvoiceData();
      } else {
        void get().fetchStatementData();
      }
    } catch (err) {
      const error = toApiError(err, "transactions.feedback.createError");
      set({ error, isSubmitting: false });
      throw error;
    }
  },

  createCreditExpense: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      await transactionsService.createCreditPurchase(data);
      set({ isSubmitting: false, isCreateDrawerOpen: false });
      const { mode } = get();
      if (mode === "invoice") {
        void get().fetchInvoiceData();
      } else {
        void get().fetchStatementData();
      }
    } catch (err) {
      const error = toApiError(err, "transactions.feedback.createError");
      set({ error, isSubmitting: false });
      throw error;
    }
  },

  createTransference: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      await transactionsService.createTransference(data);
      set({ isSubmitting: false, isCreateDrawerOpen: false });
      const { mode } = get();
      if (mode === "invoice") {
        void get().fetchInvoiceData();
      } else {
        void get().fetchStatementData();
      }
    } catch (err) {
      const error = toApiError(err, "transactions.feedback.createError");
      set({ error, isSubmitting: false });
      throw error;
    }
  },

  updateTransaction: async (id, data) => {
    set({ isSubmitting: true, error: null });
    try {
      await transactionsService.update(id, data);
      set({ isSubmitting: false, isDetailSheetOpen: false, selectedTransaction: null });
      const { mode } = get();
      if (mode === "invoice") {
        void get().fetchInvoiceData();
      } else {
        void get().fetchStatementData();
      }
    } catch (err) {
      const error = toApiError(err, "transactions.feedback.updateError");
      set({ error, isSubmitting: false });
      throw error;
    }
  },

  updateCreditPurchase: async (id, data) => {
    set({ isSubmitting: true, error: null });
    try {
      await transactionsService.updateCreditPurchase(id, data);
      set({ isSubmitting: false, isDetailSheetOpen: false, selectedTransaction: null });
      const { mode } = get();
      if (mode === "invoice") {
        void get().fetchInvoiceData();
      } else {
        void get().fetchStatementData();
      }
    } catch (err) {
      const error = toApiError(err, "transactions.feedback.updateError");
      set({ error, isSubmitting: false });
      throw error;
    }
  },

  deleteTransaction: async (id) => {
    set({ isSubmitting: true, error: null });
    try {
      await transactionsService.remove(id);
      set({ isSubmitting: false, isDetailSheetOpen: false, selectedTransaction: null });
      const { mode } = get();
      if (mode === "invoice") {
        void get().fetchInvoiceData();
      } else {
        void get().fetchStatementData();
      }
    } catch (err) {
      const error = toApiError(err, "transactions.feedback.deleteError");
      set({ error, isSubmitting: false });
      throw error;
    }
  },

  openCreateDrawer: () => set({ isCreateDrawerOpen: true, error: null }),
  closeCreateDrawer: () => set({ isCreateDrawerOpen: false }),
  openDetailSheet: (transaction) =>
    set({ isDetailSheetOpen: true, selectedTransaction: transaction, error: null }),
  closeDetailSheet: () => set({ isDetailSheetOpen: false, selectedTransaction: null }),
  clearError: () => set({ error: null }),
}));
