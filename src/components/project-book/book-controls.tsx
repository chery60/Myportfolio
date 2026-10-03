import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./project-book.module.css";

interface BookControlsProps {
  counter: string;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  /** Extra tools after a divider, e.g. the magnifier toggle. */
  children?: ReactNode;
}

/**
 * The tool pill under the book: prev / position / next, then extra tools.
 * Ends use `aria-disabled` rather than `disabled` so a keyboard user's focus
 * stays on the button instead of falling to <body>.
 */
export function BookControls({ counter, canPrev, canNext, onPrev, onNext, children }: BookControlsProps) {
  return (
    <div className={styles.tools}>
      <button
        type="button"
        className={styles.tool}
        aria-label="Previous page"
        aria-disabled={!canPrev}
        onClick={() => canPrev && onPrev()}
      >
        <ChevronLeft className="size-[18px]" aria-hidden="true" />
      </button>
      <span className={styles.counter}>{counter}</span>
      <button
        type="button"
        className={styles.tool}
        aria-label="Next page"
        aria-disabled={!canNext}
        onClick={() => canNext && onNext()}
      >
        <ChevronRight className="size-[18px]" aria-hidden="true" />
      </button>
      {children ? (
        <>
          <span className={styles.divider} aria-hidden="true" />
          {children}
        </>
      ) : null}
    </div>
  );
}
