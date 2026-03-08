"use client";

import { AppLayout } from "@/shared/components/layout";
import { TransactionsPageContent } from "@/modules/transactions";

export default function TransactionsPage() {
  return (
    <AppLayout>
      <TransactionsPageContent />
    </AppLayout>
  );
}
