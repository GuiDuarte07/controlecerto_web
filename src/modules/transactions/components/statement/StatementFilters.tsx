"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { SearchableItemSelect } from "@/shared/components/SearchableItemSelect";
import { useAccountsStore } from "@/modules/accounts/context/accountsContext";
import { useCreditCardsStore } from "@/modules/credit-cards/context/creditCardsContext";
import { useCategoriesStore } from "@/modules/categories/context/categoriesContext";
import { toAccountSearchableItem } from "@/modules/accounts";
import type { SearchableItem } from "@/shared/components/SearchableItemSelect";
import { DatePickerInput } from "../forms/DatePickerInput";
import type { TransactionFilters } from "../../types/transactions.types";
import { useIsMobile } from "@/shared/hooks/use-mobile";

interface StatementFiltersProps {
  filters: TransactionFilters;
  dateStart?: Date;
  dateEnd?: Date;
  showDateRange?: boolean;
  onFiltersChange: (filters: TransactionFilters) => void;
  onDateStartChange: (date: Date | undefined) => void;
  onDateEndChange: (date: Date | undefined) => void;
  onApply: () => void;
  onClear: () => void;
}

function FilterPanelContent({
  filters,
  dateStart,
  dateEnd,
  showDateRange = true,
  onFiltersChange,
  onDateStartChange,
  onDateEndChange,
  onApply,
  onClear,
}: StatementFiltersProps & { showDateRange?: boolean }) {
  const t = useTranslations("transactions");
  const accounts = useAccountsStore((s) => s.accounts);
  const creditCards = useCreditCardsStore((s) => s.creditCards);
  const expenseCategories = useCategoriesStore((s) => s.expenseCategories);
  const incomeCategories = useCategoriesStore((s) => s.incomeCategories);

  const accountOptions: SearchableItem[] = accounts.map(toAccountSearchableItem);
  const cardOptions: SearchableItem[] = creditCards.map((c) => ({
    id: c.id,
    label: c.description || c.account.bank,
    color: c.account.color,
  }));
  const categoryOptions: SearchableItem[] = [
    ...expenseCategories.flatMap((p) => [
      { id: p.id, label: p.name, color: p.color, iconName: p.icon },
      ...p.subCategories.map((s) => ({ id: s.id, label: s.name, color: s.color, iconName: s.icon })),
    ]),
    ...incomeCategories.flatMap((p) => [
      { id: p.id, label: p.name, color: p.color, iconName: p.icon },
      ...p.subCategories.map((s) => ({ id: s.id, label: s.name, color: s.color, iconName: s.icon })),
    ]),
  ];

  const handleAccountChange = (id: number | string | null) => {
    onFiltersChange({
      ...filters,
      accountId: id ? Number(id) : undefined,
      cardId: id ? undefined : filters.cardId,
    });
  };

  const handleCardChange = (id: number | string | null) => {
    onFiltersChange({
      ...filters,
      cardId: id ? Number(id) : undefined,
      accountId: id ? undefined : filters.accountId,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {showDateRange && (
        <>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium">{t("filters.startDate")}</Label>
            <DatePickerInput value={dateStart} onChange={onDateStartChange} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium">{t("filters.endDate")}</Label>
            <DatePickerInput value={dateEnd} onChange={onDateEndChange} />
          </div>
        </>
      )}

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-medium">{t("filters.account")}</Label>
        <SearchableItemSelect
          items={accountOptions}
          value={filters.accountId ?? null}
          onChange={handleAccountChange}
          disabled={!!filters.cardId}
          placeholder={t("filters.account")}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-medium">{t("statement.filters.card")}</Label>
        <SearchableItemSelect
          items={cardOptions}
          value={filters.cardId ?? null}
          onChange={handleCardChange}
          disabled={!!filters.accountId}
          placeholder={t("statement.filters.card")}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-medium">{t("filters.category")}</Label>
        <SearchableItemSelect
          items={categoryOptions}
          value={filters.categoryId ?? null}
          onChange={(id) => onFiltersChange({ ...filters, categoryId: id ? Number(id) : undefined })}
          placeholder={t("filters.category")}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-medium">{t("statement.filters.sort")}</Label>
        <Select
          value={filters.sort ?? "date desc"}
          onValueChange={(v) => onFiltersChange({ ...filters, sort: v })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date desc">{t("statement.filters.sortDateDesc")}</SelectItem>
            <SelectItem value="date asc">{t("statement.filters.sortDateAsc")}</SelectItem>
            <SelectItem value="amount desc">{t("statement.filters.sortAmountDesc")}</SelectItem>
            <SelectItem value="amount asc">{t("statement.filters.sortAmountAsc")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onClear} size="sm" className="flex-1">
          <X className="mr-1 h-3.5 w-3.5" />
          {t("statement.clearFilters")}
        </Button>
        <Button type="button" onClick={onApply} size="sm" className="flex-1">
          {t("statement.applyFilters")}
        </Button>
      </div>
    </div>
  );
}

export function StatementFilters(props: StatementFiltersProps) {
  const t = useTranslations("transactions");
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const activeCount = [
    props.filters.accountId,
    props.filters.cardId,
    props.filters.categoryId,
  ].filter(Boolean).length + (props.showDateRange !== false && (props.dateStart || props.dateEnd) ? 1 : 0);

  const handleApply = () => {
    props.onApply();
    setOpen(false);
  };

  const triggerButton = (
    <Button variant="outline" size="sm" className="gap-2 h-9">
      <SlidersHorizontal className="h-4 w-4" />
      <span className="hidden sm:inline">{t("statement.filtersLabel")}</span>
      {activeCount > 0 && (
        <Badge variant="secondary" className="h-4 min-w-4 px-1 text-xs leading-none">
          {activeCount}
        </Badge>
      )}
    </Button>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{triggerButton}</SheetTrigger>
        <SheetContent side="bottom" className="h-auto max-h-[85dvh] overflow-y-auto pb-safe">
          <SheetHeader>
            <SheetTitle>{t("statement.filtersLabel")}</SheetTitle>
          </SheetHeader>
          <div className="px-1 py-4">
            <FilterPanelContent {...props} onApply={handleApply} />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <h3 className="mb-3 text-sm font-semibold">{t("statement.filtersLabel")}</h3>
        <FilterPanelContent {...props} onApply={handleApply} />
      </PopoverContent>
    </Popover>
  );
}
