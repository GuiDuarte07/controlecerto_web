"use client";

import { useLocale } from "next-intl";
import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/shared/lib/utils";

interface CurrencyInputProps {
  value?: number;
  onChange: (value: number | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

const MAX_CENTS = 99999999; // R$ 999.999,99

function formatCents(cents: number, isPtBR: boolean): string {
  return new Intl.NumberFormat(isPtBR ? "pt-BR" : "en-US", {
    style: "currency",
    currency: isPtBR ? "BRL" : "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function CurrencyInput({
  value,
  onChange,
  placeholder,
  disabled,
  className,
  id,
}: CurrencyInputProps) {
  const locale = useLocale();
  const isPtBR = locale === "pt";
  const isOwnChange = useRef(false);

  const [cents, setCents] = useState<number>(() =>
    value !== undefined ? Math.round(value * 100) : 0
  );

  // Sync when external value changes (e.g. form reset or initialData)
  useEffect(() => {
    if (isOwnChange.current) {
      isOwnChange.current = false;
      return;
    }
    setCents(value !== undefined ? Math.round(value * 100) : 0);
  }, [value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key >= "0" && e.key <= "9") {
        e.preventDefault();
        if (cents >= MAX_CENTS) return;
        const next = Math.min(cents * 10 + parseInt(e.key, 10), MAX_CENTS);
        isOwnChange.current = true;
        setCents(next);
        onChange(next / 100);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        const next = Math.floor(cents / 10);
        isOwnChange.current = true;
        setCents(next);
        onChange(next > 0 ? next / 100 : undefined);
      } else if (e.key === "Delete") {
        e.preventDefault();
        isOwnChange.current = true;
        setCents(0);
        onChange(undefined);
      }
    },
    [cents, onChange],
  );

  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      value={cents > 0 ? formatCents(cents, isPtBR) : ""}
      placeholder={placeholder ?? (isPtBR ? "R$ 0,00" : "$ 0.00")}
      disabled={disabled}
      onKeyDown={handleKeyDown}
      onChange={() => {}}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors",
        "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    />
  );
}
