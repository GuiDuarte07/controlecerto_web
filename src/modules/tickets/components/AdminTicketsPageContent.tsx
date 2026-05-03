"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { usePageHeader } from "@/shared/hooks/use-page-header";
import { formatDateTimeByLocale } from "@/shared/utils";
import { TicketStatusBadge } from "./TicketStatusBadge";
import { useAdminTicketsList } from "../hooks/useAdminTickets.hooks";
import { TICKET_STATUS_KEYS } from "../types/tickets.types";

export function AdminTicketsPageContent() {
  const t = useTranslations("tickets");
  const locale = useLocale();
  const { tickets, filters, isLoading, setSearch, setStatus } =
    useAdminTicketsList(true);

  usePageHeader({
    title: t("admin.title"),
    description: t("admin.description"),
  });

  return (
    <div className="grid gap-4 md:grid-cols-[320px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("filters.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={filters.search}
            placeholder={t("filters.searchPlaceholder")}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            value={filters.status}
            onValueChange={(value) => {
              if (value === "ALL") {
                setStatus("ALL");
                return;
              }
              if ((TICKET_STATUS_KEYS as readonly string[]).includes(value)) {
                setStatus(value as never);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("filters.statusPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("filters.all")}</SelectItem>
              {TICKET_STATUS_KEYS.map((key) => (
                <SelectItem key={key} value={key}>
                  {t(`status.${key}` as never)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : (
          <div className="space-y-2">
            {tickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/${locale}/admin/tickets/${ticket.id}`}
                className="block"
              >
                <Card className="transition-colors hover:bg-muted/30">
                  <CardContent className="flex flex-col gap-2 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">
                          {ticket.subject}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t("list.updatedAt", {
                            date: formatDateTimeByLocale(ticket.updatedAt, locale),
                          })}
                        </div>
                      </div>
                      <TicketStatusBadge
                        status={ticket.status}
                        priority={ticket.priority}
                      />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

