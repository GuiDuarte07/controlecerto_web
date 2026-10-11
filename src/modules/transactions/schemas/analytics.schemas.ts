import { z } from "zod";
import { differenceInCalendarDays, format, isValid, parseISO } from "date-fns";

const dateSchema = z.string().refine((value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && isValid(parseISO(value)), "transactions.analytics.errors.date");

export const analyticsFiltersSchema = z.object({
  startDate: dateSchema,
  endDate: dateSchema,
  creditDateBasis: z.enum(["invoice", "transaction"]),
  accountId: z.string(),
  cardId: z.string(),
  category: z.string(),
  type: z.enum(["all", "income", "expense", "credit", "cash"]),
  search: z.string().max(200, "transactions.analytics.errors.search"),
  minAmount: z.number().min(0, "transactions.analytics.errors.amount").optional(),
  maxAmount: z.number().min(0, "transactions.analytics.errors.amount").optional(),
  includeRecordOnly: z.boolean(),
}).superRefine((data, ctx) => {
  if (data.startDate < "1900-01-01" || data.endDate >= "9999-01-01")
    ctx.addIssue({ code: "custom", path: ["startDate"], message: "transactions.analytics.errors.date" });
  if (data.endDate < data.startDate)
    ctx.addIssue({ code: "custom", path: ["endDate"], message: "transactions.analytics.errors.order" });
  if (data.endDate > format(new Date(), "yyyy-MM-dd"))
    ctx.addIssue({ code: "custom", path: ["endDate"], message: "transactions.analytics.errors.order" });
  if (differenceInCalendarDays(parseISO(data.endDate), parseISO(data.startDate)) > 1826)
    ctx.addIssue({ code: "custom", path: ["endDate"], message: "transactions.analytics.errors.range" });
  if (data.minAmount !== undefined && data.maxAmount !== undefined && data.maxAmount < data.minAmount)
    ctx.addIssue({ code: "custom", path: ["maxAmount"], message: "transactions.analytics.errors.amountOrder" });
});

export type AnalyticsFilters = z.infer<typeof analyticsFiltersSchema>;
