"use client";

import { useTranslations } from "next-intl";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/shared/components/ui/accordion";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { normalizeHexColor } from "@/shared/utils/colors";
import type { AnalyticsResult } from "../../types/analytics.types";

interface Props { result: AnalyticsResult; money: (value: number) => string }

export function AnalyticsCategories({ result, money, onCategory }: Props & { onCategory: (filter: string) => void }) {
  const t = useTranslations("transactions.analytics");
  return <Accordion type="multiple" className="w-full">{result.categories.map(category => <AccordionItem key={category.id} value={String(category.id)}>
    <AccordionTrigger className="gap-3 text-left hover:no-underline">
      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2"><span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: normalizeHexColor(category.color) }} /><span className="truncate">{category.name}</span></span>
        <span className="flex flex-wrap gap-x-5 gap-y-1 text-xs font-normal tabular-nums"><span className="text-emerald-600 dark:text-emerald-400">{t("income")}: {money(category.income)}</span><span className="text-rose-600 dark:text-rose-400">{t("expense")}: {money(category.expense)}</span></span>
      </div>
    </AccordionTrigger>
    <AccordionContent className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs text-muted-foreground">{t("categorySummary", { count: category.count, value: money(category.net) })}</p><Button size="sm" variant="outline" onClick={() => onCategory(category.filter)}>{t("explore")}</Button></div>
      <Table><TableHeader><TableRow><TableHead>{t("subcategory")}</TableHead><TableHead className="text-right">{t("income")}</TableHead><TableHead className="text-right">{t("expense")}</TableHead><TableHead className="text-right">{t("share")}</TableHead></TableRow></TableHeader>
        <TableBody>{category.children.map(child => <TableRow key={child.id}><TableCell><Button variant="link" className="h-auto p-0 text-left whitespace-normal" onClick={() => onCategory(child.filter)}>{child.id === category.id ? t("directCategory") : child.name}</Button></TableCell><TableCell className="text-right tabular-nums">{money(child.income)}</TableCell><TableCell className="text-right tabular-nums">{money(child.expense)}</TableCell><TableCell className="text-right tabular-nums">{category.expense > 0 ? `${Math.round(child.expense / category.expense * 100)}%` : t("notAvailable")}</TableCell></TableRow>)}</TableBody>
      </Table>
    </AccordionContent>
  </AccordionItem>)}</Accordion>;
}

export function AnalyticsAccounts({ result, money, onAccount }: Props & { onAccount: (id: string) => void }) {
  const t = useTranslations("transactions.analytics");
  return <div className="space-y-5">{result.accounts.map(account => <div key={account.id} className="space-y-2">
    <div className="flex flex-wrap items-center justify-between gap-2"><Button variant="link" className="h-auto p-0" onClick={() => onAccount(String(account.id))}>{account.name}</Button><span className="text-xs text-muted-foreground">{t("entries", { count: account.count })}</span></div>
    <div className="grid grid-cols-3 gap-2 text-xs"><div><p className="text-muted-foreground">{t("income")}</p><p className="break-words font-medium tabular-nums">{money(account.income)}</p></div><div><p className="text-muted-foreground">{t("expense")}</p><p className="break-words font-medium tabular-nums">{money(account.expense)}</p></div><div><p className="text-muted-foreground">{t("net")}</p><p className="break-words font-medium tabular-nums">{money(account.net)}</p></div></div>
    <Progress value={result.totals.expense > 0 ? account.expense / result.totals.expense * 100 : 0} className="h-1.5" aria-label={t("expenseShare", { name: account.name })} />
  </div>)}</div>;
}
