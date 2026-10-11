import { create } from "zustand";
import { persist } from "zustand/middleware";
import { format, startOfMonth } from "date-fns";
import { toApiError, type ApiError } from "@/shared/lib/api-client";
import { analyticsService } from "../services/analytics.service";
import type { AnalyticsFilters } from "../schemas/analytics.schemas";
import { ANALYTICS_WIDGETS, type AnalyticsPreferences, type AnalyticsResponse, type AnalyticsWidget } from "../types/analytics.types";

export function defaultAnalyticsFilters(date = new Date()): AnalyticsFilters {
  return {
    startDate: format(startOfMonth(date), "yyyy-MM-dd"), endDate: format(date, "yyyy-MM-dd"),
    creditDateBasis: "invoice", accountId: "all", cardId: "all", category: "all", type: "all",
    search: "", includeRecordOnly: true, minAmount: undefined, maxAmount: undefined,
  };
}

export const defaultAnalyticsPreferences: AnalyticsPreferences = {
  granularity: "month", chartType: "area", cumulative: false, compare: true,
  categoryLevel: "parent", distributionMetric: "expense", topCount: 6,
  widgets: [...ANALYTICS_WIDGETS], hidden: [],
};

interface AnalyticsState {
  data: AnalyticsResponse | null;
  filters: AnalyticsFilters;
  preferences: AnalyticsPreferences;
  isLoading: boolean;
  error: ApiError | null;
}

interface AnalyticsActions {
  fetchData: () => Promise<void>;
  applyFilters: (filters: AnalyticsFilters) => Promise<void>;
  drillCategory: (category: string) => void;
  drillAccount: (accountId: string) => void;
  setPreferences: (preferences: Partial<AnalyticsPreferences>) => void;
  moveWidget: (widget: AnalyticsWidget, direction: -1 | 1) => void;
  toggleWidget: (widget: AnalyticsWidget) => void;
  resetPreferences: () => void;
  resetData: () => void;
}

const initialState: AnalyticsState = {
  data: null, filters: defaultAnalyticsFilters(), preferences: defaultAnalyticsPreferences,
  isLoading: false, error: null,
};
let activeRequest: AbortController | undefined;

export const useAnalyticsStore = create<AnalyticsState & AnalyticsActions>()(persist((set, get) => ({
  ...initialState,
  fetchData: async () => {
    activeRequest?.abort();
    const controller = new AbortController();
    activeRequest = controller;
    const { startDate, endDate, creditDateBasis } = get().filters;
    set({ isLoading: true, error: null, data: null });
    try {
      const data = await analyticsService.get({ startDate, endDate, creditDateBasis }, controller.signal);
      if (!controller.signal.aborted) set({ data, isLoading: false });
    } catch (error) {
      if (!controller.signal.aborted) set({ error: toApiError(error, "transactions.analytics.errors.load"), isLoading: false });
    }
  },
  applyFilters: async (filters) => {
    const previous = get().filters;
    set({ filters });
    if (!get().data || previous.startDate !== filters.startDate || previous.endDate !== filters.endDate || previous.creditDateBasis !== filters.creditDateBasis)
      await get().fetchData();
  },
  drillCategory: (category) => set(state => ({ filters: { ...state.filters, category } })),
  drillAccount: (accountId) => set(state => ({ filters: { ...state.filters, accountId } })),
  setPreferences: (preferences) => set(state => ({ preferences: { ...state.preferences, ...preferences } })),
  moveWidget: (widget, direction) => set(state => {
    const widgets = [...state.preferences.widgets];
    const index = widgets.indexOf(widget);
    const target = index + direction;
    if (target < 0 || target >= widgets.length) return state;
    [widgets[index], widgets[target]] = [widgets[target], widgets[index]];
    return { preferences: { ...state.preferences, widgets } };
  }),
  toggleWidget: (widget) => set(state => ({ preferences: { ...state.preferences,
    hidden: state.preferences.hidden.includes(widget) ? state.preferences.hidden.filter(w => w !== widget) : [...state.preferences.hidden, widget],
  } })),
  resetPreferences: () => set({ preferences: defaultAnalyticsPreferences }),
  resetData: () => { activeRequest?.abort(); set({ data: null, isLoading: false, error: null }); },
}), {
  name: "controlecerto-analytics-layout-v1",
  version: 2,
  migrate: (persistedState) => {
    const state = persistedState as Partial<AnalyticsState>;
    const persistedPreferences = state.preferences;
    const widgets = (persistedPreferences?.widgets as string[] | undefined)
      ?.filter((widget): widget is AnalyticsWidget => widget !== "transactions" && ANALYTICS_WIDGETS.includes(widget as AnalyticsWidget));
    const hidden = (persistedPreferences?.hidden as string[] | undefined)
      ?.filter((widget): widget is AnalyticsWidget => ANALYTICS_WIDGETS.includes(widget as AnalyticsWidget));
    return {
      ...state,
      preferences: { ...defaultAnalyticsPreferences, ...persistedPreferences, widgets: widgets?.length ? widgets : [...ANALYTICS_WIDGETS], hidden: hidden ?? [] },
    };
  },
  partialize: state => ({ preferences: state.preferences }),
  skipHydration: true,
}));
