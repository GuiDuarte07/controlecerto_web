import { create } from "zustand";
import { ApiError, toApiError } from "@/shared/lib/api-client";
import { ticketsService } from "../services/tickets.service";
import type {
  PaginatedResponse,
  Ticket,
  TicketDetail,
  TicketPriorityKey,
  TicketStatusKey,
} from "../types/tickets.types";

interface AdminTicketsFilters {
  page: number;
  pageSize: number;
  search: string;
  status: TicketStatusKey | "ALL";
}

interface AdminTicketsState {
  tickets: Ticket[];
  pagination: PaginatedResponse<Ticket>["pagination"] | null;
  selectedTicket: TicketDetail | null;
  filters: AdminTicketsFilters;
  isLoading: boolean;
  isSubmitting: boolean;
  error: ApiError | null;
}

interface AdminTicketsActions {
  fetchTickets: (
    options?: Partial<Pick<AdminTicketsFilters, "page" | "pageSize">>,
  ) => Promise<void>;
  fetchTicketDetail: (ticketId: number) => Promise<void>;
  sendMessage: (
    ticketId: number,
    data: { body: string; attachments: File[] },
  ) => Promise<void>;
  updateTicket: (
    ticketId: number,
    data: { status?: TicketStatusKey; priority?: TicketPriorityKey },
  ) => Promise<void>;
  setSearch: (search: string) => void;
  setStatus: (status: AdminTicketsFilters["status"]) => void;
  clearError: () => void;
}

type AdminTicketsStore = AdminTicketsState & AdminTicketsActions;

const initialState: AdminTicketsState = {
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

export const useAdminTicketsStore = create<AdminTicketsStore>((set, get) => ({
  ...initialState,

  fetchTickets: async (options) => {
    const { filters } = get();
    const nextFilters: AdminTicketsFilters = {
      ...filters,
      ...options,
      page: Math.max(options?.page ?? filters.page, 1),
      pageSize: Math.max(options?.pageSize ?? filters.pageSize, 1),
    };

    set({ isLoading: true, error: null, filters: nextFilters });

    try {
      const response = await ticketsService.listAdmin({
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
      const error = toApiError(err, "tickets.feedback.loadAdminListError");
      set({ error, isLoading: false });
      throw error;
    }
  },

  fetchTicketDetail: async (ticketId) => {
    set({ isLoading: true, error: null });

    try {
      const detail = await ticketsService.getAdminTicketDetail(ticketId);
      set({ selectedTicket: detail, isLoading: false });
    } catch (err) {
      const error = toApiError(err, "tickets.feedback.loadDetailError");
      set({ error, isLoading: false });
      throw error;
    }
  },

  sendMessage: async (ticketId, { body, attachments }) => {
    set({ isSubmitting: true, error: null });

    try {
      const form = buildFormData({ Body: body }, attachments);
      await ticketsService.sendAdminMessage(ticketId, form);
      await get().fetchTicketDetail(ticketId);
      set({ isSubmitting: false });
    } catch (err) {
      const error = toApiError(err, "tickets.feedback.sendMessageError");
      set({ error, isSubmitting: false });
      throw error;
    }
  },

  updateTicket: async (ticketId, data) => {
    set({ isSubmitting: true, error: null });

    try {
      await ticketsService.updateAdminTicket(ticketId, data);
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
