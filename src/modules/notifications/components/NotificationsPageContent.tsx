"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  AlertCircle,
  Check,
  CheckCheck,
  ExternalLink,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { usePageHeader } from "@/shared/hooks/use-page-header";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyTitle } from "@/shared/components/ui/empty";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Switch } from "@/shared/components/ui/switch";
import { useNotificationsPageData } from "../hooks/useNotifications.hooks";
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

export function NotificationsPageContent() {
  const t = useTranslations("notifications");
  const locale = useLocale();
  const {
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
    refetch,
  } = useNotificationsPageData();

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    [locale],
  );

  usePageHeader({
    title: t("title"),
    description: t("description"),
    searchValue: filters.search,
    searchPlaceholder: t("searchPlaceholder"),
    searchAriaLabel: t("searchPlaceholder"),
    onSearchChange: setSearch,
  });

  const filteredNotifications = useMemo(() => {
    const normalizedSearch = filters.search.trim().toLowerCase();

    if (!normalizedSearch) {
      return notifications;
    }

    return notifications.filter((notification) => {
      const typeKey = resolveNotificationTypeKey(notification.type);
      const typeLabel = t(`types.${TYPE_TRANSLATION_KEY[typeKey]}`).toLowerCase();

      return (
        notification.title.toLowerCase().includes(normalizedSearch) ||
        notification.message.toLowerCase().includes(normalizedSearch) ||
        typeLabel.includes(normalizedSearch)
      );
    });
  }, [filters.search, notifications, t]);

  const unreadVisibleIds = filteredNotifications
    .filter((notification) => !notification.isRead)
    .map((notification) => notification.id);

  const canGoNext = notifications.length >= filters.pageSize;
  const canGoPrev = filters.page > 1;

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead([id]);
    } catch (err) {
      const message = err instanceof Error ? err.message : t("feedback.markReadError");
      toast.error(message);
    }
  };

  const handleMarkVisibleAsRead = async () => {
    try {
      await markAsRead(unreadVisibleIds);
      toast.success(t("feedback.markVisibleReadSuccess"));
    } catch (err) {
      const message = err instanceof Error ? err.message : t("feedback.markReadError");
      toast.error(message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await removeNotification(id);
      toast.success(t("feedback.deleteSuccess"));
    } catch (err) {
      const message = err instanceof Error ? err.message : t("feedback.deleteError");
      toast.error(message);
    }
  };

  return (
    <section className="flex flex-col gap-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("feedback.errorTitle")}</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">{t("filters.title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Switch
              checked={filters.includeExpired}
              onCheckedChange={setIncludeExpired}
              id="notifications-include-expired"
            />
            <label
              htmlFor="notifications-include-expired"
              className="text-sm text-muted-foreground"
            >
              {t("filters.includeExpired")}
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={String(filters.pageSize)}
              onValueChange={(value) => setPageSize(Number(value))}
            >
              <SelectTrigger className="h-9 w-22.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => void handleMarkVisibleAsRead()}
              disabled={isSubmitting || unreadVisibleIds.length === 0}
            >
              <CheckCheck className="h-4 w-4" />
              {t("actions.markVisibleRead")}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                clearError();
                void refetch();
              }}
            >
              <RefreshCw className="h-4 w-4" />
              {t("actions.refresh")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <Empty>
          <EmptyContent>
            <EmptyTitle>{t("empty.title")}</EmptyTitle>
            <EmptyDescription>{t("empty.description")}</EmptyDescription>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => {
            const typeKey = resolveNotificationTypeKey(notification.type);
            const typeLabel = t(`types.${TYPE_TRANSLATION_KEY[typeKey]}`);
            const normalizedActionPath =
              notification.actionPath &&
              resolveActionPath(notification.actionPath, locale);
            const isExternalAction =
              normalizedActionPath?.startsWith("http://") ||
              normalizedActionPath?.startsWith("https://");

            return (
              <Card key={notification.id}>
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold leading-tight">
                        {notification.title}
                      </p>
                      <Badge variant={notification.isRead ? "secondary" : "default"}>
                        {typeLabel}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>{dateFormatter.format(new Date(notification.createdAt))}</span>
                      {!notification.isRead && <span>{t("labels.unread")}</span>}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {!notification.isRead && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => void handleMarkAsRead(notification.id)}
                        disabled={isSubmitting}
                        aria-label={t("actions.markRead")}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}

                    {normalizedActionPath &&
                      (isExternalAction ? (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          asChild
                          aria-label={t("actions.openAction")}
                        >
                          <a
                            href={normalizedActionPath}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          asChild
                          aria-label={t("actions.openAction")}
                        >
                          <Link href={normalizedActionPath}>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      ))}

                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => void handleDelete(notification.id)}
                      disabled={isSubmitting}
                      aria-label={t("actions.delete")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {t("pagination.page", { page: filters.page })}
        </p>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage(filters.page - 1)}
            disabled={!canGoPrev || isLoading}
          >
            {t("pagination.previous")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage(filters.page + 1)}
            disabled={!canGoNext || isLoading}
          >
            {t("pagination.next")}
          </Button>
        </div>
      </div>
    </section>
  );
}
