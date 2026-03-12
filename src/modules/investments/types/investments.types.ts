export type InvestmentHistoryType =
  | "INVEST"
  | "WITHDRAW"
  | "ADJUSTMENT"
  | "YIELD"
  | "INITIAL_BALANCE";

export interface InvestmentHistoryAccount {
  id: number;
  description: string;
  [key: string]: unknown;
}

export interface InvestmentHistory {
  id: number;
  occurredAt: string;
  changeAmount: number;
  totalValue: number;
  note: string | null;
  sourceAccountId: number | null;
  sourceAccount: InvestmentHistoryAccount | null;
  type: InvestmentHistoryType;
}

export interface Investment {
  id: number;
  name: string;
  startDate: string;
  currentValue: number;
  description: string | null;
  createdAt: string;
  updatedAt: string | null;
  histories: InvestmentHistory[] | null;
}

export interface CreateInvestmentRequest {
  name: string;
  initialAmount?: number;
  startDate?: string;
  description?: string;
}

export interface UpdateInvestmentRequest {
  name?: string;
  startDate?: string;
  description?: string;
}

export interface DepositWithdrawRequest {
  amount: number;
  accountId?: number;
  occurredAt?: string;
  note?: string;
}

export interface AdjustInvestmentRequest {
  newTotalValue: number;
  occurredAt?: string;
  note?: string;
}
