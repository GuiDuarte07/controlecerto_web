"use client";

import React from "react";
import { Bell, Plus, Search } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { usePageHeaderState } from "@/shared/hooks/use-page-header";

export function Header() {
  const {
    title,
    description,
    actionLabel,
    actionIcon,
    onAction,
    searchValue,
    searchPlaceholder,
    searchAriaLabel,
    onSearchChange,
  } = usePageHeaderState();

  const ActionIcon = actionIcon ?? Plus;
  const showAction = actionLabel && onAction;
  const showSearch = !!onSearchChange;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60 sm:ml-0">
      <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        {/* Left: Title and Description */}
        <div className="flex flex-col gap-1">
          {title && (
            <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
              {title}
            </h1>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        {/* Right: Search, Action Button and Notifications */}
        <div className="flex w-full items-center gap-2 sm:ml-auto sm:w-auto">
          {showSearch && (
            <div className="relative w-full sm:w-80">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchValue ?? ""}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchAriaLabel ?? searchPlaceholder ?? "Search"}
                className="pl-9"
              />
            </div>
          )}

          {showAction && (
            <Button onClick={onAction} className="gap-2">
              <ActionIcon className="h-4 w-4" />
              <span className="hidden sm:inline">{actionLabel}</span>
            </Button>
          )}

          <Button variant="ghost" size="icon" className="relative rounded-full">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
          </Button>
        </div>
      </div>
    </header>
  );
}
