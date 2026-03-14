export const NOTIFICATION_TYPE_KEYS = [
  "SYSTEMUPDATE",
  "SYSTEMALERT",
  "INVOICEPENDING",
  "CONFIRMRECURRENCE",
  "CATEGORYSPENDINGLIMIT",
] as const;

export type NotificationTypeKey = (typeof NOTIFICATION_TYPE_KEYS)[number];

export type NotificationTypeValue = NotificationTypeKey | number;

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: NotificationTypeValue;
  actionPath: string | null;
  isRead: boolean;
  createdAt: string;
  expiresAt: string;
}

export interface GetRecentNotificationsParams {
  isRead?: boolean;
  maxNotifications?: number;
}

export interface GetAllNotificationsParams {
  page?: number;
  pageSize?: number;
  includeExpired?: boolean;
}

export interface SendUserNotificationRequest {
  title: string;
  message: string;
  type: NotificationTypeKey | number;
  actionPath?: string;
  expiresAt?: string;
  userId?: number;
  userIds?: number[];
}

export interface SendPublicNotificationRequest {
  title: string;
  message: string;
  type: NotificationTypeKey | number;
  actionPath?: string;
  expiresAt?: string;
}

export function resolveNotificationTypeKey(
  value: NotificationTypeValue,
): NotificationTypeKey {
  if (
    typeof value === "string" &&
    (NOTIFICATION_TYPE_KEYS as readonly string[]).includes(value)
  ) {
    return value as NotificationTypeKey;
  }

  if (
    typeof value === "number" &&
    value >= 0 &&
    value < NOTIFICATION_TYPE_KEYS.length
  ) {
    return NOTIFICATION_TYPE_KEYS[value];
  }

  return "SYSTEMUPDATE";
}
