import { AuthLayout, ConfirmEmailResultCard } from "@/modules/auth";

interface ConfirmEmailPageProps {
  params: Promise<{ token: string }>;
}

export default async function ConfirmEmailPage({ params }: ConfirmEmailPageProps) {
  const { token } = await params;

  return (
    <AuthLayout>
      <ConfirmEmailResultCard token={token} />
    </AuthLayout>
  );
}
