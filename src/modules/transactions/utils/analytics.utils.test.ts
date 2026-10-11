import { describe, expect, it } from "vitest";
import { buildAnalytics, filterAnalyticsRecords } from "./analytics.utils";
import type { AnalyticsPreferences, AnalyticsResponse, AnalyticsTransaction } from "../types/analytics.types";
import type { AnalyticsFilters } from "../schemas/analytics.schemas";

const filters: AnalyticsFilters = {
  startDate: "2026-06-01", endDate: "2026-06-30", creditDateBasis: "invoice",
  accountId: "all", cardId: "all", category: "all", type: "all", search: "",
  includeRecordOnly: true, minAmount: undefined, maxAmount: undefined,
};

function record(overrides: Partial<AnalyticsTransaction>): AnalyticsTransaction {
  return {
    id: 1, type: "EXPENSE", amount: 0, date: "2026-06-01T00:00:00Z", transactionDate: "2026-06-01T00:00:00Z",
    description: "Entry", destination: null, justForRecord: false, accountId: 1, accountName: "Bank",
    cardId: null, cardName: null, categoryId: 1, categoryName: "Food", categoryColor: "#123456",
    parentCategoryId: null, parentCategoryName: null, parentCategoryColor: null, invoiceId: null, invoiceDate: null,
    ...overrides,
  };
}

const preferences: AnalyticsPreferences = {
  granularity: "day" as const, chartType: "area" as const, cumulative: false, compare: true,
  categoryLevel: "parent" as const, distributionMetric: "expense" as const, topCount: 6,
  widgets: ["evolution", "distribution", "comparison", "categories", "accounts"], hidden: [],
};

describe("buildAnalytics", () => {
  it("includes credit card installments once as expenses and keeps cent precision", () => {
    const data: AnalyticsResponse = {
      startDate: filters.startDate, endDate: filters.endDate, previousStartDate: "2026-05-02", previousEndDate: "2026-05-31",
      transactions: [
        record({ id: 1, type: "INCOME", amount: 1000, categoryId: 2, categoryName: "Salary" }),
        record({ id: 2, type: "EXPENSE", amount: 17.47, categoryId: 3, categoryName: "Games" }),
        record({ id: 3, type: "CREDITEXPENSE", amount: 73.74, cardId: 9, cardName: "Nubank", categoryId: 4, categoryName: "Leisure" }),
        record({ id: 4, type: "EXPENSE", amount: 0.1, parentCategoryId: 5, parentCategoryName: "Home", categoryId: 6, categoryName: "Utilities" }),
        record({ id: 5, type: "EXPENSE", amount: 0.2, parentCategoryId: 5, parentCategoryName: "Home", categoryId: 6, categoryName: "Utilities" }),
      ],
    };
    const result = buildAnalytics(data, filters, preferences);
    expect(result.totals).toMatchObject({ income: 1000, expense: 91.51, credit: 73.74, net: 908.49, count: 5 });
    expect(result.categories.find(category => category.name === "Home")?.expense).toBe(0.3);
    expect(result.accounts[0]?.expense).toBe(91.51);
  });

  it("filters nested category, account, record-only and text values", () => {
    const records = [
      record({ id: 1, parentCategoryId: 10, categoryId: 11, description: "Coffee", accountId: 1 }),
      record({ id: 2, parentCategoryId: 10, categoryId: 12, description: "Fuel", accountId: 2, justForRecord: true }),
    ];
    expect(filterAnalyticsRecords(records, { ...filters, category: "parent:10", accountId: "1", includeRecordOnly: false, search: "coffee" })).toHaveLength(1);
    expect(filterAnalyticsRecords(records, { ...filters, category: "category:12" })).toHaveLength(1);
  });
});
