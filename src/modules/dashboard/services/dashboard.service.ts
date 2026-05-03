import { apiFetch } from "@/shared/lib/api-client";
import { format } from "date-fns";
import type { HomeDashboardResponse } from "../types";

async function getHomeDashboard(
  startDate: Date,
  endDate: Date,
): Promise<HomeDashboardResponse> {
  const params = new URLSearchParams({
    // Keep local datetime format aligned with transactions module
    // to avoid timezone shifts between dashboard and statement/invoice totals.
    startDate: format(startDate, "yyyy-MM-dd'T'HH:mm:ss"),
    endDate: format(endDate, "yyyy-MM-dd'T'HH:mm:ss"),
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
