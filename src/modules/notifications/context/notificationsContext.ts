import { create } from "zustand";
import { ApiError, toApiError } from "@/shared/lib/api-client";
import { notificationsService } from "../services/notifications.service";
import type { NotificationItem } from "../types/notifications.types";

interface NotificationsFilters {
  page: number;
  pageSize: number;
  includeExpired: boolean;
  search: string;
}

interface NotificationsState {
  recentNotifications: NotificationItem[];
  notifications: NotificationItem[];
  unreadCount: number;
  filters: NotificationsFilters;
  isRecentLoading: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  error: ApiError | null;
}

interface NotificationsActions {
  fetchRecent: (maxNotifications?: number) => Promise<void>;
  fetchUnreadCount: (maxNotifications?: number) => Promise<void>;
  fetchAll: (
    options?: Partial<
      Pick<NotificationsFilters, "page" | "pageSize" | "includeExpired">
    >,
  ) => Promise<void>;
  setSearch: (search: string) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setIncludeExpired: (includeExpired: boolean) => void;
  markAsRead: (notificationIds: number[]) => Promise<void>;
  markSingleAsRead: (notificationId: number) => Promise<void>;
  markAllRecentAsRead: () => Promise<void>;
  removeNotification: (notificationId: number) => Promise<void>;
  clearError: () => void;
}

type NotificationsStore = NotificationsState & NotificationsActions;

const initialState: NotificationsState = {
  recentNotifications: [],
  notifications: [],
  unreadCount: 0,
  filters: {
    page: 1,
    pageSize: 20,
    includeExpired: false,
    search: "",
  },
  isRecentLoading: false,
  isLoading: false,
  isSubmitting: false,
  error: null,
};

function markItemsAsRead(
  list: NotificationItem[],
  notificationIds: Set<number>,
): NotificationItem[] {
  return list.map((item) =>
    notificationIds.has(item.id) ? { ...item, isRead: true } : item,
  );
}

function removeItem(
  list: NotificationItem[],
  notificationId: number,
): NotificationItem[] {
  return list.filter((item) => item.id !== notificationId);
}

export const useNotificationsStore = create<NotificationsStore>((set, get) => ({
  ...initialState,

  fetchRecent: async (maxNotifications = 8) => {
    set({ isRecentLoading: true, error: null });

    try {
      const notifications = await notificationsService.getRecent({
        maxNotifications,
      });

      set({
        recentNotifications: notifications,
        isRecentLoading: false,
      });
    } catch (err) {
      const error = toApiError(err, "notifications.feedback.loadRecentError");
      set({ error, isRecentLoading: false });
      throw error;
    }
  },

  fetchUnreadCount: async (maxNotifications = 99) => {
    try {
      const notifications = await notificationsService.getRecent({
        isRead: false,
        maxNotifications,
      });

      set({ unreadCount: notifications.length });
    } catch (err) {
      const error = toApiError(err, "notifications.feedback.loadUnreadError");
      set({ error });
    }
  },

  fetchAll: async (options) => {
    const { filters } = get();

    const nextFilters: NotificationsFilters = {
      ...filters,
      ...options,
      page: Math.max(options?.page ?? filters.page, 1),
      pageSize: Math.max(options?.pageSize ?? filters.pageSize, 1),
    };

    set({ isLoading: true, error: null, filters: nextFilters });

    try {
      const notifications = await notificationsService.getAll({
        page: nextFilters.page,
        pageSize: nextFilters.pageSize,
        includeExpired: nextFilters.includeExpired,
      });

      set({
        notifications,
        isLoading: false,
      });
    } catch (err) {
      const error = toApiError(err, "notifications.feedback.loadAllError");
      set({ error, isLoading: false });
      throw error;
    }
  },

  setSearch: (search) => {
    set((state) => ({
      filters: {
        ...state.filters,
        search,
      },
    }));
  },

  setPage: (page) => {
    set((state) => ({
      filters: {
        ...state.filters,
        page: Math.max(page, 1),
      },
    }));
  },

  setPageSize: (pageSize) => {
    set((state) => ({
      filters: {
        ...state.filters,
        pageSize: Math.max(pageSize, 1),
        page: 1,
      },
    }));
  },

  setIncludeExpired: (includeExpired) => {
    set((state) => ({
      filters: {
        ...state.filters,
        includeExpired,
        page: 1,
      },
    }));
  },

  markAsRead: async (notificationIds) => {
    const ids = Array.from(new Set(notificationIds.filter((id) => id > 0)));

    if (ids.length === 0) {
      return;
    }

    set({ isSubmitting: true, error: null });

    try {
      await notificationsService.markAsRead(ids);

      const idsSet = new Set(ids);

      set((state) => ({
        recentNotifications: markItemsAsRead(state.recentNotifications, idsSet),
        notifications: markItemsAsRead(state.notifications, idsSet),
        isSubmitting: false,
      }));

      await get().fetchUnreadCount();
    } catch (err) {
      const error = toApiError(err, "notifications.feedback.markReadError");
      set({ error, isSubmitting: false });
      throw error;
    }
  },

  markSingleAsRead: async (notificationId) => {
    await get().markAsRead([notificationId]);
  },

  markAllRecentAsRead: async () => {
    const ids = get()
      .recentNotifications.filter((item) => !item.isRead)
      .map((item) => item.id);

    await get().markAsRead(ids);
  },

  removeNotification: async (notificationId) => {
    set({ isSubmitting: true, error: null });

    try {
      await notificationsService.remove(notificationId);

      set((state) => ({
        recentNotifications: removeItem(
          state.recentNotifications,
          notificationId,
        ),
        notifications: removeItem(state.notifications, notificationId),
        isSubmitting: false,
      }));

      await get().fetchUnreadCount();
    } catch (err) {
      const error = toApiError(err, "notifications.feedback.deleteError");
      set({ error, isSubmitting: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
