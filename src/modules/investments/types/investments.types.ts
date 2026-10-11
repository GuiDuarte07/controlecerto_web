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

export interface InvestmentAnalyticsQuery {
  startDate: string;
  endDate: string;
  investmentId?: number;
}

export interface InvestmentAnalyticsSummary {
  openingBalance: number;
  endingBalance: number;
  contributions: number;
  withdrawals: number;
  earnings: number;
  averageBalance: number;
  returnRate: number;
  averageMonthlyContribution: number;
  averageMonthlyEarnings: number;
  positiveMonths: number;
  negativeMonths: number;
}

export interface InvestmentMonthlyAnalytics {
  month: string;
  openingBalance: number;
  contributions: number;
  withdrawals: number;
  netContribution: number;
  earnings: number;
  closingBalance: number;
  averageBalance: number;
  returnRate: number;
  accumulatedContributions: number;
  accumulatedEarnings: number;
}

export interface InvestmentPerformance {
  id: number;
  name: string;
  openingBalance: number;
  endingBalance: number;
  contributions: number;
  withdrawals: number;
  earnings: number;
  averageBalance: number;
  returnRate: number;
}

export interface InvestmentAnalyticsResponse {
  startDate: string;
  endDate: string;
  summary: InvestmentAnalyticsSummary;
  monthly: InvestmentMonthlyAnalytics[];
  investments: InvestmentPerformance[];
}
