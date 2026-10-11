import { apiFetch } from "@/shared/lib/api-client";
import type {
  CreateRecurringTransactionRequest,
  RecurrenceFrequency,
  RecurringInstanceStatus,
  RecurringTransaction,
  RecurringTransactionInstance,
  RecurringTransactionType,
  UpdateRecurringTransactionRequest,
} from "../types/recurring-transactions.types";

const TYPE_VALUES: Record<RecurringTransactionType, number> = { EXPENSE: 0, INCOME: 1 };
const FREQUENCY_VALUES: Record<RecurrenceFrequency, number> = { DAILY: 0, WEEKLY: 1, MONTHLY: 2, YEARLY: 3 };
const STATUS_VALUES: Record<RecurringInstanceStatus, number> = { PENDING: 0, CONFIRMED: 1, REJECTED: 2, SKIPPED: 3, ERROR: 4 };
const TYPES: RecurringTransactionType[] = ["EXPENSE", "INCOME"];
const FREQUENCIES: RecurrenceFrequency[] = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"];
const STATUSES: RecurringInstanceStatus[] = ["PENDING", "CONFIRMED", "REJECTED", "SKIPPED", "ERROR"];

type ApiRecurringTransaction = Omit<RecurringTransaction, "type" | "recurrenceRule"> & {
  type: RecurringTransactionType | number;
  recurrenceRule: Omit<RecurringTransaction["recurrenceRule"], "frequency"> & { frequency: RecurrenceFrequency | number };
};
type ApiRecurringInstance = Omit<RecurringTransactionInstance, "status" | "recurringTransactionType"> & {
  status: RecurringInstanceStatus | number;
  recurringTransactionType: RecurringTransactionType | number;
};

function normalizeEnum<T extends string>(value: T | number, values: readonly T[], fallback: T): T {
  return typeof value === "number" ? values[value] ?? fallback : value;
}

function normalizeTransaction(data: ApiRecurringTransaction): RecurringTransaction {
  return {
    ...data,
    type: normalizeEnum(data.type, TYPES, "EXPENSE"),
    recurrenceRule: {
      ...data.recurrenceRule,
      frequency: normalizeEnum(data.recurrenceRule.frequency, FREQUENCIES, "MONTHLY"),
    },
  };
}

function normalizeInstance(data: ApiRecurringInstance): RecurringTransactionInstance {
  return {
    ...data,
    status: normalizeEnum(data.status, STATUSES, "PENDING"),
    recurringTransactionType: normalizeEnum(data.recurringTransactionType, TYPES, "EXPENSE"),
  };
}

function toApiPayload(data: CreateRecurringTransactionRequest | UpdateRecurringTransactionRequest) {
  return {
    ...data,
    type: TYPE_VALUES[data.type],
    recurrenceRule: { ...data.recurrenceRule, frequency: FREQUENCY_VALUES[data.recurrenceRule.frequency] },
  };
}

async function getAll(): Promise<RecurringTransaction[]> {
  const response = await apiFetch<ApiRecurringTransaction[]>("/api/recurring-transactions", { method: "GET" });
  return response.map(normalizeTransaction);
}

async function getInstances(status: RecurringInstanceStatus): Promise<RecurringTransactionInstance[]> {
  const response = await apiFetch<ApiRecurringInstance[]>(`/api/recurring-transactions/instances?status=${STATUS_VALUES[status]}`, { method: "GET" });
  return response.map(normalizeInstance);
}

async function create(data: CreateRecurringTransactionRequest): Promise<RecurringTransaction> {
  const response = await apiFetch<ApiRecurringTransaction>("/api/recurring-transactions", { method: "POST", body: JSON.stringify(toApiPayload(data)) });
  return normalizeTransaction(response);
}

async function update(id: number, data: UpdateRecurringTransactionRequest): Promise<RecurringTransaction> {
  const response = await apiFetch<ApiRecurringTransaction>(`/api/recurring-transactions/${id}`, { method: "PATCH", body: JSON.stringify(toApiPayload(data)) });
  return normalizeTransaction(response);
}

async function remove(id: number): Promise<void> {
  return apiFetch<void>(`/api/recurring-transactions/${id}`, { method: "DELETE" });
}

async function process(instanceIds: number[], action: "CONFIRMED" | "REJECTED", rejectReason?: string): Promise<RecurringTransactionInstance[]> {
  const response = await apiFetch<ApiRecurringInstance[]>("/api/recurring-transactions/process", {
    method: "POST",
    body: JSON.stringify({ pendingTransactions: instanceIds, action: STATUS_VALUES[action], rejectReason }),
  });
  return response.map(normalizeInstance);
}

export const recurringTransactionsService = { getAll, getInstances, create, update, remove, process };
