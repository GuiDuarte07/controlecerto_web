"use client";

import { useEffect } from "react";
import { useAdminTicketsStore } from "../context/adminTicketsContext";

export function useAdminTicketsList(autoFetch = true) {
  const tickets = useAdminTicketsStore((s) => s.tickets);
  const pagination = useAdminTicketsStore((s) => s.pagination);
  const filters = useAdminTicketsStore((s) => s.filters);
  const isLoading = useAdminTicketsStore((s) => s.isLoading);
  const error = useAdminTicketsStore((s) => s.error);
  const fetchTickets = useAdminTicketsStore((s) => s.fetchTickets);
  const setSearch = useAdminTicketsStore((s) => s.setSearch);
  const setStatus = useAdminTicketsStore((s) => s.setStatus);
  const clearError = useAdminTicketsStore((s) => s.clearError);

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

export function useAdminTicketDetail(
  ticketId: number | null,
  autoFetch = true,
) {
  const ticket = useAdminTicketsStore((s) => s.selectedTicket);
  const isLoading = useAdminTicketsStore((s) => s.isLoading);
  const isSubmitting = useAdminTicketsStore((s) => s.isSubmitting);
  const error = useAdminTicketsStore((s) => s.error);
  const fetchTicketDetail = useAdminTicketsStore((s) => s.fetchTicketDetail);
  const sendMessage = useAdminTicketsStore((s) => s.sendMessage);
  const updateTicket = useAdminTicketsStore((s) => s.updateTicket);
  const clearError = useAdminTicketsStore((s) => s.clearError);

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
    updateTicket,
    clearError,
  };
}
