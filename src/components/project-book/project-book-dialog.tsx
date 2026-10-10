"use client";

import { Rise } from "cube-motion/react";
import { type MouseEvent, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { REDUCED_MOTION_QUERY } from "@/components/use-media-query";
import { flattenPages } from "@/lib/book/pages";
import type { ProjectBook as ProjectBookData } from "@/lib/book/types";
import { cn } from "@/lib/utils";
import { NotebookButton } from "./notebook-button";
import { ProjectBook } from "./project-book";

interface ProjectBookDialogProps {
  book: ProjectBookData;
  /**
   * next/font variables for the book's typefaces. The dialog is portalled out
   * of the page, so it carries its own copy, as does the button.
   */
  fontClassName: string;
}

/*
 * A big sheet in the page colour: the book sizes itself to the viewport inside
 * it (project-book.module.css). Overflow stays visible so the magnifying glass
 * can lie across the sheet's edge, except on short screens, where the sheet
 * scrolls instead. `sm:max-w-*` overrides the base dialog's `sm:max-w-lg`.
 */
const SHEET_CLASSES = [
  "w-[calc(100vw-2rem)] max-w-[1440px] sm:max-w-[1440px] gap-0 rounded-2xl p-0",
  "motion-reduce:data-[state=open]:zoom-in-100 motion-reduce:data-[state=closed]:zoom-out-100",
  "[@media(max-height:600px)]:max-h-[calc(100dvh-2rem)] [@media(max-height:600px)]:overflow-y-auto [@media(max-height:600px)]:overflow-x-hidden",
].join(" ");

/** The id in an in-page href (`#id`), decoded where it can be: a stray `%` cannot. */
function anchorId(href: string): string | null {
  if (!href.startsWith("#") || href.length < 2) {
    return null;
  }
  const raw = href.slice(1);
  try {
    return decodeURIComponent(raw);
  } catch {
    // Malformed escapes (`#100%`): the id is the text as written.
    return raw;
  }
}

/** The id an in-page link points to, if the click was on one. */
function inPageLinkTarget(event: MouseEvent<HTMLElement>): string | null {
  if (!(event.target instanceof Element)) {
    return null;
  }
  return anchorId(event.target.closest("a")?.getAttribute("href") ?? "");
}

/** Escape pressed on the magnifying glass belongs to the glass: it puts itself away. */
function isFromGlass(event: KeyboardEvent): boolean {
  return event.target instanceof Element && event.target.closest("[data-glass]") !== null;
}

/** Scrolls to a link's target and moves focus there, so reading carries on from it. */
function goToElement(id: string) {
  const target = document.getElementById(id);
  if (!target) {
    return;
  }
  const behavior = window.matchMedia(REDUCED_MOTION_QUERY).matches ? "auto" : "smooth";
  // On the next frame, once the dialog has let go of the page's scroll lock.
  requestAnimationFrame(() => {
    target.scrollIntoView({ behavior, block: "start" });
    // A section is not normally focusable: let it take focus, but not a Tab stop.
    if (!target.hasAttribute("tabindex")) {
      target.setAttribute("tabindex", "-1");
    }
    target.focus({ preventScroll: true });
  });
}

/**
 * The project book, opened in a large dialog from a small paper button that
 * sits beside the case study's title.
 */
export function ProjectBookDialog({ book, fontClassName }: ProjectBookDialogProps) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  /** An in-page link clicked inside the book: scrolled to once the dialog closes. */
  const pendingAnchor = useRef<string | null>(null);
  const pageCount = useMemo(() => flattenPages(book).length, [book]);

  // Focus the pages rather than the close button, so the arrow keys turn them straight away.
  const handleOpenAutoFocus = (event: Event) => {
    event.preventDefault();
    contentRef.current?.querySelector<HTMLElement>("[data-book-stage]")?.focus();
  };

  const handleEscapeKeyDown = (event: KeyboardEvent) => {
    if (isFromGlass(event)) {
      event.preventDefault();
    }
  };

  const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    const id = inPageLinkTarget(event);
    if (!id) {
      return;
    }
    event.preventDefault();
    pendingAnchor.current = id;
    setOpen(false);
  };

  const handleCloseAutoFocus = (event: Event) => {
    const id = pendingAnchor.current;
    if (!id) {
      return;
    }
    pendingAnchor.current = null;
    event.preventDefault();
    goToElement(id);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <NotebookButton className={fontClassName} />
      </DialogTrigger>
      <DialogContent
        ref={contentRef}
        className={cn(fontClassName, SHEET_CLASSES)}
        onOpenAutoFocus={handleOpenAutoFocus}
        onEscapeKeyDown={handleEscapeKeyDown}
        onCloseAutoFocus={handleCloseAutoFocus}
        onClickCapture={handleClickCapture}
      >
        <DialogHeader className="gap-1 px-6 pt-5 pr-14 text-left sm:px-8 sm:pt-6 sm:text-left">
          <DialogTitle className="text-lg font-semibold tracking-tight">{book.title}</DialogTitle>
          <DialogDescription>{`Project notebook, ${pageCount} pages`}</DialogDescription>
        </DialogHeader>
        <Rise>
          <ProjectBook book={book} />
        </Rise>
      </DialogContent>
    </Dialog>
  );
}
