import { z } from "zod";

const limitSchema = z.coerce
  .number()
  .positive({ message: "errors.totalLimitPositive" });

const descriptionSchema = z
  .string()
  .trim()
  .max(100, { message: "errors.descriptionTooLong" })
  .optional();

const daySchema = (field: "closeDay" | "dueDay") =>
  z.coerce
    .number()
    .int()
    .min(1, { message: `errors.${field}Range` })
    .max(31, { message: `errors.${field}Range` });

export const creditCardFormSchema = z.object({
  totalLimit: limitSchema,
  description: descriptionSchema,
  accountId: z.number().int().positive({ message: "errors.accountRequired" }),
  closeDay: daySchema("closeDay"),
  dueDay: daySchema("dueDay"),
  skipWeekend: z.boolean(),
});

export const updateCreditCardFormSchema = z.object({
  totalLimit: limitSchema.optional(),
  description: descriptionSchema,
});

export const createCreditCardRequestSchema = creditCardFormSchema;

export const updateCreditCardRequestSchema = updateCreditCardFormSchema.extend({
  id: z.number().int().positive({ message: "errors.idInvalid" }),
});

export type CreditCardFormData = z.infer<typeof creditCardFormSchema>;
export type UpdateCreditCardFormData = z.infer<
  typeof updateCreditCardFormSchema
>;
export type CreateCreditCardRequestData = z.infer<
  typeof createCreditCardRequestSchema
>;
export type UpdateCreditCardRequestData = z.infer<
  typeof updateCreditCardRequestSchema
>;
