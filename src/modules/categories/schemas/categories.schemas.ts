import { z } from "zod";
import { BillTypeEnum } from "../types/categories.types";

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "categories.errors.nameRequired" })
    .max(60, { message: "categories.errors.nameTooLong" }),
  icon: z.string().min(1, { message: "categories.errors.iconRequired" }),
  billType: z.nativeEnum(BillTypeEnum, {
    message: "categories.errors.billTypeRequired",
  }),
  color: z.string().trim().regex(HEX_COLOR_REGEX, {
    message: "categories.errors.colorInvalid",
  }),
  parentId: z.number().int().positive().nullable().optional(),
  limit: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined ? null : Number(val),
    z
      .number()
      .positive({ message: "categories.errors.limitPositive" })
      .nullable(),
  ),
});

export const createCategoryRequestSchema = categoryFormSchema;

export const updateCategoryRequestSchema = z.object({
  id: z.number().int().positive({ message: "categories.errors.idInvalid" }),
  name: z
    .string()
    .trim()
    .max(60, { message: "categories.errors.nameTooLong" })
    .optional(),
  icon: z.string().optional(),
  color: z
    .string()
    .trim()
    .regex(HEX_COLOR_REGEX, { message: "categories.errors.colorInvalid" })
    .optional(),
  parentId: z.number().int().positive().nullable().optional(),
});

export const updateCategoryLimitSchema = z.object({
  categoryId: z
    .number()
    .int()
    .positive({ message: "categories.errors.idInvalid" }),
  amount: z.coerce
    .number()
    .positive({ message: "categories.errors.limitPositive" }),
});

export type CategoryFormData = z.infer<typeof categoryFormSchema>;
export type CreateCategoryRequestData = z.infer<
  typeof createCategoryRequestSchema
>;
export type UpdateCategoryRequestData = z.infer<
  typeof updateCategoryRequestSchema
>;
export type UpdateCategoryLimitData = z.infer<typeof updateCategoryLimitSchema>;
