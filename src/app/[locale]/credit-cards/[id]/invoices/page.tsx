import { AppLayout } from "@/shared/components/layout";
import { InvoicePageContent } from "@/modules/credit-cards/components/InvoicePageContent";

interface InvoicesPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ year?: string; month?: string }>;
}

export default async function InvoicesPage(props: InvoicesPageProps) {
  const [params, searchParams] = await Promise.all([props.params, props.searchParams]);
  const creditCardId = Number(params.id);

  return (
    <AppLayout>
      <InvoicePageContent
        creditCardId={creditCardId}
        initialYear={Number(searchParams.year)}
        initialMonth={Number(searchParams.month)}
      />
    </AppLayout>
  );
}
