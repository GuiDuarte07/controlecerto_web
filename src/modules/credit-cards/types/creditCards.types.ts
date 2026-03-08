import type { Account } from "@/modules/accounts/types/accounts.types";

export interface CreditCard {
  id: number;
  totalLimit: number;
  usedLimit: number;
  description: string;
  dueDay: number;
  closeDay: number;
  skipWeekend: boolean;
  account: Account;
}

export interface CreateCreditCardRequest {
  totalLimit: number;
  description?: string;
  accountId: number;
  closeDay: number;
  dueDay: number;
  skipWeekend: boolean;
}

export interface UpdateCreditCardRequest {
  id: number;
  totalLimit?: number;
  description?: string;
}
