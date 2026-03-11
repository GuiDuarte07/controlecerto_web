import { z } from "zod";

export const createNoteContextSchema = z
  .object({
    contextType: z.enum(["general", "period"]),
    year: z.number().int().min(1900).max(3000).nullable().optional(),
    month: z.number().int().min(1).max(12).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.contextType === "period") {
      if (!data.year) {
        ctx.addIssue({
          code: "custom",
          path: ["year"],
          message: "notes.errors.yearRequired",
        });
      }

      if (!data.month) {
        ctx.addIssue({
          code: "custom",
          path: ["month"],
          message: "notes.errors.monthRequired",
        });
      }
    }
  });

export const noteEditorSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: "notes.errors.titleRequired" })
    .max(200, { message: "notes.errors.titleTooLong" }),
  content: z.string().max(30000, { message: "notes.errors.contentTooLong" }),
});

export const searchPeriodSchema = z.object({
  year: z
    .number({
      message: "notes.errors.yearRequired",
    })
    .int()
    .min(1900, { message: "notes.errors.yearInvalid" })
    .max(3000, { message: "notes.errors.yearInvalid" }),
  month: z
    .number({
      message: "notes.errors.monthRequired",
    })
    .int()
    .min(1, { message: "notes.errors.monthInvalid" })
    .max(12, { message: "notes.errors.monthInvalid" }),
});

export type CreateNoteContextFormData = z.infer<typeof createNoteContextSchema>;
export type NoteEditorFormData = z.infer<typeof noteEditorSchema>;
export type SearchPeriodFormData = z.infer<typeof searchPeriodSchema>;
