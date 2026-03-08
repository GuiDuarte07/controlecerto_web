"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import {
  AVAILABLE_ICONS,
  DynamicIcon,
  ICON_META,
} from "@/shared/components/DynamicIcon";
import type { IconName } from "@/shared/components/DynamicIcon";
import { cn } from "@/shared/lib/utils";

interface CategoryIconPickerProps {
  open: boolean;
  value: string;
  previewColor?: string;
  onOpenChange: (open: boolean) => void;
  onSelect: (icon: IconName) => void;
}

export function CategoryIconPicker({
  open,
  value,
  previewColor = "#3B82F6",
  onOpenChange,
  onSelect,
}: CategoryIconPickerProps) {
  const t = useTranslations("categories");
  const [search, setSearch] = useState("");

  const filteredIcons = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return AVAILABLE_ICONS;

    return AVAILABLE_ICONS.filter((iconName) => {
      const keywords = ICON_META[iconName]?.keywords ?? [];
      return (
        iconName.toLowerCase().includes(term) ||
        keywords.some((kw) => kw.toLowerCase().includes(term))
      );
    });
  }, [search]);

  const handleSelect = (icon: IconName) => {
    onSelect(icon);
    onOpenChange(false);
    setSearch("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) setSearch("");
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("iconPicker.title")}</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("iconPicker.searchPlaceholder")}
            className="pl-9"
            autoFocus
          />
        </div>

        {filteredIcons.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {t("iconPicker.noResults")}
          </p>
        ) : (
          <div className="grid max-h-90 grid-cols-8 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-10">
            {filteredIcons.map((iconName) => (
              <Button
                key={iconName}
                type="button"
                variant="ghost"
                title={iconName}
                aria-label={iconName}
                onClick={() => handleSelect(iconName)}
                className={cn(
                  "h-9 w-9 p-0 transition-all",
                  value === iconName &&
                    "ring-2 ring-primary ring-offset-2",
                )}
                style={
                  value === iconName
                    ? { backgroundColor: previewColor, color: getContrastColor(previewColor) }
                    : undefined
                }
              >
                <DynamicIcon name={iconName} className="h-4 w-4" />
              </Button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function getContrastColor(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness >= 150 ? "#111111" : "#FFFFFF";
}
