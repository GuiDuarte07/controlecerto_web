import { apiFetch } from "@/shared/lib/api-client";
import type {
  Account,
  CreateAccountRequest,
  UpdateAccountRequest,
} from "../types/accounts.types";

async function getAll(): Promise<Account[]> {
  return apiFetch<Account[]>("/api/accounts/", {
    method: "GET",
  });
}

async function create(data: CreateAccountRequest): Promise<Account> {
  return apiFetch<Account>("/api/accounts/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

async function update(
  id: number,
  data: UpdateAccountRequest,
): Promise<Account> {
  return apiFetch<Account>(`/api/accounts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

async function remove(id: number): Promise<void> {
  return apiFetch<void>(`/api/accounts/${id}`, {
    method: "DELETE",
  });
}

export const accountsService = {
  getAll,
  create,
  update,
  remove,
};
