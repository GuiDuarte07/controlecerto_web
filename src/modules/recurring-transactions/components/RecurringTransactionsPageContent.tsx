"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { useLocale, useTranslations } from "next-intl";
import { Check, Clock3, Pencil, Plus, RefreshCw, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { usePageHeader } from "@/shared/hooks/use-page-header";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Empty, EmptyContent, EmptyDescription, EmptyTitle } from "@/shared/components/ui/empty";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useAccountsStore } from "@/modules/accounts/context/accountsContext";
import { useCategoriesStore } from "@/modules/categories/context/categoriesContext";
import { useRecurringTransactionsActions, useRecurringTransactionsData } from "../hooks/use-recurring-transactions";
import type { RecurringTransaction, RecurringTransactionInstance } from "../types/recurring-transactions.types";
import type { RecurringTransactionFormData } from "../schemas/recurring-transactions.schemas";
import { RecurringTransactionDialog } from "./RecurringTransactionDialog";

function toRequest(data: RecurringTransactionFormData) {
  return {
    description: data.description,
    amount: data.amount,
    destination: data.destination || undefined,
    justForRecord: data.justForRecord,
    type: data.type,
    startDate: format(data.startDate, "yyyy-MM-dd"),
    endDate: data.endDate ? format(data.endDate, "yyyy-MM-dd") : undefined,
    accountId: data.accountId,
    categoryId: data.categoryId,
    recurrenceRule: data.recurrenceRule,
  };
}

