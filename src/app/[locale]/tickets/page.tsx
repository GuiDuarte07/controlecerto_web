"use client";

import { AppLayout } from "@/shared/components/layout";
import { TicketsPageContent } from "@/modules/tickets";

export default function TicketsPage() {
  return (
    <AppLayout>
      <TicketsPageContent />
    </AppLayout>
  );
}

