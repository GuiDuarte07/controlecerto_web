import { z } from "zod";

export const createInvestmentSchema = z.object({
  name: z
    .string()
    .min(1, { message: "investments.errors.nameRequired" })
    .max(100, { message: "investments.errors.nameTooLong" }),
  initialAmount: z
    .number({ error: "investments.errors.amountInvalid" })
    .positive({ message: "investments.errors.amountPositive" })
    .optional(),
  startDate: z.date({ error: "investments.errors.startDateRequired" }),
  description: z
    .string()
    .max(500, { message: "investments.errors.descriptionTooLong" })
    .optional(),
});

export const editInvestmentSchema = z.object({
  name: z
    .string()
    .min(1, { message: "investments.errors.nameRequired" })
    .max(100, { message: "investments.errors.nameTooLong" }),
  startDate: z.date({ error: "investments.errors.startDateRequired" }),
  description: z
    .string()
    .max(500, { message: "investments.errors.descriptionTooLong" })
    .optional(),
});

export const depositWithdrawSchema = z.object({
  amount: z
    .number({ error: "investments.errors.amountInvalid" })
    .positive({ message: "investments.errors.amountPositive" }),
  accountId: z.number().optional(),
  occurredAt: z.date().optional(),
  note: z.string().max(500, { message: "investments.errors.noteTooLong" }).optional(),
});

export const adjustSchema = z.object({
  newTotalValue: z
    .number({ error: "investments.errors.amountInvalid" })
    .min(0, { message: "investments.errors.amountNonNegative" }),
  occurredAt: z.date().optional(),
  note: z.string().max(500, { message: "investments.errors.noteTooLong" }).optional(),
});

export type CreateInvestmentFormData = z.infer<typeof createInvestmentSchema>;
export type EditInvestmentFormData = z.infer<typeof editInvestmentSchema>;
export type DepositWithdrawFormData = z.infer<typeof depositWithdrawSchema>;
export type AdjustFormData = z.infer<typeof adjustSchema>;
