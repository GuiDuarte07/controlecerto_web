"use client";

import { useEffect } from "react";
import { useNotificationsStore } from "../context/notificationsContext";

export function useNotificationBellData(autoFetch = true) {
  const recentNotifications = useNotificationsStore(
    (state) => state.recentNotifications,
  );
  const unreadCount = useNotificationsStore((state) => state.unreadCount);
  const isRecentLoading = useNotificationsStore(
    (state) => state.isRecentLoading,
  );
  const isSubmitting = useNotificationsStore((state) => state.isSubmitting);
  const error = useNotificationsStore((state) => state.error);
  const fetchRecent = useNotificationsStore((state) => state.fetchRecent);
  const fetchUnreadCount = useNotificationsStore(
    (state) => state.fetchUnreadCount,
  );
  const markSingleAsRead = useNotificationsStore(
    (state) => state.markSingleAsRead,
  );
  const markAllRecentAsRead = useNotificationsStore(
    (state) => state.markAllRecentAsRead,
  );
  const removeNotification = useNotificationsStore(
    (state) => state.removeNotification,
  );
  const clearError = useNotificationsStore((state) => state.clearError);

  useEffect(() => {
    if (!autoFetch) {
      return;
    }

    void fetchRecent();
    void fetchUnreadCount();

    const interval = window.setInterval(() => {
      void fetchUnreadCount();
    }, 60000);

    return () => {
      window.clearInterval(interval);
    };
  }, [autoFetch, fetchRecent, fetchUnreadCount]);

  return {
    recentNotifications,
    unreadCount,
    isRecentLoading,
    isSubmitting,
    error,
    refreshRecent: fetchRecent,
    refreshUnreadCount: fetchUnreadCount,
    markSingleAsRead,
    markAllRecentAsRead,
    removeNotification,
    clearError,
  };
}

export function useNotificationsPageData(autoFetch = true) {
  const notifications = useNotificationsStore((state) => state.notifications);
  const filters = useNotificationsStore((state) => state.filters);
  const isLoading = useNotificationsStore((state) => state.isLoading);
  const isSubmitting = useNotificationsStore((state) => state.isSubmitting);
  const error = useNotificationsStore((state) => state.error);
  const fetchAll = useNotificationsStore((state) => state.fetchAll);
  const setSearch = useNotificationsStore((state) => state.setSearch);
  const setPage = useNotificationsStore((state) => state.setPage);
  const setPageSize = useNotificationsStore((state) => state.setPageSize);
  const setIncludeExpired = useNotificationsStore(
    (state) => state.setIncludeExpired,
  );
  const markAsRead = useNotificationsStore((state) => state.markAsRead);
  const removeNotification = useNotificationsStore(
    (state) => state.removeNotification,
  );
  const clearError = useNotificationsStore((state) => state.clearError);

  useEffect(() => {
    if (!autoFetch) {
      return;
    }

    void fetchAll({
      page: filters.page,
      pageSize: filters.pageSize,
      includeExpired: filters.includeExpired,
    });
  }, [
    autoFetch,
    fetchAll,
    filters.page,
    filters.pageSize,
    filters.includeExpired,
  ]);

  return {
    notifications,
    filters,
    isLoading,
    isSubmitting,
    error,
    setSearch,
    setPage,
    setPageSize,
    setIncludeExpired,
    markAsRead,
    removeNotification,
    clearError,
    refetch: fetchAll,
  };
}
