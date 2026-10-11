import { create } from "zustand";
import { format, startOfMonth, subMonths } from "date-fns";
import { toApiError, type ApiError } from "@/shared/lib/api-client";
import { investmentsService } from "../services/investments.service";
import type { InvestmentAnalyticsFilters } from "../schemas/investmentAnalytics.schemas";
import type { InvestmentAnalyticsResponse } from "../types/investments.types";

export function defaultInvestmentAnalyticsFilters(date = new Date()): InvestmentAnalyticsFilters {
  return {
    startDate: format(startOfMonth(subMonths(date, 11)), "yyyy-MM-dd"),
    endDate: format(date, "yyyy-MM-dd"),
    investmentId: "all",
  };
}

interface InvestmentAnalyticsState {
  data: InvestmentAnalyticsResponse | null;
  filters: InvestmentAnalyticsFilters;
  isLoading: boolean;
  error: ApiError | null;
}

interface InvestmentAnalyticsActions {
  fetchData: () => Promise<void>;
  applyFilters: (filters: InvestmentAnalyticsFilters) => Promise<void>;
  reset: () => void;
}

const initialState: InvestmentAnalyticsState = {
  data: null,
  filters: defaultInvestmentAnalyticsFilters(),
  isLoading: false,
  error: null,
};

let activeRequest: AbortController | undefined;

export const useInvestmentAnalyticsStore = create<InvestmentAnalyticsState & InvestmentAnalyticsActions>((set, get) => ({
  ...initialState,
  fetchData: async () => {
    activeRequest?.abort();
    const controller = new AbortController();
    activeRequest = controller;
    const filters = get().filters;
    set({ isLoading: true, error: null });
    try {
      const data = await investmentsService.getAnalytics({
        startDate: filters.startDate,
        endDate: filters.endDate,
        investmentId: filters.investmentId === "all" ? undefined : Number(filters.investmentId),
      }, controller.signal);
      if (!controller.signal.aborted) set({ data, isLoading: false });
    } catch (error) {
      if (!controller.signal.aborted)
        set({ error: toApiError(error, "investments.analytics.errors.load"), isLoading: false });
    }
  },
  applyFilters: async filters => {
    set({ filters });
    await get().fetchData();
  },
  reset: () => {
    activeRequest?.abort();
    set(initialState);
  },
}));
