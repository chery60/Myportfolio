import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import styles from "./notebook-button.module.css";

/** A tiny open sketchbook with a ribbon bookmark hanging from its spine. */
function NotebookIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 20 16" fill="none" aria-hidden="true">
      <path
        d="M10 3.2C7.8 1.8 4.6 1.6 2 2.4V13c2.6-.8 5.8-.6 8 .8M10 3.2c2.2-1.4 5.4-1.6 8-.8V13c-2.6-.8-5.8-.6-8 .8M10 3.2v10.6"
        fill="#fffdf8"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M4.2 5.4h3.6M4.2 7.4h3.6M4.2 9.4h2.6" stroke="var(--notebook-pencil)" strokeWidth="0.9" strokeLinecap="round" />
      <path className={styles.ribbon} d="M10.7 12.9v2.8l.9-.8.9.8v-3" fill="var(--notebook-marker)" />
    </svg>
  );
}

/**
 * Opens the project book. Made of the book's own materials (paper, a strip of
 * tape, pencil-blue handwriting), so it previews what it opens. Accepts the
 * props and ref a Radix trigger passes when it is used with `asChild`.
 */
export function NotebookButton({ className, ...props }: ComponentProps<"button">) {
  return (
    <button type="button" className={cn(styles.button, className)} {...props}>
      <span className={styles.tape} aria-hidden="true" />
      <NotebookIcon />
      <span className={styles.label}>Open notebook</span>
    </button>
  );
}
