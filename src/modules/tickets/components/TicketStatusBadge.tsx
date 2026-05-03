"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/shared/components/ui/badge";
import {
  resolveTicketPriorityKey,
  resolveTicketStatusKey,
  type TicketPriorityValue,
  type TicketStatusValue,
} from "../types/tickets.types";

interface TicketStatusBadgeProps {
  status: TicketStatusValue;
  priority?: TicketPriorityValue;
}

export function TicketStatusBadge({ status, priority }: TicketStatusBadgeProps) {
  const t = useTranslations("tickets");
  const statusKey = resolveTicketStatusKey(status);
  const priorityKey =
    priority === undefined ? null : resolveTicketPriorityKey(priority);

  const variant =
    statusKey === "OPEN"
      ? "secondary"
      : statusKey === "INPROGRESS"
        ? "default"
        : statusKey === "WAITINGUSER"
          ? "outline"
          : statusKey === "RESOLVED"
            ? "secondary"
            : "destructive";

  const label = t(`status.${statusKey}` as never);
  const priorityLabel =
    priorityKey === null ? null : t(`priority.${priorityKey}` as never);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant={variant}>{label}</Badge>
      {priorityLabel ? <Badge variant="outline">{priorityLabel}</Badge> : null}
    </div>
  );
}

