"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Bell, Check, CheckCheck, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Separator } from "@/shared/components/ui/separator";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useNotificationBellData } from "../hooks/useNotifications.hooks";
import {
  resolveNotificationTypeKey,
  type NotificationTypeKey,
} from "../types/notifications.types";

const TYPE_TRANSLATION_KEY: Record<
  NotificationTypeKey,
  "systemupdate" | "systemalert" | "invoicepending" | "confirmrecurrence" | "categoryspendinglimit"
> = {
  SYSTEMUPDATE: "systemupdate",
  SYSTEMALERT: "systemalert",
  INVOICEPENDING: "invoicepending",
  CONFIRMRECURRENCE: "confirmrecurrence",
  CATEGORYSPENDINGLIMIT: "categoryspendinglimit",
};

function resolveActionPath(actionPath: string, locale: string) {
  if (actionPath.startsWith("http://") || actionPath.startsWith("https://")) {
    return actionPath;
  }

  if (actionPath.startsWith("/pt/") || actionPath.startsWith("/en/")) {
    return actionPath;
  }

  if (actionPath.startsWith("/")) {
    return `/${locale}${actionPath}`;
  }

  return `/${locale}/${actionPath}`;
}

export function NotificationBell() {
  const t = useTranslations("notifications");
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const {
    recentNotifications,
    unreadCount,
    isRecentLoading,
    isSubmitting,
    error,
    refreshRecent,
    refreshUnreadCount,
    markSingleAsRead,
    markAllRecentAsRead,
    removeNotification,
    clearError,
  } = useNotificationBellData();

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "en-US", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    [locale],
  );

  const unreadBadgeLabel = unreadCount > 99 ? "99+" : String(unreadCount);
  const hasUnread = unreadCount > 0;
  const hasUnreadInRecent = recentNotifications.some((item) => !item.isRead);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);

    if (open) {
      clearError();
      void refreshRecent();
      void refreshUnreadCount();
    }
  };

  const handleMarkSingleAsRead = async (notificationId: number) => {
    try {
      await markSingleAsRead(notificationId);
    } catch (err) {
      const message = err instanceof Error ? err.message : t("feedback.markReadError");
      toast.error(message);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllRecentAsRead();
      toast.success(t("feedback.markAllReadSuccess"));
    } catch (err) {
      const message = err instanceof Error ? err.message : t("feedback.markReadError");
      toast.error(message);
    }
  };

  const handleDelete = async (notificationId: number) => {
    try {
      await removeNotification(notificationId);
      toast.success(t("feedback.deleteSuccess"));
    } catch (err) {
      const message = err instanceof Error ? err.message : t("feedback.deleteError");
      toast.error(message);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full"
          aria-label={t("bell.ariaLabel")}
        >
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <span className="absolute -top-0.5 -right-0.5 min-w-5 rounded-full bg-destructive px-1 py-0.5 text-center text-[10px] font-semibold text-destructive-foreground">
              {unreadBadgeLabel}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-90 p-0 sm:w-105">
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-sm font-semibold">{t("bell.title")}</h3>
          <div className="flex items-center gap-2">
            {hasUnreadInRecent && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => void handleMarkAllAsRead()}
                disabled={isSubmitting}
              >
                <CheckCheck className="mr-1 h-3.5 w-3.5" />
                {t("bell.markAllRead")}
              </Button>
            )}
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
              <Link href={`/${locale}/notifications`}>{t("bell.viewAll")}</Link>
            </Button>
          </div>
        </div>

        <Separator />

        {error && (
          <div className="p-3">
            <Alert variant="destructive">
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          </div>
        )}

        <ScrollArea className="h-90">
          <div className="space-y-3 p-3">
            {isRecentLoading && (
              <>
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </>
            )}

            {!isRecentLoading && recentNotifications.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {t("bell.empty")}
              </p>
            )}

            {!isRecentLoading &&
              recentNotifications.map((notification) => {
                const typeKey = resolveNotificationTypeKey(notification.type);
                const typeLabel = t(`types.${TYPE_TRANSLATION_KEY[typeKey]}`);
                const normalizedActionPath =
                  notification.actionPath &&
                  resolveActionPath(notification.actionPath, locale);
                const isExternalAction =
                  normalizedActionPath?.startsWith("http://") ||
                  normalizedActionPath?.startsWith("https://");

                return (
                  <div
                    key={notification.id}
                    className="rounded-lg border bg-card p-3"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-tight">
                        {notification.title}
                      </p>
                      <Badge
                        variant={notification.isRead ? "secondary" : "default"}
                        className="text-[10px]"
                      >
                        {typeLabel}
                      </Badge>
                    </div>

                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {notification.message}
                    </p>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-muted-foreground">
                        {dateFormatter.format(new Date(notification.createdAt))}
                      </span>

                      <div className="flex items-center gap-1">
                        {!notification.isRead && (
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => void handleMarkSingleAsRead(notification.id)}
                            disabled={isSubmitting}
                            aria-label={t("bell.markAsRead")}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                        )}

                        {normalizedActionPath &&
                          (isExternalAction ? (
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              asChild
                              aria-label={t("bell.openAction")}
                            >
                              <a
                                href={normalizedActionPath}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              asChild
                              aria-label={t("bell.openAction")}
                            >
                              <Link href={normalizedActionPath}>
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Link>
                            </Button>
                          ))}

                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => void handleDelete(notification.id)}
                          disabled={isSubmitting}
                          aria-label={t("bell.delete")}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
