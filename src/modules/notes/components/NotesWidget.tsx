"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Maximize2, Minimize2, NotebookPen, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { cn } from "@/shared/lib/utils";
import { NotesCreateDialog } from "./NotesCreateDialog";
import { NotesEditor } from "./NotesEditor";
import { NotesList } from "./NotesList";
import { useNotesModule } from "../hooks/useNotes.hooks";
import type { Note, NotesContext } from "../types/notes.types";

function resolveNoteContext(note: Note): NotesContext {
  if (note.year === null || note.month === null) {
    return {
      type: "general",
      year: null,
      month: null,
    };
  }

  return {
    type: "period",
    year: note.year,
    month: note.month,
  };
}

export function NotesWidget() {
  const t = useTranslations("notes");
  const isMobile = useIsMobile();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isUnsavedCloseDialogOpen, setIsUnsavedCloseDialogOpen] = useState(false);

  const {
    isOpen,
    isExpanded,
    view,
    isSubmitting,
    isLoading,
    monthNotes,
    generalNotes,
    periodSearchNotes,
    periodSearchYear,
    periodSearchMonth,
    tabs,
    activeNote,
    isSearchingPeriod,
    error,
    togglePanel,
    closePanel,
    toggleExpanded,
    setView,
    selectNote,
    backToList,
    searchByPeriod,
    clearPeriodSearch,
    createNote,
    createInContext,
    updateNote,
    deleteNote,
    clearError,
  } = useNotesModule();

  const panelClassName = useMemo(() => {
    if (isMobile) {
      return cn(
        "inset-x-2 bottom-2",
        isExpanded ? "top-2" : "top-[5.5rem]",
      );
    }

    return cn(
      "bottom-4 right-4",
      isExpanded
        ? "h-[min(88dvh,860px)] w-[min(980px,calc(100vw-2rem))]"
        : "h-[min(75dvh,640px)] w-[min(460px,calc(100vw-2rem))]",
    );
  }, [isExpanded, isMobile]);

  const errorMessage = !error?.message
    ? null
    : t.has(error.message)
      ? t(error.message as never)
      : error.message;

  const handleClosePanelRequest = () => {
    if (view === "editor" && hasUnsavedChanges) {
      setIsUnsavedCloseDialogOpen(true);
      return;
    }

    closePanel();
  };

  const handleConfirmClosePanel = () => {
    setIsUnsavedCloseDialogOpen(false);
    setHasUnsavedChanges(false);
    closePanel();
  };

  const handleCreateInCurrentContext = async () => {
    if (!activeNote) return;

    const context = resolveNoteContext(activeNote);

    const title =
      context.type === "general"
        ? t("defaults.generalTitle")
        : t("defaults.periodTitle", {
            month: String(context.month ?? new Date().getMonth() + 1).padStart(2, "0"),
            year: context.year ?? new Date().getFullYear(),
          });

    await createInContext(context, title);
  };

  const content =
    view === "editor" && activeNote ? (
      <NotesEditor
        note={activeNote}
        noteTabs={tabs}
        isSubmitting={isSubmitting}
        onSelectNote={selectNote}
        onCreateInCurrentContext={handleCreateInCurrentContext}
        onBack={backToList}
        onDirtyChange={setHasUnsavedChanges}
        onSave={async (noteId, title, content) => {
          await updateNote(noteId, title, content);
        }}
        onDelete={deleteNote}
      />
    ) : (
      <NotesList
        monthNotes={monthNotes}
        generalNotes={generalNotes}
        periodSearchNotes={periodSearchNotes}
        periodSearchYear={periodSearchYear}
        periodSearchMonth={periodSearchMonth}
        isLoading={isLoading}
        isSearchingPeriod={isSearchingPeriod}
        onSearch={searchByPeriod}
        onClearSearch={clearPeriodSearch}
        onCreate={() => setIsCreateDialogOpen(true)}
        onOpenNote={(noteId) => {
          selectNote(noteId);
          setView("editor");
        }}
      />
    );

  return (
    <>
      {!isOpen && (
        <div className="pointer-events-none fixed right-4 bottom-4 z-50">
          <Button
            type="button"
            size="icon"
            className="pointer-events-auto h-12 w-12 rounded-full shadow-lg"
            aria-label={t("floating.openAriaLabel")}
            onClick={togglePanel}
          >
            <NotebookPen className="h-5 w-5" />
          </Button>
        </div>
      )}

      {isOpen && (
        <div
          className={cn(
            "fixed z-50 flex min-h-0 flex-col overflow-hidden rounded-xl border bg-background shadow-2xl transition-all duration-200",
            panelClassName,
          )}
        >
          <div className="flex items-start justify-between gap-3 border-b bg-primary/10 px-3 py-3 md:px-4">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold md:text-base">{t("panel.title")}</h3>
              <p className="truncate text-xs text-muted-foreground md:text-sm">{t("panel.subtitle")}</p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={isExpanded ? t("floating.shrinkAriaLabel") : t("floating.expandAriaLabel")}
                onClick={toggleExpanded}
              >
                {isExpanded ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t("floating.closeAriaLabel")}
                onClick={handleClosePanelRequest}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {errorMessage && (
            <div className="border-b border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive md:px-4">
              <div className="flex items-center justify-between gap-2">
                <span>{errorMessage}</span>
                <Button type="button" variant="ghost" size="sm" onClick={clearError}>
                  {t("actions.dismissError")}
                </Button>
              </div>
            </div>
          )}

          <div className="min-h-0 flex-1">
            {isLoading && tabs.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <Spinner className="h-5 w-5" />
              </div>
            ) : (
              content
            )}
          </div>
        </div>
      )}

      <NotesCreateDialog
        open={isCreateDialogOpen}
        isSubmitting={isSubmitting}
        onOpenChange={setIsCreateDialogOpen}
        onCreate={async (payload) => {
          await createNote(payload);
        }}
      />

      <AlertDialog
        open={isUnsavedCloseDialogOpen}
        onOpenChange={setIsUnsavedCloseDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("unsavedDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("unsavedDialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("unsavedDialog.stay")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmClosePanel}
            >
              {t("unsavedDialog.discardAndContinue")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
