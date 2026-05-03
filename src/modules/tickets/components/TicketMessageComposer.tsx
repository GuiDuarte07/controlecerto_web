"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Paperclip, Send, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/shared/components/ui/form";
import { Textarea } from "@/shared/components/ui/textarea";
import { createTicketMessageSchema, type CreateTicketMessageFormData } from "../schemas/tickets.schemas";

interface TicketMessageComposerProps {
  disabled?: boolean;
  onSend: (data: { body: string; attachments: File[] }) => Promise<void>;
}

export function TicketMessageComposer({ disabled, onSend }: TicketMessageComposerProps) {
  const t = useTranslations("tickets");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputId = useId();

  const form = useForm<CreateTicketMessageFormData>({
    // @ts-expect-error -- Temporary Zod v4 resolver typing mismatch
    resolver: zodResolver(createTicketMessageSchema),
    defaultValues: {
      body: "",
      attachments: [],
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await onSend({ body: data.body.trim(), attachments: files });
      form.reset({ body: "", attachments: [] });
      setFiles([]);
      toast.success(t("feedback.messageSent"));
    } catch {
      toast.error(t("feedback.sendMessageError"));
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-2">
        <FormField
          control={form.control}
          name="body"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  {...field}
                  rows={3}
                  disabled={disabled}
                  placeholder={t("detail.messagePlaceholder")}
                />
              </FormControl>
              <FormMessage>
                {fieldState.error?.message
                  ? t.has(fieldState.error.message)
                    ? t(fieldState.error.message as never)
                    : fieldState.error.message
                  : ""}
              </FormMessage>
            </FormItem>
          )}
        />

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
                <span className="max-w-[220px] truncate">{file.name}</span>
                <X className="h-4 w-4" />
              </Button>
            ))}
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-2">
          <input
            id={fileInputId}
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
          <Button asChild type="button" variant="outline" disabled={disabled}>
            <label htmlFor={fileInputId} className="inline-flex cursor-pointer items-center gap-2">
              <Paperclip className="h-4 w-4" />
              {t("detail.attach")}
            </label>
          </Button>

          <Button type="submit" disabled={disabled}>
            <Send className="h-4 w-4" />
            {t("detail.send")}
          </Button>
        </div>
      </form>
    </Form>
  );
}

