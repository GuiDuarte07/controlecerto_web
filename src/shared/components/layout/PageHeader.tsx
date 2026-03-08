"use client";

import React from "react";
import { Button } from "@/shared/components/ui/button";

interface PageHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  isLoading?: boolean;
}

export function PageHeader({
  title,
  description,
  actionLabel,
  onAction,
  isLoading,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 border-b bg-background">
      <div className="flex-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction} disabled={isLoading} className="w-full sm:w-auto">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
