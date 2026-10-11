"use client";

import { useTranslations } from "next-intl";
import { Progress } from "@/shared/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import type { InvestmentPerformance } from "../../types/investments.types";

interface Props {
  investments: InvestmentPerformance[];
  money: (value: number) => string;
  percent: (value: number) => string;
}

export function InvestmentPerformanceTable({ investments, money, percent }: Props) {
  const t = useTranslations("investments.analytics");
  const total = investments.reduce((sum, investment) => sum + Math.max(0, investment.endingBalance), 0);
  return <div className="overflow-x-auto"><Table><TableHeader><TableRow>
    <TableHead>{t("investment")}</TableHead><TableHead className="text-right">{t("endingBalance")}</TableHead><TableHead className="text-right">{t("contributions")}</TableHead><TableHead className="text-right">{t("earnings")}</TableHead><TableHead className="text-right">{t("returnRate")}</TableHead><TableHead className="min-w-36">{t("share")}</TableHead>
  </TableRow></TableHeader><TableBody>{investments.map(investment => {
    const share = total > 0 ? Math.max(0, investment.endingBalance) / total * 100 : 0;
    return <TableRow key={investment.id}><TableCell className="font-medium">{investment.name}</TableCell><TableCell className="text-right tabular-nums">{money(investment.endingBalance)}</TableCell><TableCell className="text-right tabular-nums">{money(investment.contributions)}</TableCell><TableCell className={`text-right tabular-nums ${investment.earnings >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>{money(investment.earnings)}</TableCell><TableCell className="text-right tabular-nums">{percent(investment.returnRate)}</TableCell><TableCell><div className="flex items-center gap-2"><Progress value={share} className="h-2" /><span className="w-10 text-right text-xs tabular-nums">{Math.round(share)}%</span></div></TableCell></TableRow>;
  })}</TableBody></Table></div>;
}
