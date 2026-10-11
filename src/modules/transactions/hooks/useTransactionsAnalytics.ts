"use client";

import { useEffect, useMemo } from "react";
import { useAuthStore } from "@/modules/auth/context/authContext";
import { useAnalyticsStore } from "../context/analyticsContext";
import { useTransactionsStore } from "../context/transactionsContext";
import { buildAnalytics } from "../utils/analytics.utils";

export function useTransactionsAnalytics() {
  const data = useAnalyticsStore(s => s.data);
  const filters = useAnalyticsStore(s => s.filters);
  const preferences = useAnalyticsStore(s => s.preferences);
  const isLoading = useAnalyticsStore(s => s.isLoading);
  const error = useAnalyticsStore(s => s.error);
  const fetchData = useAnalyticsStore(s => s.fetchData);
  const resetData = useAnalyticsStore(s => s.resetData);
  const userId = useAuthStore(s => s.user?.id);

  useEffect(() => { void useAnalyticsStore.persist.rehydrate(); }, []);
  useEffect(() => {
    resetData();
    if (userId) void fetchData();
    const unsubscribe = useTransactionsStore.subscribe((state, previous) => {
      if (userId && previous.isSubmitting && !state.isSubmitting && !state.error) void fetchData();
    });
    return () => { unsubscribe(); resetData(); };
  }, [userId, fetchData, resetData]);

  const result = useMemo(() => data ? buildAnalytics(data, filters, preferences) : null, [data, filters, preferences]);
  return { data, filters, preferences, isLoading, error, result, refetch: fetchData };
}
