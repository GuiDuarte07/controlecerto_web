"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/modules/auth/context/authContext";
import { useInvestmentAnalyticsStore } from "../context/investmentAnalyticsContext";

export function useInvestmentAnalytics() {
  const data = useInvestmentAnalyticsStore(state => state.data);
  const filters = useInvestmentAnalyticsStore(state => state.filters);
  const isLoading = useInvestmentAnalyticsStore(state => state.isLoading);
  const error = useInvestmentAnalyticsStore(state => state.error);
  const fetchData = useInvestmentAnalyticsStore(state => state.fetchData);
  const reset = useInvestmentAnalyticsStore(state => state.reset);
  const userId = useAuthStore(state => state.user?.id);

  useEffect(() => {
    if (userId) void fetchData();
    return reset;
  }, [fetchData, reset, userId]);

  return { data, filters, isLoading, error, refetch: fetchData };
}
