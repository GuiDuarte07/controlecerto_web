"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  File,
  FileText,
  Image as ImageIcon,
  Paperclip,
  Play,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { cn } from "@/shared/lib/utils";
import type { TicketAttachment } from "../types/tickets.types";

function resolveIcon(contentType: string) {
  if (contentType.startsWith("image/")) return ImageIcon;
  if (contentType.includes("pdf") || contentType.includes("text")) return FileText;
  return File;
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function isImageAttachment(att: TicketAttachment) {
  return att.contentType.startsWith("image/")
    || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(att.fileName);
}

function isVideoAttachment(att: TicketAttachment) {
  return att.contentType.startsWith("video/")
    || /\.(mp4|webm|ogg|mov|m4v)$/i.test(att.fileName);
}

interface TicketAttachmentsListProps {
  attachments: TicketAttachment[];
  className?: string;
}

export function TicketAttachmentsList({
  attachments,
  className,
}: TicketAttachmentsListProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  const mediaAttachments = useMemo(
    () => attachments.filter((att) => isImageAttachment(att) || isVideoAttachment(att)),
    [attachments],
  );
  const fileAttachments = useMemo(
    () => attachments.filter((att) => !isImageAttachment(att) && !isVideoAttachment(att)),
    [attachments],
  );

  const activeMedia = mediaAttachments[currentMediaIndex];
  const hasMultipleMedia = mediaAttachments.length > 1;

  if (attachments.length === 0) return null;

  const openViewer = (index: number) => {
    setCurrentMediaIndex(index);
    setIsViewerOpen(true);
  };

  const showPrevious = () => {
    setCurrentMediaIndex((current) => {
      if (current === 0) return mediaAttachments.length - 1;
      return current - 1;
    });
  };

  const showNext = () => {
    setCurrentMediaIndex((current) => {
      if (current === mediaAttachments.length - 1) return 0;
      return current + 1;
    });
  };

  return (
    <div className={cn("space-y-2", className)}>
      {mediaAttachments.length > 0 ? (
        <div className="overflow-x-auto pb-1">
          <div className="flex w-max gap-2">
            {mediaAttachments.map((att, index) => {
              const isVideo = isVideoAttachment(att);
              return (
                <button
                  key={att.id}
                  type="button"
                  className="group relative h-28 w-44 overflow-hidden rounded-md border bg-muted/20"
                  onClick={() => openViewer(index)}
                >
                  {isVideo ? (
                    <div className="relative h-full w-full">
                      <video
                        src={att.url}
                        className="h-full w-full object-cover"
                        preload="metadata"
                        muted
                        playsInline
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={att.url}
                      alt={att.fileName}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {fileAttachments.length > 0 ? (
        <div className="space-y-2">
          {fileAttachments.map((att) => {
            const Icon = resolveIcon(att.contentType);
            return (
              <a
                key={att.id}
                href={att.url}
                target="_blank"
                rel="noreferrer"
                className="block"
              >
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <Paperclip className="h-4 w-4" />
                  <Icon className="h-4 w-4" />
                  <span className="truncate">{att.fileName}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {formatBytes(att.sizeBytes)}
                  </span>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </Button>
              </a>
            );
          })}
        </div>
      ) : null}

      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="!flex !max-h-[90vh] w-[95vw] max-w-[95vw] !flex-col !gap-2 p-4">
          <DialogHeader>
            <DialogTitle className="truncate pr-20">
              {activeMedia?.fileName ?? "Anexo"}
            </DialogTitle>
          </DialogHeader>

          {activeMedia ? (
            <div className="relative w-full overflow-hidden rounded-md border bg-black/80">
              {isImageAttachment(activeMedia) ? (
                <img
                  src={activeMedia.url}
                  alt={activeMedia.fileName}
                  className="max-h-[75vh] w-full object-contain"
                />
              ) : (
                <video
                  src={activeMedia.url}
                  className="aspect-video max-h-[75vh] w-full bg-black object-contain"
                  controls
                  autoPlay
                />
              )}

              {hasMultipleMedia ? (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    onClick={showPrevious}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={showNext}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              ) : null}

              <Button
                asChild
                type="button"
                variant="secondary"
                className="absolute right-3 top-3"
              >
                <a href={activeMedia.url} download target="_blank" rel="noreferrer">
                  <Download className="h-4 w-4" />
                  Baixar
                </a>
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

