import { apiFetch } from "@/shared/lib/api-client";
import type {
  CreateCreditPurchaseRequest,
  CreateTransactionRequest,
  CreateTransferenceRequest,
  InvoiceListResponse,
  StatementResponse,
  Transaction,
  UpdateCreditPurchaseRequest,
  UpdateTransactionRequest,
} from "../types/transactions.types";

interface GetTransactionsParams {
  mode: "invoice" | "statement";
  startDate: string;
  endDate: string;
  accountId?: number;
  cardId?: number;
  categoryId?: number;
  searchText?: string;
  sort?: string;
  pageNumber?: number;
  pageSize?: number;
}

async function getTransactions(
  params: GetTransactionsParams,
): Promise<InvoiceListResponse | StatementResponse> {
  const query = new URLSearchParams();
  query.set("mode", params.mode);
  query.set("startDate", params.startDate);
  query.set("endDate", params.endDate);
  if (params.accountId !== undefined)
    query.set("accountId", String(params.accountId));
  if (params.cardId !== undefined) query.set("cardId", String(params.cardId));
  if (params.categoryId !== undefined)
    query.set("categoryId", String(params.categoryId));
  if (params.searchText) query.set("searchText", params.searchText);
  if (params.sort) query.set("sort", params.sort);
  if (params.pageNumber !== undefined)
    query.set("pageNumber", String(params.pageNumber));
  if (params.pageSize !== undefined)
    query.set("pageSize", String(params.pageSize));

  return apiFetch<InvoiceListResponse | StatementResponse>(
    `/api/transactions?${query.toString()}`,
    { method: "GET" },
  );
}

async function create(data: CreateTransactionRequest): Promise<Transaction> {
  return apiFetch<Transaction>("/api/transactions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

async function createTransference(
  data: CreateTransferenceRequest,
): Promise<Transaction> {
  return apiFetch<Transaction>("/api/transactions/transfers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

async function createCreditPurchase(
  data: CreateCreditPurchaseRequest,
): Promise<Transaction> {
  return apiFetch<Transaction>("/api/credit-purchases", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

async function update(
  id: number,
  data: UpdateTransactionRequest,
): Promise<Transaction> {
  return apiFetch<Transaction>(`/api/transactions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

async function updateCreditPurchase(
  id: number,
  data: UpdateCreditPurchaseRequest,
): Promise<Transaction> {
  return apiFetch<Transaction>(`/api/credit-purchases/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

async function remove(id: number): Promise<void> {
  return apiFetch<void>(`/api/transactions/${id}`, {
    method: "DELETE",
  });
}

export const transactionsService = {
  getTransactions,
  create,
  createTransference,
  createCreditPurchase,
  update,
  updateCreditPurchase,
  remove,
};
