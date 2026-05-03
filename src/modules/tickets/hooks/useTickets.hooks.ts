"use client";

import { useEffect } from "react";
import { useTicketsStore } from "../context/ticketsContext";

export function useTicketsList(autoFetch = true) {
  const tickets = useTicketsStore((s) => s.tickets);
  const pagination = useTicketsStore((s) => s.pagination);
  const filters = useTicketsStore((s) => s.filters);
  const isLoading = useTicketsStore((s) => s.isLoading);
  const error = useTicketsStore((s) => s.error);
  const fetchTickets = useTicketsStore((s) => s.fetchTickets);
  const setSearch = useTicketsStore((s) => s.setSearch);
  const setStatus = useTicketsStore((s) => s.setStatus);
  const clearError = useTicketsStore((s) => s.clearError);

  useEffect(() => {
    if (!autoFetch) return;
    void fetchTickets();
  }, [
    autoFetch,
    fetchTickets,
    filters.page,
    filters.pageSize,
    filters.status,
    filters.search,
  ]);

  return {
    tickets,
    pagination,
    filters,
    isLoading,
    error,
    fetchTickets,
    setSearch,
    setStatus,
    clearError,
  };
}

export function useTicketDetail(ticketId: number | null, autoFetch = true) {
  const ticket = useTicketsStore((s) => s.selectedTicket);
  const isLoading = useTicketsStore((s) => s.isLoading);
  const isSubmitting = useTicketsStore((s) => s.isSubmitting);
  const error = useTicketsStore((s) => s.error);
  const fetchTicketDetail = useTicketsStore((s) => s.fetchTicketDetail);
  const sendMessage = useTicketsStore((s) => s.sendMessage);
  const closeTicket = useTicketsStore((s) => s.closeTicket);
  const reopenTicket = useTicketsStore((s) => s.reopenTicket);
  const clearError = useTicketsStore((s) => s.clearError);

  useEffect(() => {
    if (!autoFetch) return;
    if (!ticketId) return;
    void fetchTicketDetail(ticketId);
  }, [autoFetch, fetchTicketDetail, ticketId]);

  return {
    ticket,
    isLoading,
    isSubmitting,
    error,
    fetchTicketDetail,
    sendMessage,
    closeTicket,
    reopenTicket,
    clearError,
  };
}
