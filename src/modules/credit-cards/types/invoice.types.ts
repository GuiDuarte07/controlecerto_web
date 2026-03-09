import type { Account } from "@/modules/accounts/types/accounts.types";

export interface InvoiceCategory {
  id: number;
  name: string;
  icon: string;
  color: string;
}

export interface InvoiceTransaction {
  id: number;
  type: number;
  amount: number;
  purchaseDate: string;
  description: string;
  destination?: string | null;
  observations?: string | null;
  justForRecord: boolean;
  account: {
    id: number;
    balance: number;
    description: string;
    bank: string;
    color: string;
  } | null;
  category: InvoiceCategory | null;
  installmentNumber?: number;
  creditPurchase: null;
}

export interface InvoicePayment {
  id: number;
  amountPaid: number;
  description: string;
  paymentDate: string;
  account: Account;
  justForRecord: boolean;
}

export interface InvoiceCreditCard {
  id: number;
  description: string;
  account: Account | null;
}

export interface Invoice {
  id: number;
  totalAmount: number;
  totalPaid: number;
  isPaid: boolean;
  invoiceDate: string;
  closingDate: string;
  dueDate: string;
  creditCard: InvoiceCreditCard;
  transactions?: InvoiceTransaction[];
  invoicePayments?: InvoicePayment[];
}

export interface InvoicePageData {
  invoice: Invoice;
  nextInvoiceId: number | null;
  prevInvoiceId: number | null;
}

export interface CreateCreditPurchaseRequest {
  creditCardId: number;
  categoryId: number;
  name: string;
  totalAmount: number;
  purchaseDate: string;
  installments: number;
  firstInvoiceDate?: string;
}

export interface UpdateCreditPurchaseRequest {
  name?: string;
  totalAmount?: number;
  installments?: number;
  purchaseDate?: string;
  categoryId?: number;
  creditCardId?: number;
}

export interface CreateInvoicePaymentRequest {
  accountId: number;
  amountPaid: number;
  description: string;
  paymentDate: string;
  justForRecord?: boolean;
}
