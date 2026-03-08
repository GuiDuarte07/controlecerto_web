import { z } from "zod";

const HEX_COLOR_REGEX = /^#[0-9A-F]{6}$/;

const balanceSchema = z.coerce
  .number()
  .refine((value) => Number.isFinite(value), {
    message: "accounts.errors.balanceInvalid",
  })
  .min(0, { message: "accounts.errors.balanceNonNegative" });

const bankSchema = z
  .string()
  .trim()
  .min(1, { message: "accounts.errors.bankRequired" })
  .max(100, { message: "accounts.errors.bankTooLong" });

const descriptionSchema = z
  .string()
  .trim()
  .max(100, { message: "accounts.errors.descriptionTooLong" })
  .optional();

const colorSchema = z.string().trim().regex(HEX_COLOR_REGEX, {
  message: "accounts.errors.colorInvalid",
});

export const accountFormSchema = z.object({
  balance: balanceSchema,
  bank: bankSchema,
  description: descriptionSchema,
  color: colorSchema,
});

export const createAccountRequestSchema = accountFormSchema;

export const updateAccountRequestSchema = accountFormSchema.extend({
  id: z.number().int().positive({ message: "accounts.errors.idInvalid" }),
});

export const accountFiltersSchema = z.object({
  search: z.string().trim().max(100).optional().default(""),
});

export type AccountFormData = z.infer<typeof accountFormSchema>;
export type CreateAccountRequestData = z.infer<
  typeof createAccountRequestSchema
>;
export type UpdateAccountRequestData = z.infer<
  typeof updateAccountRequestSchema
>;
export type AccountFiltersFormData = z.infer<typeof accountFiltersSchema>;
