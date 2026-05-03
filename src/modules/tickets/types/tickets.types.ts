export const TICKET_STATUS_KEYS = [
  "OPEN",
  "INPROGRESS",
  "WAITINGUSER",
  "RESOLVED",
  "CLOSED",
] as const;

export type TicketStatusKey = (typeof TICKET_STATUS_KEYS)[number];

export const TICKET_PRIORITY_KEYS = ["LOW", "NORMAL", "HIGH"] as const;

export type TicketPriorityKey = (typeof TICKET_PRIORITY_KEYS)[number];

export type TicketStatusValue = TicketStatusKey | number;
export type TicketPriorityValue = TicketPriorityKey | number;

export function resolveTicketStatusKey(
  value: TicketStatusValue,
): TicketStatusKey {
  if (
    typeof value === "string" &&
    (TICKET_STATUS_KEYS as readonly string[]).includes(value)
  ) {
    return value as TicketStatusKey;
  }

  if (
    typeof value === "number" &&
    value >= 0 &&
    value < TICKET_STATUS_KEYS.length
  ) {
    return TICKET_STATUS_KEYS[value];
  }

  return "OPEN";
}

export function resolveTicketPriorityKey(
  value: TicketPriorityValue,
): TicketPriorityKey {
  if (
    typeof value === "string" &&
    (TICKET_PRIORITY_KEYS as readonly string[]).includes(value)
  ) {
    return value as TicketPriorityKey;
  }

  if (
    typeof value === "number" &&
    value >= 0 &&
    value < TICKET_PRIORITY_KEYS.length
  ) {
    return TICKET_PRIORITY_KEYS[value];
  }

  return "NORMAL";
}

export function toTicketStatusValue(key: TicketStatusKey): number {
  return TICKET_STATUS_KEYS.indexOf(key);
}

export function toTicketPriorityValue(key: TicketPriorityKey): number {
  return TICKET_PRIORITY_KEYS.indexOf(key);
}

export interface TicketAttachment {
  id: number;
  ticketId: number;
  ticketMessageId: number | null;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  url: string;
  storageKey: string;
  createdAt: string;
}

export interface TicketMessage {
  id: number;
  ticketId: number;
  authorUserId: number;
  authorRole: "USER" | "ADMIN" | number;
  body: string;
  createdAt: string;
  attachments: TicketAttachment[];
}

export interface Ticket {
  id: number;
  userId: number;
  subject: string;
  status: TicketStatusValue;
  priority: TicketPriorityValue;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
}

export interface TicketDetail extends Ticket {
  messages: TicketMessage[];
  attachments: TicketAttachment[];
}

export interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}
