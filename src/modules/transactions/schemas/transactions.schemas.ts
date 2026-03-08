import { z } from "zod";

export const expenseIncomeFormSchema = z.object({
  amount: z
    .number({ error: "errors.amountPositive" })
    .positive({ message: "errors.amountPositive" }),
  purchaseDate: z.date({ error: "errors.dateRequired" }),
  categoryId: z
    .number({ error: "errors.categoryRequired" })
    .positive({ message: "errors.categoryRequired" }),
  accountId: z
    .number({ error: "errors.accountRequired" })
    .positive({ message: "errors.accountRequired" }),
  destination: z
    .string()
    .min(1, { message: "errors.destinationRequired" })
    .max(80, { message: "errors.destinationTooLong" }),
  description: z
    .string()
    .max(100, { message: "errors.descriptionTooLong" })
    .optional(),
  observations: z
    .string()
    .max(300, { message: "errors.observationsTooLong" })
    .optional(),
  justForRecord: z.boolean().default(false),
});

export const creditExpenseFormSchema = z.object({
  totalAmount: z
    .number({ error: "errors.amountPositive" })
    .positive({ message: "errors.amountPositive" }),
  totalInstallment: z
    .number({ error: "errors.installmentsMin" })
    .int()
    .min(1, { message: "errors.installmentsMin" }),
  installmentAmount: z
    .number({ error: "errors.amountPositive" })
    .positive({ message: "errors.amountPositive" }),
  purchaseDate: z.date({ error: "errors.dateRequired" }),
  categoryId: z
    .number({ error: "errors.categoryRequired" })
    .positive({ message: "errors.categoryRequired" }),
  creditCardId: z
    .number({ error: "errors.cardRequired" })
    .positive({ message: "errors.cardRequired" }),
  destination: z
    .string()
    .min(1, { message: "errors.destinationRequired" })
    .max(80, { message: "errors.destinationTooLong" }),
  description: z
    .string()
    .max(100, { message: "errors.descriptionTooLong" })
    .optional(),
});

export const transferenceFormSchema = z
  .object({
    amount: z
      .number({ error: "errors.amountPositive" })
      .positive({ message: "errors.amountPositive" }),
    purchaseDate: z.date({ error: "errors.dateRequired" }),
    accountOriginId: z
      .number({ error: "errors.accountRequired" })
      .positive({ message: "errors.accountRequired" }),
    accountDestinyId: z
      .number({ error: "errors.accountRequired" })
      .positive({ message: "errors.accountRequired" }),
    description: z
      .string()
      .max(100, { message: "errors.descriptionTooLong" })
      .optional(),
  })
  .refine((data) => data.accountOriginId !== data.accountDestinyId, {
    message: "errors.sameAccountTransference",
    path: ["accountDestinyId"],
  });

export const updateTransactionFormSchema = z.object({
  amount: z
    .number({ error: "errors.amountPositive" })
    .positive({ message: "errors.amountPositive" })
    .optional(),
  purchaseDate: z.date().optional(),
  destination: z
    .string()
    .max(80, { message: "errors.destinationTooLong" })
    .optional(),
  description: z
    .string()
    .max(100, { message: "errors.descriptionTooLong" })
    .optional(),
  observations: z
    .string()
    .max(300, { message: "errors.observationsTooLong" })
    .optional(),
  justForRecord: z.boolean().optional(),
  categoryId: z
    .number({ error: "errors.categoryRequired" })
    .positive({ message: "errors.categoryRequired" })
    .optional(),
});

export const updateCreditPurchaseFormSchema = z.object({
  totalAmount: z
    .number({ error: "errors.amountPositive" })
    .positive({ message: "errors.amountPositive" })
    .optional(),
  totalInstallment: z
    .number({ error: "errors.installmentsMin" })
    .int()
    .min(1, { message: "errors.installmentsMin" })
    .optional(),
  purchaseDate: z.date().optional(),
  destination: z
    .string()
    .max(80, { message: "errors.destinationTooLong" })
    .optional(),
  description: z
    .string()
    .max(100, { message: "errors.descriptionTooLong" })
    .optional(),
  categoryId: z
    .number({ error: "errors.categoryRequired" })
    .positive({ message: "errors.categoryRequired" })
    .optional(),
});

export type ExpenseIncomeFormData = z.infer<typeof expenseIncomeFormSchema>;
export type CreditExpenseFormData = z.infer<typeof creditExpenseFormSchema>;
export type TransferenceFormData = z.infer<typeof transferenceFormSchema>;
export type UpdateTransactionFormData = z.infer<
  typeof updateTransactionFormSchema
>;
export type UpdateCreditPurchaseFormData = z.infer<
  typeof updateCreditPurchaseFormSchema
>;
