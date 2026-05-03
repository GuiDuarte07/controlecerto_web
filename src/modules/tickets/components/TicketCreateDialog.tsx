"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Paperclip, Plus, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { createTicketSchema, type CreateTicketFormData } from "../schemas/tickets.schemas";

function normalizeHtml(html: string) {
  return (html ?? "").trim();
}

interface TicketCreateDialogProps {
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
  onCreate: (data: {
    subject: string;
    description: string;
    attachments: File[];
  }) => Promise<void>;
}

export function TicketCreateDialog({
  disabled,
  open: controlledOpen,
  onOpenChange,
  showTrigger = true,
  onCreate,
}: TicketCreateDialogProps) {
  const t = useTranslations("tickets");
  const [internalOpen, setInternalOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const form = useForm<CreateTicketFormData>({
    // @ts-expect-error -- Temporary Zod v4 resolver typing mismatch
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      subject: "",
      description: "",
      attachments: [],
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await onCreate({
        subject: data.subject.trim(),
        description: normalizeHtml(data.description),
        attachments: files,
      });
      toast.success(t("feedback.created"));
      form.reset({ subject: "", description: "", attachments: [] });
      setFiles([]);
      setOpen(false);
    } catch {
      toast.error(t("feedback.createError"));
    }
  });

  const resolveFormMessage = (message?: string) => {
    if (!message) return "";
    if (t.has(message)) {
      return t(message as never);
    }
    if (message.startsWith("tickets.")) {
      const normalized = message.replace(/^tickets\./, "");
      if (t.has(normalized)) {
        return t(normalized as never);
      }
    }
    return message;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {showTrigger ? (
        <DialogTrigger asChild>
          <Button type="button" disabled={disabled}>
            <Plus className="h-4 w-4" />
            {t("create.newTicket")}
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent forceMount className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("create.title")}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("create.subjectLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      maxLength={140}
                      placeholder={t("create.subjectPlaceholder")}
                      disabled={disabled}
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
              name="description"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("create.descriptionLabel")}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={8}
                      className="w-full resize-none"
                      placeholder={t("create.descriptionPlaceholder")}
                      disabled={disabled}
                    />
                  </FormControl>
                  <FormMessage>
                    {resolveFormMessage(fieldState.error?.message)}
                  </FormMessage>
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <div className="text-sm font-medium">{t("create.attachmentsLabel")}</div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    const selected = Array.from(event.target.files ?? []);
                    setFiles(selected);
                    form.setValue("attachments", selected, {
                      shouldDirty: true,
                      shouldTouch: true,
                      shouldValidate: true,
                    });
                    event.target.value = "";
                  }}
                  disabled={disabled}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={disabled}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className="inline-flex items-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    {t("create.attach")}
                  </span>
                </Button>
                <div className="text-xs text-muted-foreground">
                  {t("create.attachmentsHint")}
                </div>
              </div>

              {files.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {files.map((file) => (
                    <Button
                      key={`${file.name}-${file.size}`}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        setFiles((current) => {
                          const next = current.filter(
                            (f) => !(f.name === file.name && f.size === file.size),
                          );
                          form.setValue("attachments", next, {
                            shouldDirty: true,
                            shouldTouch: true,
                            shouldValidate: true,
                          });
                          return next;
                        });
                      }}
                      disabled={disabled}
                    >
                      <Paperclip className="h-4 w-4" />
                      <span className="max-w-[240px] truncate">{file.name}</span>
                      <X className="h-4 w-4" />
                    </Button>
                  ))}
                </div>
              ) : null}
            </div>

            <DialogFooter>
              <Button type="submit" disabled={disabled}>
                {t("create.submit")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