export function RecurringTransactionsPageContent() {
  const t = useTranslations("recurringTransactions");
  const locale = useLocale();
  const { transactions, pendingInstances, isLoading, isSubmitting, error, refetch } = useRecurringTransactionsData();
  const { createTransaction, updateTransaction, deleteTransaction, processInstances, clearError } = useRecurringTransactionsActions();
  const fetchAccounts = useAccountsStore((state) => state.fetchAccounts);
  const fetchExpense = useCategoriesStore((state) => state.fetchExpense);
  const fetchIncome = useCategoriesStore((state) => state.fetchIncome);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editedTransaction, setEditedTransaction] = useState<RecurringTransaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RecurringTransaction | null>(null);
  const [selectedInstanceIds, setSelectedInstanceIds] = useState<number[]>([]);
  const [rejectIds, setRejectIds] = useState<number[] | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "en-US", { day: "2-digit", month: "short", year: "numeric" }), [locale]);

  useEffect(() => {
    void fetchAccounts();
    void fetchExpense();
    void fetchIncome();
  }, [fetchAccounts, fetchExpense, fetchIncome]);

  useEffect(() => {
    if (!error) return;
    toast.error(t("feedback.errorTitle"), { description: error.message || t("feedback.loadError") });
    clearError();
  }, [clearError, error, t]);

  const handleOpenCreate = useCallback(() => {
    setEditedTransaction(null);
    setDialogOpen(true);
  }, []);

  usePageHeader({ title: t("title"), description: t("description"), actionLabel: t("actions.create"), actionIcon: Plus, onAction: handleOpenCreate });

  const describeRecurrence = (transaction: RecurringTransaction) => {
    const rule = transaction.recurrenceRule;
    const interval = rule.interval > 1 ? t("labels.everyInterval", { interval: rule.interval }) : "";
    if (rule.frequency === "DAILY") return rule.isEveryDay ? `${t("frequency.daily")} ${interval}`.trim() : `${t("frequency.daily")} · ${rule.daysOfWeek?.split("").map((day) => t(`weekdays.${day}`)).join(", ")}`;
    if (rule.frequency === "WEEKLY") return `${t("frequency.weekly")} ${interval} · ${t(`weekdays.${rule.dayOfWeek ?? 0}`)}`.trim();
    if (rule.frequency === "MONTHLY") return `${t("frequency.monthly")} ${interval} · ${rule.dayOfMonth === -1 ? t("recurrence.lastDay") : t("labels.dayOfMonth", { day: rule.dayOfMonth ?? 1 })}`.trim();
    return `${t("frequency.yearly")} ${interval} · ${t(`months.${rule.monthOfYear ?? 1}`)} ${rule.dayOfMonthForYearly}`.trim();
  };

  const handleSubmit = async (data: RecurringTransactionFormData) => {
    try {
      if (editedTransaction) await updateTransaction(editedTransaction.id, { ...toRequest(data), isActive: data.isActive });
      else await createTransaction(toRequest(data));
      toast.success(editedTransaction ? t("feedback.updateSuccess") : t("feedback.createSuccess"));
      setDialogOpen(false);
      setEditedTransaction(null);
    } catch {
      return;
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTransaction(deleteTarget.id);
      toast.success(t("feedback.deleteSuccess"));
      setDeleteTarget(null);
    } catch {
      return;
    }
  };

  const handleProcess = async (ids: number[], action: "CONFIRMED" | "REJECTED", reason?: string) => {
    if (ids.length === 0) return;
    try {
      await processInstances(ids, action, reason);
      toast.success(action === "CONFIRMED" ? t("feedback.confirmSuccess") : t("feedback.rejectSuccess"));
      setSelectedInstanceIds([]);
      setRejectIds(null);
      setRejectReason("");
    } catch {
      return;
    }
  };

  const toggleInstance = (id: number, checked: boolean) => {
    setSelectedInstanceIds((ids) => checked ? [...ids, id] : ids.filter((item) => item !== id));
  };

  const allSelected = pendingInstances.length > 0 && selectedInstanceIds.length === pendingInstances.length;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {error && <Alert variant="destructive"><AlertTitle>{t("feedback.errorTitle")}</AlertTitle><AlertDescription>{error.message}</AlertDescription></Alert>}

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardHeader className="pb-3"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><Clock3 className="h-5 w-5 text-amber-600" /><CardTitle>{t("pending.title")}</CardTitle><Badge variant="secondary">{pendingInstances.length}</Badge></div><Button type="button" size="sm" variant="ghost" onClick={() => void refetch()} disabled={isLoading}><RefreshCw className="mr-2 h-4 w-4" />{t("actions.refresh")}</Button></div><CardDescription>{t("pending.description")}</CardDescription></CardHeader>
        <CardContent>
          {isLoading ? <div className="space-y-3"><Skeleton className="h-18 w-full" /><Skeleton className="h-18 w-full" /></div> : pendingInstances.length === 0 ? <p className="text-sm text-muted-foreground">{t("pending.empty")}</p> : <div className="space-y-2">
            {pendingInstances.map((instance) => <PendingInstanceRow key={instance.id} instance={instance} isSelected={selectedInstanceIds.includes(instance.id)} isSubmitting={isSubmitting} dateFormatter={dateFormatter} onToggle={toggleInstance} onConfirm={(id) => void handleProcess([id], "CONFIRMED")} onReject={(id) => setRejectIds([id])} t={t} />)}
          </div>}
        </CardContent>
        {pendingInstances.length > 0 && <CardFooter className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-between"><label className="flex items-center gap-2 text-sm"><Checkbox checked={allSelected} onCheckedChange={(checked) => setSelectedInstanceIds(checked ? pendingInstances.map((instance) => instance.id) : [])} />{t("pending.selectAll")}</label><div className="flex w-full gap-2 sm:w-auto"><Button type="button" variant="outline" className="flex-1 sm:flex-none" disabled={isSubmitting || selectedInstanceIds.length === 0} onClick={() => setRejectIds(selectedInstanceIds)}><X className="mr-2 h-4 w-4" />{t("pending.rejectSelected")}</Button><Button type="button" className="flex-1 sm:flex-none" disabled={isSubmitting || selectedInstanceIds.length === 0} onClick={() => void handleProcess(selectedInstanceIds, "CONFIRMED")}><Check className="mr-2 h-4 w-4" />{t("pending.confirmSelected")}</Button></div></CardFooter>}
      </Card>

      <section className="space-y-4"><div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">{t("list.title")}</h2><p className="text-sm text-muted-foreground">{t("list.description")}</p></div><Button type="button" variant="outline" size="sm" onClick={() => void refetch()} disabled={isLoading}><RefreshCw className="mr-2 h-4 w-4" />{t("actions.refresh")}</Button></div>
        {isLoading ? <div className="grid gap-4 lg:grid-cols-2"><Skeleton className="h-52" /><Skeleton className="h-52" /></div> : transactions.length === 0 ? <Empty className="border"><EmptyContent><EmptyTitle>{t("list.emptyTitle")}</EmptyTitle><EmptyDescription>{t("list.emptyDescription")}</EmptyDescription><Button type="button" className="mt-3" onClick={handleOpenCreate}><Plus className="mr-2 h-4 w-4" />{t("actions.create")}</Button></EmptyContent></Empty> : <div className="grid gap-4 lg:grid-cols-2">{transactions.map((transaction) => <Card key={transaction.id}><CardHeader className="pb-3"><div className="flex gap-3"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><CardTitle className="truncate">{transaction.description}</CardTitle><Badge variant={transaction.isActive ? "default" : "secondary"}>{transaction.isActive ? t("status.active") : t("status.inactive")}</Badge></div><CardDescription>{describeRecurrence(transaction)}</CardDescription></div><span className={transaction.type === "EXPENSE" ? "font-semibold text-destructive" : "font-semibold text-emerald-600"}>{transaction.type === "EXPENSE" ? "−" : "+"}{new Intl.NumberFormat(locale === "pt" ? "pt-BR" : "en-US", { style: "currency", currency: "BRL" }).format(transaction.amount)}</span></div></CardHeader><CardContent className="grid grid-cols-2 gap-3 text-sm"><div><p className="text-muted-foreground">{t("labels.starts")}</p><p>{dateFormatter.format(new Date(`${transaction.startDate.slice(0, 10)}T12:00:00`))}</p></div><div><p className="text-muted-foreground">{t("labels.ends")}</p><p>{transaction.endDate ? dateFormatter.format(new Date(`${transaction.endDate.slice(0, 10)}T12:00:00`)) : t("labels.noEndDate")}</p></div><div><p className="text-muted-foreground">{t("labels.pending")}</p><p>{transaction.pendingInstancesCount}</p></div><div><p className="text-muted-foreground">{t("labels.confirmed")}</p><p>{transaction.confirmedInstancesCount}</p></div></CardContent><CardFooter className="justify-end gap-2"><Button type="button" size="sm" variant="outline" onClick={() => { setEditedTransaction(transaction); setDialogOpen(true); }}><Pencil className="mr-2 h-4 w-4" />{t("actions.edit")}</Button><Button type="button" size="icon" variant="ghost" className="text-destructive hover:text-destructive" aria-label={t("actions.delete")} onClick={() => setDeleteTarget(transaction)}><Trash2 className="h-4 w-4" /></Button></CardFooter></Card>)}</div>}
      </section>

      <RecurringTransactionDialog open={dialogOpen} transaction={editedTransaction} isSubmitting={isSubmitting} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditedTransaction(null); }} onSubmit={handleSubmit} />
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{t("deleteDialog.title")}</AlertDialogTitle><AlertDialogDescription>{t("deleteDialog.description", { description: deleteTarget?.description ?? "" })}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={isSubmitting}>{t("actions.cancel")}</AlertDialogCancel><AlertDialogAction disabled={isSubmitting} onClick={(event) => { event.preventDefault(); void handleDelete(); }}>{t("actions.delete")}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      <Dialog open={!!rejectIds} onOpenChange={(open) => { if (!open) { setRejectIds(null); setRejectReason(""); } }}><DialogContent><DialogHeader><DialogTitle>{t("rejectDialog.title")}</DialogTitle><DialogDescription>{t("rejectDialog.description")}</DialogDescription></DialogHeader><Input value={rejectReason} maxLength={300} onChange={(event) => setRejectReason(event.target.value)} placeholder={t("rejectDialog.placeholder")} /><DialogFooter><Button type="button" variant="ghost" onClick={() => setRejectIds(null)}>{t("actions.cancel")}</Button><Button type="button" variant="destructive" disabled={isSubmitting || !rejectIds} onClick={() => rejectIds && void handleProcess(rejectIds, "REJECTED", rejectReason || undefined)}>{t("pending.reject")}</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}

