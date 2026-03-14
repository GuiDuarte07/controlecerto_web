"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "next-intl";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

interface MonthNavigatorProps {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  isLoading?: boolean;
  prevAriaLabel?: string;
  nextAriaLabel?: string;
  date?: Date;
  onSelect?: (year: number, month: number) => void;
}
 
export function MonthNavigator({
  label,
  onPrev,
  onNext,
  hasPrev = true,
  hasNext = true,
  isLoading = false,
  prevAriaLabel,
  nextAriaLabel,
  date,
  onSelect,
}: MonthNavigatorProps) {
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState<number>(() => date?.getFullYear() ?? new Date().getFullYear());
  const [pickerMonth, setPickerMonth] = useState<number>(() => date ? date.getMonth() + 1 : new Date().getMonth() + 1);

  const monthNames = Array.from({ length: 12 }, (_, i) =>
    new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "en-US", { month: "long" }).format(
      new Date(2000, i, 1),
    ),
  );

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 16 }, (_, i) => currentYear - 10 + i);

  const handleOpenChange = (next: boolean) => {
    if (next && date) {
      setPickerYear(date.getFullYear());
      setPickerMonth(date.getMonth() + 1);
    }
    setOpen(next);
  };

  const handleApply = () => {
    onSelect?.(pickerYear, pickerMonth);
    setOpen(false);
  };

  const labelContent = isLoading ? (
    <Skeleton className="mx-auto h-5 w-32" />
  ) : (
    label
  );

  return (
    <div className="flex items-center justify-center gap-3">
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onPrev}
        disabled={!hasPrev || isLoading}
        className="h-9 w-9"
        aria-label={prevAriaLabel}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {date && onSelect ? (
        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="min-w-40 text-center text-base font-semibold hover:underline focus:outline-none capitalize"
              disabled={isLoading}
            >
              {labelContent}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4" align="center">
            <div className="flex flex-col gap-3">
              <Select
                value={String(pickerMonth)}
                onValueChange={(v) => setPickerMonth(Number(v))}
              >
                <SelectTrigger className="w-full capitalize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((name, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)} className="capitalize">
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={String(pickerYear)}
                onValueChange={(v) => setPickerYear(Number(v))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button size="sm" onClick={handleApply} className="w-full">
                OK
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        <span className="min-w-40 text-center text-base font-semibold">
          {labelContent}
        </span>
      )}

      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onNext}
        disabled={!hasNext || isLoading}
        className="h-9 w-9"
        aria-label={nextAriaLabel}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
