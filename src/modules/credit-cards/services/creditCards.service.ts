import { apiFetch } from "@/shared/lib/api-client";
import type {
  CreditCard,
  CreateCreditCardRequest,
  UpdateCreditCardRequest,
} from "../types/creditCards.types";

async function getAll(): Promise<CreditCard[]> {
  return apiFetch<CreditCard[]>("/api/credit-cards/info", {
    method: "GET",
  });
}

async function create(data: CreateCreditCardRequest): Promise<CreditCard> {
  return apiFetch<CreditCard>("/api/credit-cards", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

async function update(
  id: number,
  data: Omit<UpdateCreditCardRequest, "id">,
): Promise<CreditCard> {
  return apiFetch<CreditCard>(`/api/credit-cards/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export const creditCardsService = {
  getAll,
  create,
  update,
};
