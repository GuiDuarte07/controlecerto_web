import { addDays, addMonths, addWeeks, differenceInCalendarDays, format, parseISO, startOfMonth, startOfWeek } from "date-fns";
import type { AnalyticsFilters } from "../schemas/analytics.schemas";
import type { AnalyticsCategory, AnalyticsGroup, AnalyticsPoint, AnalyticsPreferences, AnalyticsResponse, AnalyticsResult, AnalyticsTotals, AnalyticsTransaction } from "../types/analytics.types";

const emptyTotals = (): AnalyticsTotals => ({ income: 0, expense: 0, credit: 0, net: 0, count: 0 });
const cents = (amount: number) => Math.round(amount * 100);
const money = (amount: number) => amount / 100;

function add(totals: AnalyticsTotals, record: AnalyticsTransaction) {
  const value = cents(record.amount);
  if (record.type === "INCOME") totals.income += value;
  else totals.expense += value;
  if (record.type === "CREDITEXPENSE") totals.credit += value;
  totals.net = totals.income - totals.expense;
  totals.count++;
}

function amounts<T extends AnalyticsTotals>(totals: T): T {
  return { ...totals, income: money(totals.income), expense: money(totals.expense), credit: money(totals.credit), net: money(totals.net) };
}

export function filterAnalyticsRecords(records: AnalyticsTransaction[], filters: AnalyticsFilters) {
  const term = filters.search.trim().toLocaleLowerCase();
  const [categoryKind, categoryId] = filters.category.split(":");
  return records.filter((r) => {
    if (!filters.includeRecordOnly && r.justForRecord) return false;
    if (filters.accountId !== "all" && r.accountId !== Number(filters.accountId)) return false;
    if (filters.cardId !== "all" && r.cardId !== Number(filters.cardId)) return false;
    if (filters.category !== "all" && (categoryKind === "parent" ? (r.parentCategoryId ?? r.categoryId) : r.categoryId) !== Number(categoryId)) return false;
    if (filters.type === "income" && r.type !== "INCOME") return false;
    if (filters.type === "expense" && r.type === "INCOME") return false;
    if (filters.type === "credit" && r.type !== "CREDITEXPENSE") return false;
    if (filters.type === "cash" && r.type !== "EXPENSE") return false;
    if (filters.minAmount !== undefined && cents(r.amount) < cents(filters.minAmount)) return false;
    if (filters.maxAmount !== undefined && cents(r.amount) > cents(filters.maxAmount)) return false;
    return !term || [r.description, r.destination, r.categoryName, r.parentCategoryName, r.accountName, r.cardName].some(v => v?.toLocaleLowerCase().includes(term));
  });
}

export function buildAnalytics(data: AnalyticsResponse, filters: AnalyticsFilters, preferences: AnalyticsPreferences): AnalyticsResult {
  const filtered = filterAnalyticsRecords(data.transactions, filters);
  const records = filtered.filter(r => r.date.slice(0, 10) >= filters.startDate && r.date.slice(0, 10) <= filters.endDate);
  const previousRecords = filtered.filter(r => r.date.slice(0, 10) >= data.previousStartDate.slice(0, 10) && r.date.slice(0, 10) <= data.previousEndDate.slice(0, 10));
  const totals = emptyTotals();
  const previous = emptyTotals();
  previousRecords.forEach(r => add(previous, r));
  const parents = new Map<number, AnalyticsCategory>();
  const leaves = new Map<number, AnalyticsGroup>();
  const accounts = new Map<number, AnalyticsGroup>();
  const points = new Map<string, AnalyticsPoint>();
  const start = parseISO(filters.startDate);
  const end = parseISO(filters.endDate);
  const bucketDate = (date: Date) => preferences.granularity === "month" ? startOfMonth(date) : preferences.granularity === "week" ? startOfWeek(date, { weekStartsOn: 1 }) : date;
  const advance = (date: Date) => preferences.granularity === "month" ? addMonths(date, 1) : preferences.granularity === "week" ? addWeeks(date, 1) : addDays(date, 1);
  for (let date = bucketDate(start); date <= end; date = advance(date)) {
    const key = format(date, "yyyy-MM-dd");
    points.set(key, { date: key, ...emptyTotals() });
  }
  for (const r of records) {
    add(totals, r);
    const parentId = r.parentCategoryId ?? r.categoryId;
    if (!parents.has(parentId)) parents.set(parentId, {
      id: parentId, name: r.parentCategoryName ?? r.categoryName, color: r.parentCategoryColor ?? r.categoryColor,
      filter: `parent:${parentId}`, children: [], ...emptyTotals(),
    });
    if (!leaves.has(r.categoryId)) leaves.set(r.categoryId, {
      id: r.categoryId, name: r.categoryName, color: r.categoryColor, filter: `category:${r.categoryId}`, ...emptyTotals(),
    });
    if (!accounts.has(r.accountId)) accounts.set(r.accountId, {
      id: r.accountId, name: r.accountName, color: "", filter: String(r.accountId), ...emptyTotals(),
    });
    add(parents.get(parentId)!, r);
    add(leaves.get(r.categoryId)!, r);
    add(accounts.get(r.accountId)!, r);
    const point = points.get(format(bucketDate(parseISO(r.date.slice(0, 10))), "yyyy-MM-dd"));
    if (point) add(point, r);
  }
  const categories = [...parents.values()].map(parent => ({ ...amounts(parent), children: [...leaves.values()]
    .filter(leaf => records.some(r => r.categoryId === leaf.id && (r.parentCategoryId ?? r.categoryId) === parent.id))
    .map(amounts).sort((a, b) => b.expense - a.expense || b.income - a.income) }))
    .sort((a, b) => b.expense - a.expense || b.income - a.income);
  const distribution = (preferences.categoryLevel === "parent" ? [...parents.values()] : [...leaves.values()])
    .map(amounts).filter(g => g[preferences.distributionMetric] > 0)
    .sort((a, b) => b[preferences.distributionMetric] - a[preferences.distributionMetric]);
  const accumulated = emptyTotals();
  const timeline = [...points.values()].map(point => {
    accumulated.income += point.income;
    accumulated.expense += point.expense;
    accumulated.credit += point.credit;
    accumulated.net = accumulated.income - accumulated.expense;
    accumulated.count += point.count;
    return amounts(preferences.cumulative ? { date: point.date, ...accumulated } : point);
  });
  const dayCount = differenceInCalendarDays(end, start) + 1;
  return {
    records, totals: amounts(totals), previous: amounts(previous), categories, distribution,
    accounts: [...accounts.values()].map(amounts).sort((a, b) => b.expense - a.expense), timeline,
    dailyExpense: money(totals.expense) / dayCount,
    savingsRate: totals.income > 0 ? (totals.net / totals.income) * 100 : null, dayCount,
  };
}

export function analyticsCsv(headers: string[], rows: (string | number)[][]): string {
  const cell = (value: string | number) => {
    const text = String(value);
    const safe = typeof value === "string" && /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;
    return `"${safe.replaceAll('"', '""')}"`;
  };
  return "\uFEFF" + [headers, ...rows].map(row => row.map(cell).join(";")).join("\r\n");
}
