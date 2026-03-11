"use client";

import { AppLayout } from "@/shared/components/layout";
import { DashboardPageContent } from "@/modules/dashboard";

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="px-4 sm:px-6 py-6">
        <DashboardPageContent />
      </div>
    </AppLayout>
  );
}
