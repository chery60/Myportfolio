"use client";

import { useRef } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** YouTube video id, e.g. "ZfmJpMIkmGc" */
  videoId: string;
  title: string;
  /** Shown under the title, e.g. "4:32" */
  duration?: string;
}

/**
 * The full walkthrough, in a dialog.
 *
 * Radix unmounts dialog content on close, so the iframe goes with it and the
 * audio stops — there is no pause handling to get wrong. Nothing is requested
 * from YouTube until the dialog is actually opened, which is what keeps this
 * off the page's initial load.
 */
export function WalkthroughModal({
  open,
  onOpenChange,
  videoId,
  title,
  duration,
}: Props) {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={contentRef}
        tabIndex={-1}
        className="max-w-3xl gap-3 p-4 sm:p-5"
        // An iframe is tabbable, so Radix's default autofocus would land inside
        // the YouTube player — and every keystroke after that, Escape included,
        // would go to the cross-origin frame instead of closing the dialog.
        // Park focus on the dialog itself and let the visitor tab in.
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          contentRef.current?.focus();
        }}
      >
        <DialogHeader className="pr-8">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Full walkthrough{duration ? ` · ${duration}` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted">
          <iframe
            className="absolute inset-0 h-full w-full"
            // nocookie host, and autoplay only because opening this was a
            // deliberate user gesture.
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
