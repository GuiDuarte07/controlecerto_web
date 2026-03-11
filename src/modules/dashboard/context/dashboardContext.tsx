"use client";

import { create } from "zustand";
import { dashboardService } from "../services";
import type { HomeDashboardResponse, DashboardFilters } from "../types";
import { ApiError, toApiError } from "@/shared/lib/api-client";
import { startOfMonth, endOfMonth } from "date-fns";

interface DashboardState {
  data: HomeDashboardResponse | null;
  filters: DashboardFilters;
  isLoading: boolean;
  error: ApiError | null;
}

interface DashboardActions {
  fetchDashboard: () => Promise<void>;
  setDateRange: (startDate: Date, endDate: Date) => void;
  clearError: () => void;
  reset: () => void;
}

type DashboardStore = DashboardState & DashboardActions;

const today = new Date();
const initialState: DashboardState = {
  data: null,
  filters: {
    startDate: startOfMonth(today),
    endDate: endOfMonth(today),
  },
  isLoading: false,
  error: null,
};

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  ...initialState,

  fetchDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const data = await dashboardService.getHomeDashboard(
        filters.startDate,
        filters.endDate
      );

      set({ data, isLoading: false });
    } catch (err) {
      const error = toApiError(err, "Failed to fetch dashboard data");
      set({ error, isLoading: false });
      throw error;
    }
  },

  setDateRange: (startDate: Date, endDate: Date) => {
    set((state) => ({
      filters: { ...state.filters, startDate, endDate },
    }));
  },

  clearError: () => set({ error: null }),

  reset: () => set(initialState),
}));
