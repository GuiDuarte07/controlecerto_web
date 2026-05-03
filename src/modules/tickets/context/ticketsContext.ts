import { create } from "zustand";
import { ApiError, toApiError } from "@/shared/lib/api-client";
import { ticketsService } from "../services/tickets.service";
import type {
  PaginatedResponse,
  Ticket,
  TicketDetail,
  TicketStatusKey,
} from "../types/tickets.types";

interface TicketsFilters {
  page: number;
  pageSize: number;
  search: string;
  status: TicketStatusKey | "ALL";
}

interface TicketsState {
  tickets: Ticket[];
  pagination: PaginatedResponse<Ticket>["pagination"] | null;
  selectedTicket: TicketDetail | null;
  filters: TicketsFilters;
  isLoading: boolean;
  isSubmitting: boolean;
  error: ApiError | null;
}

interface TicketsActions {
  fetchTickets: (
    options?: Partial<Pick<TicketsFilters, "page" | "pageSize">>,
  ) => Promise<void>;
  fetchTicketDetail: (ticketId: number) => Promise<void>;
  createTicket: (data: {
    subject: string;
    description: string;
    attachments: File[];
  }) => Promise<TicketDetail>;
  sendMessage: (
    ticketId: number,
    data: { body: string; attachments: File[] },
  ) => Promise<void>;
  closeTicket: (ticketId: number) => Promise<void>;
  reopenTicket: (ticketId: number) => Promise<void>;
  setSearch: (search: string) => void;
  setStatus: (status: TicketsFilters["status"]) => void;
  clearError: () => void;
}

type TicketsStore = TicketsState & TicketsActions;

const initialState: TicketsState = {
  tickets: [],
  pagination: null,
  selectedTicket: null,
  filters: {
    page: 1,
    pageSize: 20,
    search: "",
    status: "ALL",
  },
  isLoading: false,
  isSubmitting: false,
  error: null,
};

function buildFormData(fields: Record<string, string>, files: File[]) {
  const form = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    form.append(key, value);
  });
  files.forEach((file) => {
    form.append("Attachments", file);
  });
  return form;
}

export const useTicketsStore = create<TicketsStore>((set, get) => ({
  ...initialState,

  fetchTickets: async (options) => {
    const { filters } = get();
    const nextFilters: TicketsFilters = {
      ...filters,
      ...options,
      page: Math.max(options?.page ?? filters.page, 1),
      pageSize: Math.max(options?.pageSize ?? filters.pageSize, 1),
    };

    set({ isLoading: true, error: null, filters: nextFilters });

    try {
      const response = await ticketsService.listUser({
        page: nextFilters.page,
        pageSize: nextFilters.pageSize,
        search: nextFilters.search.trim() ? nextFilters.search : undefined,
        status: nextFilters.status === "ALL" ? undefined : nextFilters.status,
      });

      set({
        tickets: response.data,
        pagination: response.pagination,
        isLoading: false,
      });
    } catch (err) {
      const error = toApiError(err, "tickets.feedback.loadListError");
      set({ error, isLoading: false });
      throw error;
    }
  },

  fetchTicketDetail: async (ticketId) => {
    set({ isLoading: true, error: null });

    try {
      const detail = await ticketsService.getTicketDetail(ticketId);
      set({ selectedTicket: detail, isLoading: false });
    } catch (err) {
      const error = toApiError(err, "tickets.feedback.loadDetailError");
      set({ error, isLoading: false });
      throw error;
    }
  },

  createTicket: async ({ subject, description, attachments }) => {
    set({ isSubmitting: true, error: null });

    try {
      const form = buildFormData(
        { Subject: subject.trim(), Description: description },
        attachments,
      );

      const detail = await ticketsService.createTicket(form);
      set({ selectedTicket: detail, isSubmitting: false });
      await get().fetchTickets({ page: 1 });
      return detail;
    } catch (err) {
      const error = toApiError(err, "tickets.feedback.createError");
      set({ error, isSubmitting: false });
      throw error;
    }
  },

  sendMessage: async (ticketId, { body, attachments }) => {
    set({ isSubmitting: true, error: null });

    try {
      const form = buildFormData({ Body: body }, attachments);
      await ticketsService.sendUserMessage(ticketId, form);
      await get().fetchTicketDetail(ticketId);
      set({ isSubmitting: false });
    } catch (err) {
      const error = toApiError(err, "tickets.feedback.sendMessageError");
      set({ error, isSubmitting: false });
      throw error;
    }
  },

  closeTicket: async (ticketId) => {
    set({ isSubmitting: true, error: null });

    try {
      await ticketsService.closeTicket(ticketId);
      await get().fetchTicketDetail(ticketId);
      await get().fetchTickets();
      set({ isSubmitting: false });
    } catch (err) {
      const error = toApiError(err, "tickets.feedback.updateStatusError");
      set({ error, isSubmitting: false });
      throw error;
    }
  },

  reopenTicket: async (ticketId) => {
    set({ isSubmitting: true, error: null });

    try {
      await ticketsService.reopenTicket(ticketId);
      await get().fetchTicketDetail(ticketId);
      await get().fetchTickets();
      set({ isSubmitting: false });
    } catch (err) {
      const error = toApiError(err, "tickets.feedback.updateStatusError");
      set({ error, isSubmitting: false });
      throw error;
    }
  },

  setSearch: (search) => {
    set((state) => ({
      filters: {
        ...state.filters,
        search,
        page: 1,
      },
    }));
  },

  setStatus: (status) => {
    set((state) => ({
      filters: {
        ...state.filters,
        status,
        page: 1,
      },
    }));
  },

  clearError: () => set({ error: null }),
}));
