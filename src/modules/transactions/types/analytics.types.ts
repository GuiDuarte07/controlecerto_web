import type { AnalyticsFilters } from "../schemas/analytics.schemas";

export interface AnalyticsTransaction {
  id: number;
  type: "INCOME" | "EXPENSE" | "CREDITEXPENSE";
  amount: number;
  date: string;
  transactionDate: string;
  description: string;
  destination: string | null;
  justForRecord: boolean;
  accountId: number;
  accountName: string;
  cardId: number | null;
  cardName: string | null;
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  parentCategoryId: number | null;
  parentCategoryName: string | null;
  parentCategoryColor: string | null;
  invoiceId: number | null;
  invoiceDate: string | null;
}

export interface AnalyticsResponse {
  startDate: string;
  endDate: string;
  previousStartDate: string;
  previousEndDate: string;
  transactions: AnalyticsTransaction[];
}

export const ANALYTICS_WIDGETS = ["evolution", "distribution", "comparison", "categories", "accounts"] as const;
export type AnalyticsWidget = typeof ANALYTICS_WIDGETS[number];
export interface AnalyticsPreferences {
  granularity: "day" | "week" | "month";
  chartType: "area" | "line" | "bar";
  cumulative: boolean;
  compare: boolean;
  categoryLevel: "parent" | "subcategory";
  distributionMetric: "expense" | "income";
  topCount: number;
  widgets: AnalyticsWidget[];
  hidden: AnalyticsWidget[];
}

export interface AnalyticsTotals {
  income: number;
  expense: number;
  credit: number;
  net: number;
  count: number;
}

export interface AnalyticsGroup extends AnalyticsTotals {
  id: number;
  name: string;
  color: string;
  filter: string;
}

export interface AnalyticsCategory extends AnalyticsGroup {
  children: AnalyticsGroup[];
}

export interface AnalyticsPoint extends AnalyticsTotals {
  date: string;
}

export interface AnalyticsResult {
  records: AnalyticsTransaction[];
  totals: AnalyticsTotals;
  previous: AnalyticsTotals;
  categories: AnalyticsCategory[];
  distribution: AnalyticsGroup[];
  accounts: AnalyticsGroup[];
  timeline: AnalyticsPoint[];
  dailyExpense: number;
  savingsRate: number | null;
  dayCount: number;
}

export type AnalyticsQuery = Pick<AnalyticsFilters, "startDate" | "endDate" | "creditDateBasis">;
