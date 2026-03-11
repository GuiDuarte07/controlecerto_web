"use client";

import { useEffect } from "react";
import { useDashboardStore } from "../context";

export function useDashboardData(autoFetch = true) {
  const data = useDashboardStore((state) => state.data);
  const isLoading = useDashboardStore((state) => state.isLoading);
  const error = useDashboardStore((state) => state.error);
  const fetchDashboard = useDashboardStore((state) => state.fetchDashboard);

  useEffect(() => {
    if (autoFetch) {
      fetchDashboard();
    }
  }, [autoFetch, fetchDashboard]);

  return { data, isLoading, error, refetch: fetchDashboard };
}

export function useDashboardFilters() {
  const filters = useDashboardStore((state) => state.filters);
  const setDateRange = useDashboardStore((state) => state.setDateRange);
  const fetchDashboard = useDashboardStore((state) => state.fetchDashboard);

  const applyFilters = () => {
    fetchDashboard();
  };

  return {
    filters,
    setDateRange,
    applyFilters,
  };
}
