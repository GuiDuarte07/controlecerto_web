import { z } from "zod";

const recurrenceRuleSchema = z
  .object({
    frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
    isEveryDay: z.boolean(),
    daysOfWeek: z.string().max(7, { message: "errors.daysOfWeekInvalid" }).optional(),
    dayOfWeek: z.number().int().min(0).max(6).nullable().optional(),
    dayOfMonth: z.number().int().min(-1).max(28).nullable().optional(),
    monthOfYear: z.number().int().min(1).max(12).nullable().optional(),
    dayOfMonthForYearly: z.number().int().min(1).max(31).nullable().optional(),
    interval: z.number().int().min(1, { message: "errors.intervalRequired" }),
  })
  .superRefine((value, context) => {
    if (value.frequency === "DAILY" && !value.isEveryDay && !value.daysOfWeek) {
      context.addIssue({ code: "custom", message: "errors.daysOfWeekRequired", path: ["daysOfWeek"] });
    }
    if (value.frequency === "WEEKLY" && value.dayOfWeek == null) {
      context.addIssue({ code: "custom", message: "errors.dayOfWeekRequired", path: ["dayOfWeek"] });
    }
    if (value.frequency === "MONTHLY" && value.dayOfMonth == null) {
      context.addIssue({ code: "custom", message: "errors.dayOfMonthRequired", path: ["dayOfMonth"] });
    }
    if (value.frequency === "YEARLY" && (value.monthOfYear == null || value.dayOfMonthForYearly == null)) {
      context.addIssue({ code: "custom", message: "errors.yearlyDateRequired", path: ["monthOfYear"] });
    }
  });

export const recurringTransactionFormSchema = z
  .object({
    description: z.string().trim().min(1, { message: "errors.descriptionRequired" }).max(200, { message: "errors.descriptionTooLong" }),
    amount: z.number({ error: "errors.amountPositive" }).positive({ message: "errors.amountPositive" }),
    destination: z.string().trim().max(80, { message: "errors.destinationTooLong" }),
    justForRecord: z.boolean(),
    type: z.enum(["EXPENSE", "INCOME"]),
    startDate: z.date({ error: "errors.startDateRequired" }),
    endDate: z.date().nullable(),
    accountId: z.number({ error: "errors.accountRequired" }).positive({ message: "errors.accountRequired" }),
    categoryId: z.number({ error: "errors.categoryRequired" }).positive({ message: "errors.categoryRequired" }),
    isActive: z.boolean(),
    recurrenceRule: recurrenceRuleSchema,
  })
  .superRefine((value, context) => {
    if (value.endDate && value.endDate <= value.startDate) {
      context.addIssue({ code: "custom", message: "errors.endDateAfterStart", path: ["endDate"] });
    }
  });

export type RecurringTransactionFormData = z.infer<typeof recurringTransactionFormSchema>;
