"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFormState } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { noteEditorSchema, type NoteEditorFormData } from "../schemas/notes.schemas";
import type { Note } from "../types/notes.types";

interface NotesEditorProps {
  note: Note;
  noteTabs: Note[];
  isSubmitting: boolean;
  onSelectNote: (noteId: number) => void;
  onCreateInCurrentContext: () => Promise<void>;
  onBack: () => void;
  onSave: (noteId: number, title: string, content: string) => Promise<void>;
  onDelete: (noteId: number) => Promise<void>;
  onDirtyChange?: (isDirty: boolean) => void;
}

function normalizeHtml(html: string): string {
  return html.trim();
}

type PendingAction =
  | { type: "select-note"; noteId: number }
  | { type: "back-to-list" }
  | { type: "create-in-context" };

export function NotesEditor({
  note,
  noteTabs,
  isSubmitting,
  onSelectNote,
  onCreateInCurrentContext,
  onBack,
  onSave,
  onDelete,
  onDirtyChange,
}: NotesEditorProps) {
  const t = useTranslations("notes");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUnsavedDialogOpen, setIsUnsavedDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const form = (useForm<NoteEditorFormData>({
    // @ts-ignore - Temporary Zod v4 resolver typing mismatch
    resolver: zodResolver(noteEditorSchema),
    defaultValues: {
      title: note.title,
      content: note.content,
    },
  }) as unknown) as UseFormReturn<NoteEditorFormData>;

  const { isDirty } = useFormState({ control: form.control });

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    form.reset({
      title: note.title,
      content: note.content,
    });
  }, [form, note.content, note.id, note.title]);

  const onSubmit = form.handleSubmit(async (data) => {
    const nextTitle = data.title.trim();
    const nextContent = normalizeHtml(data.content);

    await onSave(note.id, nextTitle, nextContent);
    form.reset({
      title: nextTitle,
      content: nextContent,
    });
    onDirtyChange?.(false);
  });

  const executeAction = async (action: PendingAction) => {
    switch (action.type) {
      case "select-note":
        onSelectNote(action.noteId);
        return;
      case "back-to-list":
        onBack();
        return;
      case "create-in-context":
        await onCreateInCurrentContext();
        return;
    }
  };

  const requestAction = async (action: PendingAction) => {
    if (action.type === "select-note" && action.noteId === note.id) {
      return;
    }

    if (isDirty) {
      setPendingAction(action);
      setIsUnsavedDialogOpen(true);
      return;
    }

    await executeAction(action);
  };

  const handleConfirmDiscardChanges = async () => {
    const action = pendingAction;

    setIsUnsavedDialogOpen(false);
    setPendingAction(null);
    form.reset({
      title: note.title,
      content: note.content,
    });
    onDirtyChange?.(false);

    if (!action) {
      return;
    }

    await executeAction(action);
  };

  const handleConfirmDelete = async () => {
    try {
      await onDelete(note.id);
      setIsDeleteDialogOpen(false);
    } catch {
      // Error feedback is handled by notes store and shown in widget.
    }
  };

  const resolveFormMessage = (message?: string) => {
    if (!message) return "";
    return t.has(message) ? t(message as never) : message;
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b px-3 py-2 md:px-4">
        <div className="overflow-x-auto pb-1">
          <div className="flex w-max items-center gap-2">
            {noteTabs.map((item) => (
              <Button
                key={item.id}
                type="button"
                size="sm"
                variant={item.id === note.id ? "default" : "outline"}
                className="max-w-[220px] shrink-0"
                onClick={() => {
                  void requestAction({ type: "select-note", noteId: item.id });
                }}
              >
                <span className="truncate">{item.title}</span>
              </Button>
            ))}
            <Button
              type="button"
              size="sm"
              disabled={isSubmitting}
              className="shrink-0 bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-500 dark:text-amber-950 dark:hover:bg-amber-400"
              onClick={() => {
                void requestAction({ type: "create-in-context" });
              }}
            >
              <Plus className="h-4 w-4" />
              {t("actions.newBlock")}
            </Button>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={onSubmit}
          className="flex min-h-0 flex-1 flex-col gap-3 px-3 py-3 md:px-4"
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t("editor.titleLabel")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    maxLength={200}
                    placeholder={t("editor.titlePlaceholder")}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage>
                  {resolveFormMessage(fieldState.error?.message)}
                </FormMessage>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field, fieldState }) => (
              <FormItem className="flex min-h-0 flex-1 flex-col">
                <FormLabel>{t("editor.contentLabel")}</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={12}
                    placeholder={t("editor.contentPlaceholder")}
                    disabled={isSubmitting}
                    className="w-full resize-none"
                  />
                </FormControl>
                <FormMessage>
                  {resolveFormMessage(fieldState.error?.message)}
                </FormMessage>
              </FormItem>
            )}
          />

          <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  void requestAction({ type: "back-to-list" });
                }}
                disabled={isSubmitting}
              >
                <ArrowLeft className="h-4 w-4" />
                {t("actions.back")}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={isSubmitting}
              >
                <Trash2 className="h-4 w-4" />
                {t("actions.delete")}
              </Button>
            </div>

            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4" />
              {isSubmitting ? t("actions.saving") : t("actions.save")}
            </Button>
          </div>
        </form>
      </Form>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("actions.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isSubmitting}
              onClick={() => void handleConfirmDelete()}
            >
              {t("actions.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isUnsavedDialogOpen}
        onOpenChange={(open) => {
          setIsUnsavedDialogOpen(open);
          if (!open) {
            setPendingAction(null);
          }
        }}
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
              onClick={() => {
                void handleConfirmDiscardChanges();
              }}
            >
              {t("unsavedDialog.discardAndContinue")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
