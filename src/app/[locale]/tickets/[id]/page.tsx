"use client";

import { useParams } from "next/navigation";
import { AppLayout } from "@/shared/components/layout";
import { TicketDetailPageContent } from "@/modules/tickets";

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>();
  const ticketId = Number(params.id);

  return (
    <AppLayout>
      <TicketDetailPageContent ticketId={ticketId} />
    </AppLayout>
  );
}

