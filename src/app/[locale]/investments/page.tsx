"use client";

import { AppLayout } from "@/shared/components/layout";
import { InvestmentsPageContent } from "@/modules/investments/components";

export default function InvestmentsPage() {
  return (
    <AppLayout>
      <InvestmentsPageContent />
    </AppLayout>
  );
}
