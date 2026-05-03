"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { usePageHeader } from "@/shared/hooks/use-page-header";
import { formatDateTimeByLocale } from "@/shared/utils";
import { TicketCreateDialog } from "./TicketCreateDialog";
import { TicketStatusBadge } from "./TicketStatusBadge";
import { useTicketsList } from "../hooks/useTickets.hooks";
import { useTicketsStore } from "../context/ticketsContext";
import { resolveTicketStatusKey, TICKET_STATUS_KEYS } from "../types/tickets.types";

export function TicketsPageContent() {
  const t = useTranslations("tickets");
  const locale = useLocale();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const isSubmitting = useTicketsStore((s) => s.isSubmitting);
  const createTicket = useTicketsStore((s) => s.createTicket);

  const { tickets, filters, isLoading, setSearch, setStatus } = useTicketsList(true);

  usePageHeader({
    title: t("title"),
    description: t("description"),
    actionLabel: t("create.newTicket"),
    actionIcon: Plus,
    onAction: () => setIsCreateDialogOpen(true),
  });

  return (
    <div className="grid gap-4 md:grid-cols-[320px_1fr]">
      <TicketCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        showTrigger={false}
        disabled={isSubmitting}
        onCreate={async (data) => {
          const detail = await createTicket(data);
          toast.success(t("feedback.created"));
          window.location.assign(`/${locale}/tickets/${detail.id}`);
        }}
      />
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
            {tickets.map((ticket) => {
              const statusKey = resolveTicketStatusKey(ticket.status);
              return (
                <Link
                  key={ticket.id}
                  href={`/${locale}/tickets/${ticket.id}`}
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
                      {statusKey === "WAITINGUSER" ? (
                        <div className="text-xs text-amber-600 dark:text-amber-400">
                          {t("list.waitingYou")}
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

