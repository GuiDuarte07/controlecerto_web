"use client";

import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20 px-4">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-2">
            ControleCerto
          </h1>
          <p className="text-sm text-muted-foreground">
            Seu controle financeiro simplificado
          </p>
        </div>

        {/* Form Container */}
        {children}

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          © 2026 ControleCerto. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
