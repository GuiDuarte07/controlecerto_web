"use client";

import { useMemo } from "react";
import type { ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { CalendarDays, FileText, FolderSearch, Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Spinner } from "@/shared/components/ui/spinner";
import { searchPeriodSchema, type SearchPeriodFormData } from "../schemas/notes.schemas";
import type { Note } from "../types/notes.types";

interface NotesListProps {
  monthNotes: Note[];
  generalNotes: Note[];
  periodSearchNotes: Note[];
  periodSearchYear: number | null;
  periodSearchMonth: number | null;
  isLoading: boolean;
  isSearchingPeriod: boolean;
  onSearch: (year: number, month: number) => Promise<void>;
  onClearSearch: () => void;
  onCreate: () => void;
  onOpenNote: (noteId: number) => void;
}

function stripHtml(raw: string): string {
  return raw.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function getSearchDefaults() {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
}

interface NoteCardProps {
  note: Note;
  onOpen: (id: number) => void;
  locale: string;
}

function NoteCard({ note, onOpen, locale }: NoteCardProps) {
  const t = useTranslations("notes");

  const preview = stripHtml(note.content);
  const updatedAt = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(note.updatedAt));

  return (
    <button
      type="button"
      className="w-full rounded-md border bg-card p-3 text-left transition-colors hover:bg-muted/50"
      onClick={() => onOpen(note.id)}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="line-clamp-1 text-sm font-medium">{note.title}</p>
        <span className="shrink-0 text-xs text-muted-foreground">{updatedAt}</span>
      </div>
      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
        {preview || t("list.emptyContent")}
      </p>
    </button>
  );
}

function Section({
  icon,
  title,
  emptyText,
  notes,
  locale,
  onOpenNote,
}: {
  icon: ReactNode;
  title: string;
  emptyText: string;
  notes: Note[];
  locale: string;
  onOpenNote: (noteId: number) => void;
}) {
  return (
    <section className="space-y-2 rounded-md border p-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        {icon}
        <span>{title}</span>
      </div>
      {notes.length === 0 ? (
        <p className="text-xs text-muted-foreground">{emptyText}</p>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} onOpen={onOpenNote} locale={locale} />
          ))}
        </div>
      )}
    </section>
  );
}

export function NotesList({
  monthNotes,
  generalNotes,
  periodSearchNotes,
  periodSearchYear,
  periodSearchMonth,
  isLoading,
  isSearchingPeriod,
  onSearch,
  onClearSearch,
  onCreate,
  onOpenNote,
}: NotesListProps) {
  const t = useTranslations("notes");
  const locale = useLocale();

  const form = (useForm<SearchPeriodFormData>({
    // @ts-ignore - Temporary Zod v4 resolver typing mismatch
    resolver: zodResolver(searchPeriodSchema),
    defaultValues: getSearchDefaults(),
  }) as unknown) as UseFormReturn<SearchPeriodFormData>;

  const now = useMemo(() => new Date(), []);

  const yearOptions = useMemo(() => {
    const currentYear = now.getFullYear();
    return Array.from({ length: 11 }, (_, index) => currentYear - 5 + index);
  }, [now]);

  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, index) => {
      const value = index + 1;
      return {
        value,
        label: new Intl.DateTimeFormat(locale, { month: "long" }).format(
          new Date(2000, index, 1),
        ),
      };
    });
  }, [locale]);

  const onSubmit = form.handleSubmit(async (data) => {
    await onSearch(data.year, data.month);
  });

  const resolveFormMessage = (message?: string) => {
    if (!message) return "";
    return t.has(message) ? t(message as never) : message;
  };

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[280px] items-center justify-center">
        <Spinner className="h-5 w-5" />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 p-3 md:p-4">
      <div className="flex items-center justify-end">
        <Button type="button" onClick={onCreate}>
          <Plus className="h-4 w-4" />
          {t("actions.new")}
        </Button>
      </div>

      <div className="rounded-md border p-3">
        <Form {...form}>
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto_auto] md:items-end">
            <FormField
              control={form.control}
              name="month"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("search.monthLabel")}</FormLabel>
                  <Select
                    value={String(field.value ?? "")}
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t("search.monthPlaceholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {monthOptions.map((item) => (
                        <SelectItem key={item.value} value={String(item.value)}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage>
                    {resolveFormMessage(fieldState.error?.message)}
                  </FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="year"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("search.yearLabel")}</FormLabel>
                  <Select
                    value={String(field.value ?? "")}
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t("search.yearPlaceholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {yearOptions.map((item) => (
                        <SelectItem key={item} value={String(item)}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage>
                    {resolveFormMessage(fieldState.error?.message)}
                  </FormMessage>
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSearchingPeriod}>
              <FolderSearch className="h-4 w-4" />
              {isSearchingPeriod ? t("actions.searching") : t("actions.search")}
            </Button>

            {periodSearchYear !== null && periodSearchMonth !== null && (
              <Button type="button" variant="outline" onClick={onClearSearch}>
                {t("actions.clearSearch")}
              </Button>
            )}
          </form>
        </Form>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        <Section
          icon={<CalendarDays className="h-4 w-4" />}
          title={t("sections.currentMonth")}
          emptyText={t("sections.currentMonthEmpty")}
          notes={monthNotes}
          locale={locale}
          onOpenNote={onOpenNote}
        />

        <Section
          icon={<FileText className="h-4 w-4" />}
          title={t("sections.general")}
          emptyText={t("sections.generalEmpty")}
          notes={generalNotes}
          locale={locale}
          onOpenNote={onOpenNote}
        />

        {periodSearchYear !== null && periodSearchMonth !== null && (
          <Section
            icon={<FolderSearch className="h-4 w-4" />}
            title={t("sections.searchResult", {
              month: String(periodSearchMonth).padStart(2, "0"),
              year: periodSearchYear,
            })}
            emptyText={t("sections.searchEmpty")}
            notes={periodSearchNotes}
            locale={locale}
            onOpenNote={onOpenNote}
          />
        )}
      </div>
    </div>
  );
}
