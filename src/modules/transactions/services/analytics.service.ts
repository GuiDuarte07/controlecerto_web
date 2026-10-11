import { apiFetch } from "@/shared/lib/api-client";
import type { AnalyticsQuery, AnalyticsResponse } from "../types/analytics.types";

async function get(query: AnalyticsQuery, signal?: AbortSignal): Promise<AnalyticsResponse> {
  const params = new URLSearchParams(query);
  return apiFetch<AnalyticsResponse>(`/api/transactions/analytics?${params}`, { signal });
}

export const analyticsService = { get };
