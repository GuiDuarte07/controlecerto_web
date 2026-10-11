"use client";

import { useTranslations } from "next-intl";
import { ArrowDown, ArrowUp, RotateCcw, SlidersHorizontal } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { Separator } from "@/shared/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/shared/components/ui/sheet";
import { useAnalyticsStore } from "../../context/analyticsContext";
import type { AnalyticsPreferences } from "../../types/analytics.types";
import { AnalyticsSelect } from "./AnalyticsSelect";

export function AnalyticsSettings() {
  const t = useTranslations("transactions.analytics");
  const preferences = useAnalyticsStore(s => s.preferences);
  const setPreferences = useAnalyticsStore(s => s.setPreferences);
  const toggleWidget = useAnalyticsStore(s => s.toggleWidget);
  const moveWidget = useAnalyticsStore(s => s.moveWidget);
  const reset = useAnalyticsStore(s => s.resetPreferences);
  return <Sheet><SheetTrigger asChild><Button variant="outline"><SlidersHorizontal className="size-4" />{t("customize")}</Button></SheetTrigger>
    <SheetContent className="w-full overflow-y-auto sm:max-w-md">
      <SheetHeader><SheetTitle>{t("customize")}</SheetTitle><SheetDescription>{t("customizeDescription")}</SheetDescription></SheetHeader>
      <div className="space-y-5 px-4 pb-6">
        <div className="space-y-2"><Label htmlFor="analytics-granularity">{t("granularity")}</Label><AnalyticsSelect id="analytics-granularity" label={t("granularity")} value={preferences.granularity} onChange={v => setPreferences({ granularity: v as AnalyticsPreferences["granularity"] })} options={["day", "week", "month"].map(value => ({ value, label: t(`granularities.${value}`) }))} /></div>
        <div className="space-y-2"><Label htmlFor="analytics-chart">{t("chartType")}</Label><AnalyticsSelect id="analytics-chart" label={t("chartType")} value={preferences.chartType} onChange={v => setPreferences({ chartType: v as AnalyticsPreferences["chartType"] })} options={["area", "line", "bar"].map(value => ({ value, label: t(`chartTypes.${value}`) }))} /></div>
        <div className="space-y-2"><Label htmlFor="analytics-level">{t("categoryLevel")}</Label><AnalyticsSelect id="analytics-level" label={t("categoryLevel")} value={preferences.categoryLevel} onChange={v => setPreferences({ categoryLevel: v as AnalyticsPreferences["categoryLevel"] })} options={["parent", "subcategory"].map(value => ({ value, label: t(`levels.${value}`) }))} /></div>
        <div className="space-y-2"><Label htmlFor="analytics-metric">{t("distributionMetric")}</Label><AnalyticsSelect id="analytics-metric" label={t("distributionMetric")} value={preferences.distributionMetric} onChange={v => setPreferences({ distributionMetric: v as AnalyticsPreferences["distributionMetric"] })} options={["expense", "income"].map(value => ({ value, label: t(value) }))} /></div>
        <div className="space-y-2"><Label htmlFor="analytics-top">{t("topCount")}</Label><AnalyticsSelect id="analytics-top" label={t("topCount")} value={String(preferences.topCount)} onChange={v => setPreferences({ topCount: Number(v) })} options={[5, 6, 10, 15].map(v => ({ value: String(v), label: String(v) }))} /></div>
        {(["cumulative", "compare"] as const).map(key => <div key={key} className="flex items-center justify-between gap-4"><Label htmlFor={`analytics-${key}`}>{t(key)}</Label><Switch id={`analytics-${key}`} checked={preferences[key]} onCheckedChange={value => setPreferences({ [key]: value })} /></div>)}
        <Separator />
        <p className="text-sm font-medium">{t("visibleWidgets")}</p>
        {preferences.widgets.map((widget, index) => <div key={widget} className="flex items-center gap-2">
          <Switch id={`widget-${widget}`} checked={!preferences.hidden.includes(widget)} onCheckedChange={() => toggleWidget(widget)} />
          <Label htmlFor={`widget-${widget}`} className="flex-1">{t(`widgets.${widget}`)}</Label>
          <Button variant="ghost" size="icon" disabled={index === 0} aria-label={t("moveUp", { name: t(`widgets.${widget}`) })} onClick={() => moveWidget(widget, -1)}><ArrowUp className="size-4" /></Button>
          <Button variant="ghost" size="icon" disabled={index === preferences.widgets.length - 1} aria-label={t("moveDown", { name: t(`widgets.${widget}`) })} onClick={() => moveWidget(widget, 1)}><ArrowDown className="size-4" /></Button>
        </div>)}
        <Button variant="outline" className="w-full" onClick={reset}><RotateCcw className="size-4" />{t("resetLayout")}</Button>
      </div>
    </SheetContent>
  </Sheet>;
}
