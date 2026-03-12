import { AuthLayout, ResetPasswordForm } from "@/modules/auth";

interface ForgotPasswordTokenPageProps {
  params: Promise<{ token: string }>;
}

export default async function ForgotPasswordTokenPage({
  params,
}: ForgotPasswordTokenPageProps) {
  const { token } = await params;

  return (
    <AuthLayout>
      <ResetPasswordForm token={token} />
    </AuthLayout>
  );
}
