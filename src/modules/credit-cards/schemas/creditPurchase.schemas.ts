import { z } from "zod";

export const creditPurchaseFormSchema = z.object({
  name: z
    .string()
    .min(1, { message: "purchase.errors.nameRequired" })
    .max(100, { message: "purchase.errors.nameTooLong" }),
  totalAmount: z
    .number({ error: "purchase.errors.totalAmountRequired" })
    .positive({ message: "purchase.errors.totalAmountPositive" }),
  purchaseDate: z.date({ error: "purchase.errors.purchaseDateRequired" }),
  installments: z
    .number({ error: "purchase.errors.installmentsMin" })
    .int()
    .min(1, { message: "purchase.errors.installmentsMin" }),
  categoryId: z.number({ error: "purchase.errors.categoryRequired" }),
  firstInvoiceDate: z.date().optional(),
});

export type CreditPurchaseFormData = z.infer<typeof creditPurchaseFormSchema>;
