"use client";

import { useMemo, useRef, useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Input } from "@/shared/components/ui/input";
import { DynamicIcon } from "./DynamicIcon";
import type { IconName } from "./DynamicIcon";
import { cn } from "@/shared/lib/utils";
import { getContrastTextColor } from "@/shared/utils";

export interface SearchableItem {
  id: number | string;
  label: string;
  color?: string;
  iconName?: string;
}

interface SearchableItemSelectProps {
  items: SearchableItem[];
  value: number | string | null | undefined;
  onChange: (value: number | string | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  clearLabel?: string;
  disabled?: boolean;
  className?: string;
}

function ItemPreview({ item }: { item: SearchableItem }) {
  return (
    <div className="flex items-center gap-2">
      {item.color && (
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
          style={{ backgroundColor: item.color }}
        >
          {item.iconName && (
            <DynamicIcon
              name={item.iconName as IconName}
              className="h-3.5 w-3.5"
              style={{ color: getContrastTextColor(item.color) }}
            />
          )}
        </span>
      )}
      <span className="truncate text-sm">{item.label}</span>
    </div>
  );
}

export function SearchableItemSelect({
  items,
  value,
  onChange,
  placeholder = "Selecionar...",
  searchPlaceholder = "Pesquisar...",
  clearLabel = "Nenhum",
  disabled = false,
  className,
}: SearchableItemSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === value) ?? null,
    [items, value],
  );

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) => item.label.toLowerCase().includes(term));
  }, [items, search]);

  const handleSelect = (id: number | string | null) => {
    onChange(id);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (isOpen) {
          setTimeout(() => searchRef.current?.focus(), 50);
        } else {
          setSearch("");
        }
      }}
    >
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal", className)}
        >
          {selectedItem ? (
            <ItemPreview item={selectedItem} />
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0"
        align="start"
        sideOffset={4}
      >
        <div className="border-b p-2">
          <Input
            ref={searchRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-8 border-0 bg-transparent p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        <div className="max-h-60 overflow-y-auto p-1">
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent"
            onClick={() => handleSelect(null)}
          >
            <X className="h-3.5 w-3.5" />
            {clearLabel}
          </button>

          {filteredItems.length === 0 && (
            <p className="px-2 py-4 text-center text-xs text-muted-foreground">
              Nenhum resultado
            </p>
          )}

          {filteredItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 hover:bg-accent"
              onClick={() => handleSelect(item.id)}
            >
              <ItemPreview item={item} />
              {value === item.id && (
                <Check className="ml-2 h-4 w-4 shrink-0 text-primary" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
