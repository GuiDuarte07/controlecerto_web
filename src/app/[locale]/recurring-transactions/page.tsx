"use client";

import { AppLayout } from "@/shared/components/layout";
import { RecurringTransactionsPageContent } from "@/modules/recurring-transactions";

export default function RecurringTransactionsPage() {
  return (
    <AppLayout>
      <RecurringTransactionsPageContent />
    </AppLayout>
  );
}
