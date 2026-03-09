"use client";

import { useParams } from "next/navigation";
import { AppLayout } from "@/shared/components/layout";
import { InvestmentDetailPageContent } from "@/modules/investments/components";

export default function InvestmentDetailPage() {
  const params = useParams();
  const investmentId = Number(params.id);

  return (
    <AppLayout>
      <InvestmentDetailPageContent investmentId={investmentId} />
    </AppLayout>
  );
}
