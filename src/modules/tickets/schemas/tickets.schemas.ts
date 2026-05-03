import { z } from "zod";

const MAX_SUBJECT_LENGTH = 140;
const MAX_ATTACHMENTS = 10;
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

export const createTicketSchema = z.object({
  subject: z
    .string()
    .min(1, { message: "errors.subjectRequired" })
    .max(MAX_SUBJECT_LENGTH, { message: "errors.subjectTooLong" }),
  description: z.string().min(1, { message: "errors.descriptionRequired" }),
  attachments: z
    .array(z.instanceof(File))
    .max(MAX_ATTACHMENTS, { message: "errors.attachmentsTooMany" })
    .refine((files) => files.every((f) => f.size <= MAX_ATTACHMENT_BYTES), {
      message: "errors.attachmentTooLarge",
    })
    .optional(),
});

export type CreateTicketFormData = z.infer<typeof createTicketSchema>;

export const createTicketMessageSchema = z.object({
  body: z.string().min(1, { message: "errors.messageRequired" }),
  attachments: z
    .array(z.instanceof(File))
    .max(MAX_ATTACHMENTS, { message: "errors.attachmentsTooMany" })
    .refine((files) => files.every((f) => f.size <= MAX_ATTACHMENT_BYTES), {
      message: "errors.attachmentTooLarge",
    })
    .optional(),
});

export type CreateTicketMessageFormData = z.infer<
  typeof createTicketMessageSchema
>;
