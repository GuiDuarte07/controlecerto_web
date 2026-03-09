"use client";

import { useParams } from "next/navigation";
import { AppLayout } from "@/shared/components/layout";
import { InvoicePageContent } from "@/modules/credit-cards/components/InvoicePageContent";

export default function InvoicesPage() {
  const params = useParams();
  const creditCardId = Number(params.id);

  return (
    <AppLayout>
      <InvoicePageContent creditCardId={creditCardId} />
    </AppLayout>
  );
}
