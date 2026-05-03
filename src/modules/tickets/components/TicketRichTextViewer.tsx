"use client";

import { cn } from "@/shared/lib/utils";

interface TicketRichTextViewerProps {
  html: string;
  className?: string;
}

export function TicketRichTextViewer({ html, className }: TicketRichTextViewerProps) {
  return (
    <div className={cn("ql-snow", className)}>
      <div className="ql-editor p-0" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

