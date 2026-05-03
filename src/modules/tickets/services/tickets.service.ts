import { apiFetch } from "@/shared/lib/api-client";
import type {
  PaginatedResponse,
  Ticket,
  TicketDetail,
  TicketPriorityKey,
  TicketStatusKey,
} from "../types/tickets.types";
import {
  toTicketPriorityValue,
  toTicketStatusValue,
} from "../types/tickets.types";

interface ListTicketsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: TicketStatusKey;
}

function buildQuery(params: Record<string, string | number | undefined>) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return "";
  const qs = entries
    .map(
      ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
    )
    .join("&");
  return `?${qs}`;
}

async function listUser(params: ListTicketsParams = {}) {
  return apiFetch<PaginatedResponse<Ticket>>(
    `/api/tickets${buildQuery({
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      status: params.status,
    })}`,
    { method: "GET" },
  );
}

async function createTicket(form: FormData) {
  return apiFetch<TicketDetail>("/api/tickets", {
    method: "POST",
    body: form,
  });
}

async function getTicketDetail(ticketId: number) {
  return apiFetch<TicketDetail>(`/api/tickets/${ticketId}`, {
    method: "GET",
  });
}

async function sendUserMessage(ticketId: number, form: FormData) {
  return apiFetch(`/api/tickets/${ticketId}/messages`, {
    method: "POST",
    body: form,
  });
}

async function closeTicket(ticketId: number) {
  return apiFetch<void>(`/api/tickets/${ticketId}`, {
    method: "PATCH",
    body: JSON.stringify({ action: "close" }),
  });
}

async function reopenTicket(ticketId: number) {
  return apiFetch<void>(`/api/tickets/${ticketId}`, {
    method: "PATCH",
    body: JSON.stringify({ action: "reopen" }),
  });
}

async function listAdmin(params: ListTicketsParams = {}) {
  return apiFetch<PaginatedResponse<Ticket>>(
    `/api/admin/tickets${buildQuery({
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      status: params.status,
    })}`,
    { method: "GET" },
  );
}

async function getAdminTicketDetail(ticketId: number) {
  return apiFetch<TicketDetail>(`/api/admin/tickets/${ticketId}`, {
    method: "GET",
  });
}

async function sendAdminMessage(ticketId: number, form: FormData) {
  return apiFetch(`/api/admin/tickets/${ticketId}/messages`, {
    method: "POST",
    body: form,
  });
}

async function updateAdminTicket(
  ticketId: number,
  data: { status?: TicketStatusKey; priority?: TicketPriorityKey },
) {
  return apiFetch<Ticket>(`/api/admin/tickets/${ticketId}`, {
    method: "PATCH",
    body: JSON.stringify({
      status:
        data.status !== undefined
          ? toTicketStatusValue(data.status)
          : undefined,
      priority:
        data.priority !== undefined
          ? toTicketPriorityValue(data.priority)
          : undefined,
    }),
  });
}

export const ticketsService = {
  listUser,
  createTicket,
  getTicketDetail,
  sendUserMessage,
  closeTicket,
  reopenTicket,
  listAdmin,
  getAdminTicketDetail,
  sendAdminMessage,
  updateAdminTicket,
};
