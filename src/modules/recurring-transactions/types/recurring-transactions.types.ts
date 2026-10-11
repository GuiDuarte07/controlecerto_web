export type RecurringTransactionType = "EXPENSE" | "INCOME";
export type RecurrenceFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
export type RecurringInstanceStatus =
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "SKIPPED"
  | "ERROR";

export interface RecurrenceRule {
  id?: number;
  frequency: RecurrenceFrequency;
  isEveryDay: boolean;
  daysOfWeek?: string | null;
  dayOfWeek?: number | null;
  dayOfMonth?: number | null;
  monthOfYear?: number | null;
  dayOfMonthForYearly?: number | null;
  interval: number;
}

export interface RecurringTransaction {
  id: number;
  description: string;
  amount: number;
  justForRecord: boolean;
  destination?: string | null;
  type: RecurringTransactionType;
  startDate: string;
  endDate?: string | null;
  isActive: boolean;
  accountId: number;
  categoryId: number;
  recurrenceRuleId: number;
  recurrenceRule: RecurrenceRule;
  pendingInstancesCount: number;
  confirmedInstancesCount: number;
  rejectedInstancesCount: number;
}

export interface RecurringTransactionInstance {
  id: number;
  recurringTransactionId: number;
  scheduledDate: string;
  processedDate?: string | null;
  status: RecurringInstanceStatus;
  actualTransactionId?: number | null;
  rejectionReason?: string | null;
  recurringTransactionDescription: string;
  recurringTransactionAmount: number;
  recurringTransactionType: RecurringTransactionType;
}

export interface CreateRecurringTransactionRequest {
  description: string;
  amount: number;
  destination?: string;
  justForRecord: boolean;
  type: RecurringTransactionType;
  startDate: string;
  endDate?: string;
  accountId: number;
  categoryId: number;
  recurrenceRule: Omit<RecurrenceRule, "id">;
}

export interface UpdateRecurringTransactionRequest
  extends CreateRecurringTransactionRequest {
  isActive: boolean;
}
