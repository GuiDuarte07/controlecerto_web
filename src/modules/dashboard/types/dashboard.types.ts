export interface HomeDashboardResponse {
  startDate: string;
  endDate: string;
  financialSummary: FinancialSummary;
  accounts: AccountSummary[];
  creditCards: CreditCardSummary[];
  expensesByCategory: CategoryExpense[];
  investmentsSummary: InvestmentsSummary;
  dailyBalances: DailyBalance[];
  monthlyTrends: MonthlyTrend[];
  recentTransactions: RecentTransaction[];
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  totalAccountsBalance: number;
  totalCreditUsed: number;
  totalCreditAvailable: number;
  totalInvestments: number;
  totalTransactions: number;
  averageDailyExpense: number;
  projectedMonthlyExpense: number;
}

export interface AccountSummary {
  id: number;
  bank: string;
  description: string | null;
  color: string;
  balance: number;
  totalIncome: number;
  totalExpense: number;
  transactionCount: number;
}

export interface CreditCardSummary {
  id: number;
  description: string;
  totalLimit: number;
  usedLimit: number;
  availableLimit: number;
  usagePercentage: number;
  currentInvoiceAmount: number;
  transactionCount: number;
  accountBank: string;
}

export interface CategoryExpense {
  categoryId: number;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  parentCategoryId: number | null;
  parentCategoryName: string | null;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
  categoryLimit: number | null;
  limitUsagePercentage: number | null;
}

export interface InvestmentsSummary {
  totalValue: number;
  totalInvestments: number;
  totalDividends: number;
  totalDeposits: number;
  totalWithdrawals: number;
  netProfit: number;
  investments: InvestmentDetail[];
}

export interface InvestmentDetail {
  id: number;
  name: string;
  currentValue: number;
  totalDividends: number;
  startDate: string;
}

export interface DailyBalance {
  date: string;
  income: number;
  expense: number;
  balance: number;
  cumulativeBalance: number;
}

export interface MonthlyTrend {
  year: number;
  month: number;
  monthName: string;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  transactionCount: number;
}

export interface RecentTransaction {
  id: number;
  amount: number;
  description: string;
  purchaseDate: string;
  type: string;
  categoryId: number;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  accountId: number;
  accountBank: string;
}

export interface DashboardFilters {
  startDate: Date;
  endDate: Date;
}
