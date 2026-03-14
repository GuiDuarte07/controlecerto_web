import { apiFetch } from "@/shared/lib/api-client";
import type {
  GetAllNotificationsParams,
  GetRecentNotificationsParams,
  NotificationItem,
  SendPublicNotificationRequest,
  SendUserNotificationRequest,
} from "../types/notifications.types";

function buildQuery(
  params: Record<string, string | number | boolean | undefined>,
) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }

    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

async function getRecent(
  params: GetRecentNotificationsParams = {},
): Promise<NotificationItem[]> {
  const query = buildQuery({
    isRead: params.isRead,
    maxNotifications: params.maxNotifications,
  });

  return apiFetch<NotificationItem[]>(`/api/notifications/recent${query}`, {
    method: "GET",
  });
}

async function getAll(
  params: GetAllNotificationsParams = {},
): Promise<NotificationItem[]> {
  const query = buildQuery({
    page: params.page,
    pageSize: params.pageSize,
    includeExpired: params.includeExpired,
  });

  return apiFetch<NotificationItem[]>(`/api/notifications${query}`, {
    method: "GET",
  });
}

async function markAsRead(notificationIds: number[]): Promise<void> {
  return apiFetch<void>("/api/notifications/read", {
    method: "PATCH",
    body: JSON.stringify({ notificationIds }),
  });
}

async function remove(id: number): Promise<void> {
  return apiFetch<void>(`/api/notifications/${id}`, {
    method: "DELETE",
  });
}

async function sendToUsers(
  data: SendUserNotificationRequest,
): Promise<NotificationItem[]> {
  return apiFetch<NotificationItem[]>("/api/notifications", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

async function sendToAll(data: SendPublicNotificationRequest): Promise<void> {
  return apiFetch<void>("/api/notifications/public", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export const notificationsService = {
  getRecent,
  getAll,
  markAsRead,
  remove,
  sendToUsers,
  sendToAll,
};
