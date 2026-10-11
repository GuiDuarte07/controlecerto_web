import { differenceInCalendarDays, format, isValid, parseISO } from "date-fns";
import { z } from "zod";

const dateSchema = z.string().refine(
  value => /^\d{4}-\d{2}-\d{2}$/.test(value) && isValid(parseISO(value)),
  "investments.analytics.errors.date",
);

export const investmentAnalyticsFiltersSchema = z.object({
  startDate: dateSchema,
  endDate: dateSchema,
  investmentId: z.string(),
}).superRefine((data, context) => {
  if (data.endDate < data.startDate)
    context.addIssue({ code: "custom", path: ["endDate"], message: "investments.analytics.errors.order" });
  if (data.endDate > format(new Date(), "yyyy-MM-dd"))
    context.addIssue({ code: "custom", path: ["endDate"], message: "investments.analytics.errors.future" });
  if (differenceInCalendarDays(parseISO(data.endDate), parseISO(data.startDate)) > 3653)
    context.addIssue({ code: "custom", path: ["endDate"], message: "investments.analytics.errors.range" });
});

export type InvestmentAnalyticsFilters = z.infer<typeof investmentAnalyticsFiltersSchema>;
