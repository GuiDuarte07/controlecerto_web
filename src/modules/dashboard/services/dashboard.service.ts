import { apiFetch } from "@/shared/lib/api-client";
import type { HomeDashboardResponse } from "../types";

async function getHomeDashboard(
  startDate: Date,
  endDate: Date,
): Promise<HomeDashboardResponse> {
  const params = new URLSearchParams({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });

  return apiFetch<HomeDashboardResponse>(
    `/api/dashboard?${params.toString()}`,
    {
      method: "GET",
    },
  );
}

export const dashboardService = {
  getHomeDashboard,
};
