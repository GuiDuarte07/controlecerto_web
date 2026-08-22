"use client";

import { useLocale } from "next-intl";
import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/shared/lib/utils";
import {
  centsToDigits,
  countDigits,
  digitsToCents,
  MAX_CENTS,
  parsePastedCurrencyToCents,
} from "./currency-input.utils";

interface CurrencyInputProps {
  value?: number;
  onChange: (value: number | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

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
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [cents, setCents] = useState<number>(() =>
    value !== undefined ? Math.round(value * 100) : 0
  );

  // Sync when external value changes (e.g. form reset or initialData)
  useEffect(() => {
    if (isOwnChange.current) {
      isOwnChange.current = false;
      return;
    }
    // Sync controlled form resets/initial values from React Hook Form.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCents(value !== undefined ? Math.round(value * 100) : 0);
  }, [value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key >= "0" && e.key <= "9") {
        e.preventDefault();
        const input = inputRef.current;
        const currentText = input?.value ?? "";
        const selectionStart = input?.selectionStart ?? null;
        const selectionEnd = input?.selectionEnd ?? null;

        const hasSelection =
          selectionStart !== null &&
          selectionEnd !== null &&
          selectionEnd > selectionStart;

        if (!hasSelection && cents >= MAX_CENTS) return;

        let nextCents: number;

        if (hasSelection && currentText.length > 0) {
          const digits = centsToDigits(cents);
          const digitStart = countDigits(currentText.slice(0, selectionStart!));
          const digitEnd = countDigits(currentText.slice(0, selectionEnd!));
          const nextDigits = `${digits.slice(0, digitStart)}${e.key}${digits.slice(digitEnd)}`;
          nextCents = Math.min(digitsToCents(nextDigits), MAX_CENTS);
        } else {
          nextCents = Math.min(cents * 10 + parseInt(e.key, 10), MAX_CENTS);
        }

        isOwnChange.current = true;
        setCents(nextCents);
        onChange(nextCents / 100);

        requestAnimationFrame(() => {
          const el = inputRef.current;
          if (!el) return;
          const end = el.value.length;
          el.setSelectionRange(end, end);
        });
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

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();

      const pastedText = e.clipboardData.getData("text");
      const nextCents = parsePastedCurrencyToCents(pastedText);

      if (nextCents === undefined) return;

      isOwnChange.current = true;
      setCents(nextCents);
      onChange(nextCents > 0 ? nextCents / 100 : undefined);

      requestAnimationFrame(() => {
        const el = inputRef.current;
        if (!el) return;
        const end = el.value.length;
        el.setSelectionRange(end, end);
      });
    },
    [onChange],
  );

  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      ref={inputRef}
      value={cents > 0 ? formatCents(cents, isPtBR) : ""}
      placeholder={placeholder ?? (isPtBR ? "R$ 0,00" : "$ 0.00")}
      disabled={disabled}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
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
