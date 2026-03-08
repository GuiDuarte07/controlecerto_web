"use client";

import React from "react";
import { Sidebar, Header } from "@/shared/components/layout";
import { useProtectedRoute } from "@/modules/auth";
import { Spinner } from "@/shared/components/ui/spinner";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isProtected, isLoading } = useProtectedRoute();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!isProtected) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col sm:flex-row">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden sm:ml-0 pt-16 sm:pt-0">
        <Header />
        <main className="flex-1 overflow-auto bg-background sm:p-6 p-1">
          {children}
        </main>
      </div>
    </div>
  );
}
