import { apiFetch } from "@/shared/lib/api-client";
import { format } from "date-fns";
import type {
  Investment,
  InvestmentHistory,
  CreateInvestmentRequest,
  UpdateInvestmentRequest,
  DepositWithdrawRequest,
  AdjustInvestmentRequest,
} from "../types/investments.types";

function toDateStr(date: Date) {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss");
}

async function getAll(): Promise<Investment[]> {
  return apiFetch<Investment[]>("/api/investments", { method: "GET" });
}

async function getById(id: number): Promise<Investment> {
  return apiFetch<Investment>(`/api/investments/${id}`, { method: "GET" });
}

async function getHistory(id: number): Promise<InvestmentHistory[]> {
  return apiFetch<InvestmentHistory[]>(`/api/investments/${id}/history`, {
    method: "GET",
  });
}

async function create(data: CreateInvestmentRequest): Promise<Investment> {
  return apiFetch<Investment>("/api/investments", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

async function update(
  id: number,
  data: UpdateInvestmentRequest,
): Promise<Investment> {
  return apiFetch<Investment>(`/api/investments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

async function deposit(
  id: number,
  data: DepositWithdrawRequest,
): Promise<Investment> {
  return apiFetch<Investment>(`/api/investments/${id}/deposit`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

async function withdraw(
  id: number,
  data: DepositWithdrawRequest,
): Promise<Investment> {
  return apiFetch<Investment>(`/api/investments/${id}/withdraw`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

async function adjust(
  id: number,
  data: AdjustInvestmentRequest,
): Promise<Investment> {
  return apiFetch<Investment>(`/api/investments/${id}/adjust`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

async function remove(id: number): Promise<void> {
  return apiFetch<void>(`/api/investments/${id}`, { method: "DELETE" });
}

export { toDateStr };

export const investmentsService = {
  getAll,
  getById,
  getHistory,
  create,
  update,
  deposit,
  withdraw,
  adjust,
  remove,
};
