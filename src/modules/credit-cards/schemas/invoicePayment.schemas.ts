import { z } from "zod";

export const invoicePaymentFormSchema = z.object({
  accountId: z.number({ error: "payment.errors.accountRequired" }),
  amountPaid: z
    .number({ error: "payment.errors.amountRequired" })
    .positive({ message: "payment.errors.amountPositive" }),
  description: z
    .string()
    .min(1, { message: "payment.errors.descriptionRequired" })
    .max(100),
  paymentDate: z.date({ error: "payment.errors.paymentDateRequired" }),
  justForRecord: z.boolean().default(false),
});

export type InvoicePaymentFormData = z.infer<typeof invoicePaymentFormSchema>;
