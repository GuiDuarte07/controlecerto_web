import { apiFetch } from "@/shared/lib/api-client";
import type {
  Invoice,
  InvoicePageData,
  CreateCreditPurchaseRequest,
  UpdateCreditPurchaseRequest,
  CreateInvoicePaymentRequest,
  InvoicePayment,
} from "../types/invoice.types";

async function getByDate(
  creditCardId: number,
  startDate: string,
  endDate: string,
): Promise<Invoice[]> {
  const params = new URLSearchParams({
    creditCardId: String(creditCardId),
    startDate,
    endDate,
  });
  return apiFetch<Invoice[]>(
    `/api/credit-cards/invoices?${params.toString()}`,
    {
      method: "GET",
    },
  );
}

async function getById(invoiceId: number): Promise<InvoicePageData> {
  return apiFetch<InvoicePageData>(`/api/credit-cards/invoices/${invoiceId}`, {
    method: "GET",
  });
}

async function createPurchase(
  data: CreateCreditPurchaseRequest,
): Promise<void> {
  return apiFetch<void>("/api/credit-cards/purchases", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

async function updatePurchase(
  id: number,
  data: UpdateCreditPurchaseRequest,
): Promise<void> {
  return apiFetch<void>(`/api/credit-cards/purchases/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

async function deletePurchase(id: number): Promise<void> {
  return apiFetch<void>(`/api/credit-cards/purchases/${id}`, {
    method: "DELETE",
  });
}

async function payInvoice(
  invoiceId: number,
  data: CreateInvoicePaymentRequest,
): Promise<InvoicePayment> {
  return apiFetch<InvoicePayment>(
    `/api/credit-cards/invoices/${invoiceId}/payments`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

async function deletePayment(id: number): Promise<void> {
  return apiFetch<void>(`/api/credit-cards/payments/${id}`, {
    method: "DELETE",
  });
}

export const invoiceService = {
  getByDate,
  getById,
  createPurchase,
  updatePurchase,
  deletePurchase,
  payInvoice,
  deletePayment,
};
