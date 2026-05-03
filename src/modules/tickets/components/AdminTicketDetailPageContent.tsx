"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { usePageHeader } from "@/shared/hooks/use-page-header";
import { cn } from "@/shared/lib/utils";
import { useAdminTicketDetail } from "../hooks/useAdminTickets.hooks";
import {
  resolveTicketPriorityKey,
  resolveTicketStatusKey,
  TICKET_PRIORITY_KEYS,
  TICKET_STATUS_KEYS,
} from "../types/tickets.types";
import { TicketAttachmentsList } from "./TicketAttachmentsList";
import { TicketMessageComposer } from "./TicketMessageComposer";
import { TicketRichTextViewer } from "./TicketRichTextViewer";
import { TicketStatusBadge } from "./TicketStatusBadge";

interface AdminTicketDetailPageContentProps {
  ticketId: number;
}

export function AdminTicketDetailPageContent({ ticketId }: AdminTicketDetailPageContentProps) {
  const t = useTranslations("tickets");
  const locale = useLocale();
  const { ticket, isLoading, isSubmitting, error, sendMessage, updateTicket } =
    useAdminTicketDetail(ticketId, true);

  const [nextStatus, setNextStatus] = useState<string>("");
  const [nextPriority, setNextPriority] = useState<string>("");

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

  usePageHeader({
    title: ticket ? t("admin.detailTitle", { id: String(ticket.id) }) : t("admin.title"),
    description: ticket ? ticket.subject : undefined,
  });

  if (isLoading && !ticket) {
    return (
      <div className="grid gap-4 md:grid-cols-[1fr_360px]">
        <Skeleton className="h-[520px]" />
        <Skeleton className="h-[520px]" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <Alert>
        <AlertDescription>{t("feedback.notFound")}</AlertDescription>
      </Alert>
    );
  }

  const statusKey = resolveTicketStatusKey(ticket.status);
  const priorityKey = resolveTicketPriorityKey(ticket.priority);

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_360px]">
      <Card className="min-h-[520px]">
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="truncate text-base">{ticket.subject}</CardTitle>
            <div className="mt-1 text-xs text-muted-foreground">
              {t("detail.lastUpdate", { date: ticket.updatedAt })}
            </div>
          </div>
          <TicketStatusBadge status={ticket.status} priority={ticket.priority} />
        </CardHeader>
        <CardContent className="flex min-h-0 flex-col gap-3">
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>
                {t.has(error.message) ? t(error.message as never) : error.message}
              </AlertDescription>
            </Alert>
          ) : null}

          <ScrollArea className="h-[340px] rounded-md border bg-muted/10 p-3">
            <div className="space-y-3">
              {ticket.messages.map((msg) => {
                const isAdmin =
                  typeof msg.authorRole === "string"
                    ? msg.authorRole === "ADMIN"
                    : msg.authorRole === 1;

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "rounded-lg border bg-background p-3",
                      isAdmin ? "border-primary/30" : "border-border",
                    )}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="text-xs font-medium">
                        {isAdmin ? t("detail.authorAdmin") : t("detail.authorUser")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {dateFormatter.format(new Date(msg.createdAt))}
                      </div>
                    </div>

                    <TicketRichTextViewer html={msg.body} />
                    <TicketAttachmentsList attachments={msg.attachments} className="mt-2" />
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <TicketMessageComposer
            disabled={isSubmitting || statusKey === "CLOSED"}
            onSend={async (data) => {
              await sendMessage(ticket.id, data);
            }}
          />
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("admin.controls")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="text-sm font-medium">{t("admin.status")}</div>
              <Select
                value={nextStatus || statusKey}
                onValueChange={(value) => setNextStatus(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TICKET_STATUS_KEYS.map((key) => (
                    <SelectItem key={key} value={key}>
                      {t(`status.${key}` as never)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">{t("admin.priority")}</div>
              <Select
                value={nextPriority || priorityKey}
                onValueChange={(value) => setNextPriority(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TICKET_PRIORITY_KEYS.map((key) => (
                    <SelectItem key={key} value={key}>
                      {t(`priority.${key}` as never)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="button"
              disabled={isSubmitting}
              onClick={async () => {
                try {
                  await updateTicket(ticket.id, {
                    status: (nextStatus || statusKey) as never,
                    priority: (nextPriority || priorityKey) as never,
                  });
                  toast.success(t("feedback.updated"));
                } catch {
                  toast.error(t("feedback.updateStatusError"));
                }
              }}
            >
              {t("admin.apply")}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("detail.attachments")}</CardTitle>
          </CardHeader>
          <CardContent>
            <TicketAttachmentsList attachments={ticket.attachments} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

