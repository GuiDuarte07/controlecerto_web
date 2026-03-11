export type TransactionType =
  | "EXPENSE"
  | "INCOME"
  | "CREDITEXPENSE"
  | "TRANSFERENCE"
  | "INVOICEPAYMENT";

export type TransactionMode = "invoice" | "statement";
export type SortDirection = "asc" | "desc";

export interface TransactionAccount {
  id: number;
  balance: number;
  description?: string;
  bank: string;
  color: string;
}

export interface TransactionCategory {
  id: number;
  parentId?: number;
  name: string;
  icon: string;
  billType: number;
  color: string;
  limit?: number;
}

export interface CreditPurchaseInfo {
  id: number;
  totalAmount: number;
  totalInstallment: number;
  installmentsPaid: number;
  purchaseDate?: string;
  paid: boolean;
  destination: string;
  description?: string;
  creditCardId: number;
}

export interface Transaction {
  id: number;
  type: TransactionType;
  amount: number;
  purchaseDate: string;
  description: string;
  observations?: string;
  destination?: string;
  justForRecord: boolean;
  account: TransactionAccount;
  category: TransactionCategory;
  installmentNumber?: number;
  creditPurchase?: CreditPurchaseInfo;
}

export interface InvoicePayment {
  id: number;
  amountPaid: number;
  description: string;
  paymentDate: string;
  account: TransactionAccount;
  justForRecord: boolean;
}

export interface Invoice {
  id: number;
  totalAmount: number;
  totalPaid: number;
  isPaid: boolean;
  invoiceDate: string;
  closingDate: string;
  dueDate: string;
  creditCard: {
    id: number;
    totalLimit: number;
    usedLimit: number;
    description: string;
    dueDay: number;
    closeDay: number;
    account: TransactionAccount | null;
  };
  transactions?: Transaction[];
  invoicePayments?: InvoicePayment[];
}

export interface InvoiceListResponse {
  transactions: Transaction[];
  invoices: Invoice[];
}

export interface StatementPagination {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface StatementSummary {
  totalItems: number;
  totalIncome: number;
  totalExpense: number;
  totalCreditCharges: number;
  totalInvoicePayments: number;
  netBalance: number;
}

export interface StatementResponse {
  startDate: string;
  endDate: string;
  transactions: {
    data: Transaction[];
    pagination: StatementPagination;
  };
  summary: StatementSummary;
}

export interface TransactionFilters {
  accountId?: number;
  cardId?: number;
  categoryId?: number;
  searchText?: string;
  sort?: string;
  dateStart?: Date;
  dateEnd?: Date;
}

export interface CreateTransactionRequest {
  amount: number;
  type: TransactionType;
  purchaseDate: string;
  destination: string;
  description?: string;
  observations?: string;
  accountId: number;
  categoryId: number;
  justForRecord: boolean;
}

export interface CreateCreditPurchaseRequest {
  totalAmount: number;
  totalInstallment: number;
  installmentsPaid: number;
  purchaseDate: string;
  destination: string;
  description?: string;
  creditCardId: number;
  categoryId: number;
}

export interface SimulateCreditPurchaseInvoiceRequest {
  creditCardId: number;
  purchaseDate: string;
}

export interface SimulatedCreditPurchaseInvoiceResponse {
  creditCardDescription: string;
  invoiceDate: string;
  closingDate: string;
  dueDate: string;
  totalAmount: number;
}

export interface CreateTransferenceRequest {
  amount: number;
  purchaseDate: string;
  accountDestinyId: number;
  accountOriginId: number;
  description?: string;
}

export interface UpdateTransactionRequest {
  id: number;
  amount?: number;
  purchaseDate?: string;
  destination?: string;
  description?: string;
  observations?: string;
  justForRecord?: boolean;
  categoryId?: number;
}

export interface UpdateCreditPurchaseRequest {
  id: number;
  totalAmount?: number;
  totalInstallment?: number;
  purchaseDate?: string;
  destination?: string;
  description?: string;
  creditCardId?: number;
  categoryId?: number;
}
