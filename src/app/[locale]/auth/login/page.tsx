"use client";

import { useRouter, useParams } from "next/navigation";
import { AuthLayout, LoginForm, useRedirectIfAuthenticated } from "@/modules/auth";
import { Spinner } from "@/shared/components/ui/spinner";

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { isLoading } = useRedirectIfAuthenticated(`/${locale}`);

  if (isLoading) {
    return (
      <AuthLayout>
        <div className="flex items-center justify-center py-16">
          <Spinner className="h-6 w-6" />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <LoginForm
        onSuccess={() => router.push(`/${locale}`)}
      />
    </AuthLayout>
  );
}