function PendingInstanceRow({ instance, isSelected, isSubmitting, dateFormatter, onToggle, onConfirm, onReject, t }: { instance: RecurringTransactionInstance; isSelected: boolean; isSubmitting: boolean; dateFormatter: Intl.DateTimeFormat; onToggle: (id: number, checked: boolean) => void; onConfirm: (id: number) => void; onReject: (id: number) => void; t: ReturnType<typeof useTranslations>; }) {
  const currencyFormatter = new Intl.NumberFormat(dateFormatter.resolvedOptions().locale, { style: "currency", currency: "BRL" });
  return <div className="flex flex-col gap-3 rounded-lg border bg-background p-3 sm:flex-row sm:items-center"><div className="flex min-w-0 flex-1 items-start gap-3"><Checkbox className="mt-1" checked={isSelected} onCheckedChange={(checked) => onToggle(instance.id, checked === true)} /><div className="min-w-0"><p className="truncate text-sm font-medium">{instance.recurringTransactionDescription}</p><p className="text-sm text-muted-foreground">{dateFormatter.format(new Date(`${instance.scheduledDate.slice(0, 10)}T12:00:00`))} · {currencyFormatter.format(instance.recurringTransactionAmount)}</p></div></div><div className="flex gap-2 sm:justify-end"><Button type="button" size="sm" variant="outline" disabled={isSubmitting} onClick={() => onReject(instance.id)}><X className="mr-1 h-4 w-4" />{t("pending.reject")}</Button><Button type="button" size="sm" disabled={isSubmitting} onClick={() => onConfirm(instance.id)}><Check className="mr-1 h-4 w-4" />{t("pending.confirm")}</Button></div></div>;
}
